import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as AppleStrategy } from 'passport-apple'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 5001

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Initialize database
const initDB = async () => {
  try {
    const connection = await db.getConnection()
    console.log('Connected to MySQL database')
    connection.release()

    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        provider VARCHAR(50) DEFAULT 'local',
        provider_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        cuisine VARCHAR(100) DEFAULT 'International',
        image_url VARCHAR(500),
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        guests INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        special_requests TEXT,
        status ENUM('pending', 'confirmed', 'cancelled', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        total DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'khqr',
        status ENUM('pending', 'paid', 'cancelled', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        image_url VARCHAR(500),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('reservation', 'order', 'system') NOT NULL,
        reference_id INT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        menu_item_id INT NOT NULL,
        user_id INT,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    // Create admin user if not exists
    await db.execute(`
      INSERT IGNORE INTO users (email, password, name, role, provider) 
      VALUES ('admin@nekmak.com', 'admin9988', 'Admin', 'admin', 'local')
    `)

    // Seed menu items if empty
    const [menuCount] = await db.execute('SELECT COUNT(*) as count FROM menu_items')
    if (menuCount[0].count === 0) {
      const items = [
        // Asia Foods
        { name: 'Traditional Fish Amok', desc: 'Steamed fish in banana leaf with coconut curry', price: 12.00, cat: 'Foods', cuisine: 'Asia Foods', img: 'AsiaFoods/Foods/sharonang-fish-amok-921926_1920.jpg' },
        { name: 'Savory Beef Lok Lak', desc: 'Classic stir-fried beef with lime and pepper', price: 14.00, cat: 'Foods', cuisine: 'Asia Foods', img: 'AsiaFoods/Foods/kan_chansathya-khmer-9024474_1920.jpg' },
        { name: 'Khmer Red Curry', desc: 'Aromatic curry with chicken and sweet potatoes', price: 13.00, cat: 'Foods', cuisine: 'Asia Foods', img: 'AsiaFoods/Foods/kan_chansathya-khmer-food-3771719_1920.jpg' },
        { name: 'Palm Citrus Cooler', desc: 'Refreshing palm sugar and lime drink', price: 8.00, cat: 'Drinks', cuisine: 'Asia Foods', img: 'AsiaFoods/Drinks/pexels-mdsnmdsnmdsn-2691360.jpg' },
        { name: 'Coconut Rose Cake', desc: 'Soft sponge with coconut and rose cream', price: 14.00, cat: 'Desserts', cuisine: 'Asia Foods', img: 'AsiaFoods/Desert/image copy 2.png' },
        
        // Europe Foods
        { name: 'Signature Wagyu', desc: 'Premium 12oz Wagyu striploin, bone marrow jus', price: 65.00, cat: 'Foods', cuisine: 'Europe Foods', img: 'EroupFoods/Foods/alex-munsell-auIbTAcSH6E-unsplash.jpg' },
        { name: 'Margherita Royale', desc: 'Classic pizza with mozzarella and fresh basil', price: 20.00, cat: 'Pizza', cuisine: 'Europe Foods', img: 'EroupFoods/Pizza/daria-yakovleva-pizza-2068272_1920.jpg' },
        { name: 'Truffle Masterpiece', desc: 'Black truffle burger with caramelized onions', price: 27.00, cat: 'Burgers', cuisine: 'Europe Foods', img: 'EroupFoods/Burgers/pexels-the-castlebar-3902897-31148909.jpg' },
        { name: 'Black Gold Linguine', desc: 'Squid ink pasta with scallops and garlic', price: 32.00, cat: 'Pasta', cuisine: 'Europe Foods', img: 'EroupFoods/Pasta/nicholas-grande-d9jcPTRD9fo-unsplash.jpg' },
        { name: 'Vintage Cabernet', desc: 'Full-bodied red, notes of oak and cherry', price: 65.00, cat: 'Wines', cuisine: 'Europe Foods', img: 'EroupFoods/Wines/matthieu-joannon-6ciLddToTgM-unsplash.jpg' }
      ];

      for (const i of items) {
        await db.execute(
          'INSERT INTO menu_items (name, description, price, category, image_url, cuisine) VALUES (?, ?, ?, ?, ?, ?)',
          [i.name, i.desc, i.price, i.cat, i.img, i.cuisine]
        )
      }
      console.log('Complete menu assets seeded');
    }
  } catch (error) {
    console.error('Database initialization failed:', error.message)
  }
}

await initDB()

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(passport.initialize())
app.use('/assets/pictures', express.static(path.join(__dirname, '../Client/src/assets/pictures')))

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ message: 'Access token required' })

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' })
    req.user = user
    next()
  })
}

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

// Passport Strategies
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email])
      if (rows.length > 0) {
        return done(null, rows[0])
      }
      const [result] = await db.execute(
        'INSERT INTO users (email, name, provider, provider_id, role) VALUES (?, ?, ?, ?, ?)',
        [email, profile.displayName, 'google', profile.id, 'user']
      )
      const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId])
      return done(null, newUser[0])
    } catch (error) {
      return done(error, null)
    }
  }))
}

// Routes - Auth
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body
  try {
    const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email])
    if (existing.length > 0) return res.status(400).json({ message: 'User already exists' })
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, provider) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, 'user', 'local']
    )
    const token = jwt.sign({ id: result.insertId, email, role: 'user', name }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: result.insertId, email, name, role: 'user' } })
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' })
  }
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password])
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' })
    const user = rows[0]
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: 'Login failed' })
  }
})

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id, email: req.user.email, role: req.user.role, name: req.user.name }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.redirect(`http://localhost:5173/auth/callback?token=${token}`)
})

// Routes - User Profile & History
app.get('/api/profile', authenticateToken, async (req, res) => {
  const [rows] = await db.execute('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.id])
  res.json(rows[0])
})

app.patch('/api/profile', authenticateToken, async (req, res) => {
  const { name, email } = req.body
  try {
    await db.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id])
    res.json({ message: 'Profile updated' })
  } catch (error) {
    res.status(500).json({ message: 'Update failed' })
  }
})

app.get('/api/user/reservations', authenticateToken, async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM reservations WHERE user_id = ? ORDER BY date DESC, time DESC', [req.user.id])
  res.json(rows)
})

app.get('/api/user/orders', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.get('/api/notifications', authenticateToken, async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [req.user.id])
  res.json(rows)
})

app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
  res.json({ message: 'Read' })
})

// Routes - Menu & Reservations
app.get('/api/menu', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM menu_items WHERE available = TRUE')
  res.json(rows)
})

// Ensure menu item exists (used by rating flow)
app.post('/api/menu-items/ensure', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, category, cuisine, imageUrl } = req.body
    if (!name) return res.status(400).json({ message: 'Name required' })

    // Try find existing
    const [found] = await db.execute('SELECT id FROM menu_items WHERE name = ? LIMIT 1', [name])
    if (found.length > 0) {
      return res.json({ id: found[0].id })
    }

    const [result] = await db.execute(
      'INSERT INTO menu_items (name, description, price, category, cuisine, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, price || 0, category || 'Foods', cuisine || 'International', imageUrl || null]
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    console.error('Error ensuring menu item:', error)
    res.status(500).json({ message: 'Failed to ensure menu item' })
  }
})

// Submit a review for a menu item
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { menuItemId, rating, comment, isFavorite } = req.body
    if (!menuItemId || !rating) return res.status(400).json({ message: 'menuItemId and rating required' })
    const r = Number(rating)
    if (r < 1 || r > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' })

    await db.execute('INSERT INTO reviews (menu_item_id, user_id, rating, comment, is_favorite) VALUES (?, ?, ?, ?, ?)', [menuItemId, req.user?.id || null, r, comment || null, isFavorite ? 1 : 0])
    res.status(201).json({ message: 'Review saved' })
  } catch (error) {
    console.error('Error saving review:', error)
    res.status(500).json({ message: 'Failed to save review' })
  }
})

// Review summaries (average rating, count) per menu item
app.get('/api/reviews/summary', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT m.name, r.menu_item_id, ROUND(AVG(r.rating),1) AS average_rating, COUNT(r.id) AS rating_count
      FROM reviews r
      JOIN menu_items m ON m.id = r.menu_item_id
      GROUP BY r.menu_item_id
    `)
    res.json(rows)
  } catch (error) {
    console.error('Error fetching review summaries:', error)
    res.status(500).json({ message: 'Failed to load summaries' })
  }
})

app.post('/api/reservations', authenticateToken, async (req, res) => {
  const { date, time, guests, name, email, phone, specialRequests } = req.body
  try {
    const [result] = await db.execute(
      'INSERT INTO reservations (user_id, date, time, guests, name, email, phone, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, date, time, guests, name, email, phone, specialRequests]
    )
    
    // Notify admin
    const [admins] = await db.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1')
    if (admins.length > 0) {
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
        [admins[0].id, 'New Reservation', `${name} for ${guests} people on ${date}`, 'reservation', result.insertId]
      )
    }
    res.status(201).json({ message: 'Reservation created' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create reservation' })
  }
})

// Routes - Admin
app.get('/api/admin/reservations', authenticateToken, isAdmin, async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM reservations ORDER BY created_at DESC')
  res.json(rows)
})

app.patch('/api/admin/reservations/:id', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body
  try {
    const [resv] = await db.execute('SELECT user_id, date, time FROM reservations WHERE id = ?', [req.params.id])
    await db.execute('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id])
    
    // Notify customer
    if (resv.length > 0) {
      const title = status === 'confirmed' ? 'Booking Accepted!' : 'Booking Status Update'
      const dateValue = resv[0].date
      const timeValue = resv[0].time
      const bookingDate = new Date(dateValue)
      const formattedDate = bookingDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      const formattedTime = timeValue || ''
      const dateAndTime = formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate
      const msg = status === 'confirmed'
        ? `Your booking for ${dateAndTime} has been accepted.`
        : `Your booking for ${dateAndTime} is ${status}.`
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
        [resv[0].user_id, title, msg, 'reservation', req.params.id]
      )
    }
    res.json({ message: 'Updated' })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.patch('/api/admin/orders/:id', authenticateToken, isAdmin, async (req, res) => {
  const newStatus = req.body.status
  if (!newStatus) return res.status(400).json({ message: 'Status is required' })
  try {
    const [order] = await db.execute('SELECT user_id, total FROM orders WHERE id = ?', [req.params.id])
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' })

    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [newStatus, req.params.id])
    
    // Notify customer
    const title = newStatus === 'paid' ? 'Order Accepted!' : 'Order Status Update'
    const msg = newStatus === 'paid' 
      ? `Your order #${req.params.id} for $${order[0].total} has been accepted and is being prepared.` 
      : `Your order #${req.params.id} has been ${newStatus}.`
    
    await db.execute(
      'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
      [order[0].user_id, title, msg, 'order', req.params.id]
    )

    res.json({ message: 'Order status updated' })
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ message: 'Failed' })
  }
})

app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, email, role FROM users')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed to load users' })
  }
})

app.get('/api/admin/orders', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `)
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.get('/api/admin/menu', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM menu_items ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed to load menu items' })
  }
})

app.post('/api/admin/menu', authenticateToken, isAdmin, async (req, res) => {
  const { name, description, price, category, image_url, cuisine } = req.body
  try {
    await db.execute(
      'INSERT INTO menu_items (name, description, price, category, image_url, cuisine) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, category, image_url, cuisine || 'International']
    )
    res.status(201).json({ message: 'Created' })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.put('/api/admin/menu/:id', authenticateToken, isAdmin, async (req, res) => {
  const { name, description, price, category, image_url, cuisine } = req.body
  try {
    await db.execute(
      'UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, image_url = ?, cuisine = ? WHERE id = ?',
      [name, description, price, category, image_url, cuisine, req.params.id]
    )
    res.json({ message: 'Updated' })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.delete('/api/admin/menu/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    // fetch image path before deleting so we can remove the file
    const [rows] = await db.execute('SELECT image_url FROM menu_items WHERE id = ?', [req.params.id])
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Menu item not found' })
    }
    const imageUrl = rows[0].image_url

    const [result] = await db.execute('DELETE FROM menu_items WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' })
    }

    // attempt to delete file from disk if exists and points inside pictures folder
    try {
      if (imageUrl) {
        // only handle relative paths like Dishes/filename.jpg
        const safePath = path.normalize(imageUrl)
        const picturesRoot = path.join(__dirname, '../Client/src/assets/pictures')
        const fullPath = path.join(picturesRoot, safePath)
        if (fullPath.startsWith(picturesRoot) && fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
          console.log(`Deleted image file: ${fullPath}`)
        }
      }
    } catch (unlinkErr) {
      console.error('Failed to remove image file for deleted menu item:', unlinkErr)
    }

    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    res.status(500).json({ message: 'Failed to delete menu item' })
  }
})

app.patch('/api/admin/menu/:id/toggle', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [item] = await db.execute('SELECT available FROM menu_items WHERE id = ?', [req.params.id])
    if (item.length === 0) {
      return res.status(404).json({ message: 'Menu item not found' })
    }
    await db.execute('UPDATE menu_items SET available = ? WHERE id = ?', [!item[0].available, req.params.id])
    res.json({ message: 'Toggled', available: !item[0].available })
  } catch (error) {
    console.error('Error toggling availability:', error)
    res.status(500).json({ message: 'Failed to toggle availability' })
  }
})

app.post('/api/admin/upload-image', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { filename, base64Data } = req.body
    
    if (!filename || !base64Data) {
      console.error('Missing filename or base64Data')
      return res.status(400).json({ message: 'Filename and base64Data are required' })
    }
    
    console.log(`Uploading image: ${filename} (${base64Data.length} bytes)`)
    
    // Create Dishes folder if it doesn't exist
    const dishesDir = path.join(__dirname, '../Client/src/assets/pictures/Dishes')
    if (!fs.existsSync(dishesDir)) {
      console.log(`Creating directory: ${dishesDir}`)
      fs.mkdirSync(dishesDir, { recursive: true })
    }
    
    // Save the image file
    const imagePath = path.join(dishesDir, filename)
    const imageBuffer = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(imagePath, imageBuffer)
    console.log(`Image saved successfully: ${imagePath}`)
    
    // Return the relative path for database storage
    const relativePath = `Dishes/${filename}`
    res.json({ message: 'Image uploaded', image_url: relativePath })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ message: `Failed to upload image: ${error.message}` })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Admin routes available at http://localhost:${PORT}/api/admin/*`)
  console.log(`Image upload available at http://localhost:${PORT}/api/admin/upload-image`)
})
