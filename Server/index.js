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

    // Wishlist table (no FK on menu_item_id — items may use synthetic IDs from local/display data)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        menu_item_name VARCHAR(255) NOT NULL,
        menu_item_price DECIMAL(10, 2) NOT NULL,
        menu_item_image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    // Drop FK on menu_item_id if it exists (from previous schema version)
    try { await db.execute('ALTER TABLE wishlist DROP FOREIGN KEY wishlist_ibfk_2') } catch(e) {}

    // Categories table (DB-driven menu groupings)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        cuisine_type ENUM('asia','europe') NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tables (physical restaurant tables)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_number VARCHAR(10) NOT NULL UNIQUE,
        capacity INT NOT NULL DEFAULT 4,
        location VARCHAR(100) DEFAULT 'Main Hall',
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Item options (customization types per dish)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS item_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        menu_item_id INT NOT NULL,
        option_name VARCHAR(100) NOT NULL,
        option_type ENUM('single','multi') DEFAULT 'single',
        is_required BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
      )
    `)

    // Option values (choices within an option)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS option_values (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_option_id INT NOT NULL,
        value_name VARCHAR(100) NOT NULL,
        extra_price DECIMAL(10, 2) DEFAULT 0.00,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (item_option_id) REFERENCES item_options(id) ON DELETE CASCADE
      )
    `)

    // Admin action logs
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        action VARCHAR(255) NOT NULL,
        target_table VARCHAR(100),
        target_id INT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Add new columns to existing tables (use IF NOT EXISTS pattern with ALTER)
    try { await db.execute('ALTER TABLE menu_items ADD COLUMN station VARCHAR(50) DEFAULT NULL') } catch(e) {}
    try { await db.execute('ALTER TABLE menu_items ADD COLUMN spice_level INT DEFAULT NULL') } catch(e) {}
    try { await db.execute('ALTER TABLE menu_items ADD COLUMN is_vegetarian BOOLEAN DEFAULT FALSE') } catch(e) {}
    try { await db.execute('ALTER TABLE menu_items ADD COLUMN allergens VARCHAR(500) DEFAULT NULL') } catch(e) {}
    try { await db.execute('ALTER TABLE menu_items ADD COLUMN category_id INT DEFAULT NULL') } catch(e) {}
    try { await db.execute('ALTER TABLE reservations ADD COLUMN booking_type ENUM(\'regular\',\'event\') DEFAULT \'regular\'') } catch(e) {}
    try { await db.execute('ALTER TABLE reservations ADD COLUMN occasion_note TEXT DEFAULT NULL') } catch(e) {}
    try { await db.execute('ALTER TABLE reservations ADD COLUMN table_id INT DEFAULT NULL') } catch(e) {}
    try { await db.execute('ALTER TABLE orders ADD COLUMN order_type ENUM(\'dinein\',\'takeaway\') DEFAULT \'dinein\'') } catch(e) {}
    try { await db.execute('ALTER TABLE orders ADD COLUMN table_id INT DEFAULT NULL') } catch(e) {}
    try { await db.execute('ALTER TABLE orders ADD COLUMN kitchen_status VARCHAR(50) DEFAULT NULL') } catch(e) {}
    try { await db.execute('ALTER TABLE order_items ADD COLUMN selected_options JSON DEFAULT NULL') } catch(e) {}
    try { await db.execute('ALTER TABLE order_items ADD COLUMN station VARCHAR(50) DEFAULT NULL') } catch(e) {}

    // Coupons / Promotions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 10,
        min_orders INT DEFAULT 10,
        is_active BOOLEAN DEFAULT TRUE,
        valid_until DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // User coupon redemptions tracking
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        coupon_id INT NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
      )
    `)

    // Seed categories if empty
    const [catCount] = await db.execute('SELECT COUNT(*) as count FROM categories')
    if (catCount[0].count === 0) {
      const cats = [
        { name: 'Foods', cuisine_type: 'asia', sort_order: 1 },
        { name: 'Drinks', cuisine_type: 'asia', sort_order: 2 },
        { name: 'Desserts', cuisine_type: 'asia', sort_order: 3 },
        { name: 'Fruits', cuisine_type: 'asia', sort_order: 4 },
        { name: 'Vegetarian', cuisine_type: 'asia', sort_order: 5 },
        { name: 'Wines', cuisine_type: 'asia', sort_order: 6 },
        { name: 'Foods', cuisine_type: 'europe', sort_order: 1 },
        { name: 'Pizza', cuisine_type: 'europe', sort_order: 2 },
        { name: 'Burgers', cuisine_type: 'europe', sort_order: 3 },
        { name: 'Pasta', cuisine_type: 'europe', sort_order: 4 },
        { name: 'Drinks', cuisine_type: 'europe', sort_order: 5 },
        { name: 'Desserts', cuisine_type: 'europe', sort_order: 6 },
        { name: 'Wines', cuisine_type: 'europe', sort_order: 7 },
        { name: 'Garden', cuisine_type: 'europe', sort_order: 8 },
      ]
      for (const c of cats) {
        await db.execute('INSERT INTO categories (name, cuisine_type, sort_order) VALUES (?, ?, ?)', [c.name, c.cuisine_type, c.sort_order])
      }
    }

    // Seed tables if empty
    const [tableCount] = await db.execute('SELECT COUNT(*) as count FROM restaurant_tables')
    if (tableCount[0].count === 0) {
      const tables = [
        { num: 'T1', cap: 2, loc: 'Window' }, { num: 'T2', cap: 2, loc: 'Window' },
        { num: 'T3', cap: 4, loc: 'Main Hall' }, { num: 'T4', cap: 4, loc: 'Main Hall' },
        { num: 'T5', cap: 4, loc: 'Main Hall' }, { num: 'T6', cap: 6, loc: 'Main Hall' },
        { num: 'T7', cap: 6, loc: 'VIP Corner' }, { num: 'T8', cap: 8, loc: 'VIP Corner' },
        { num: 'T9', cap: 2, loc: 'Terrace' }, { num: 'T10', cap: 4, loc: 'Terrace' },
        { num: 'VIP1', cap: 10, loc: 'Private Room' }, { num: 'VIP2', cap: 12, loc: 'Private Room' },
      ]
      for (const t of tables) {
        await db.execute('INSERT INTO restaurant_tables (table_number, capacity, location) VALUES (?, ?, ?)', [t.num, t.cap, t.loc])
      }
    }

    // Seed item customization options for seeded menu items
    const [optCount] = await db.execute('SELECT COUNT(*) as count FROM item_options')
    if (optCount[0].count === 0) {
      // Get menu items to attach options
      const [items] = await db.execute('SELECT id, name FROM menu_items')
      for (const item of items) {
        const itemId = item.id
        // Spice level option (for all items)
        const [optResult] = await db.execute(
          'INSERT INTO item_options (menu_item_id, option_name, option_type, is_required, sort_order) VALUES (?, ?, ?, ?, ?)',
          [itemId, 'Spice Level', 'single', false, 1]
        )
        await db.execute(
          'INSERT INTO option_values (item_option_id, value_name, extra_price, sort_order) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
          [optResult.insertId, 'Mild', 0, 1, optResult.insertId, 'Medium', 0, 2, optResult.insertId, 'Spicy', 0, 3]
        )

        // Station assignment based on category
        let station = 'grill'
        if (item.name.includes('Pizza') || item.name.includes('Margherita')) station = 'wok'
        else if (item.name.includes('Drink') || item.name.includes('Cooler') || item.name.includes('Wine') || item.name.includes('Cabernet')) station = 'bar'
        else if (item.name.includes('Cake') || item.name.includes('Dessert') || item.name.includes('Flan') || item.name.includes('Tart')) station = 'dessert'
        await db.execute('UPDATE menu_items SET station = ?, spice_level = CASE WHEN name LIKE ? THEN 2 WHEN name LIKE ? THEN 1 ELSE NULL END, is_vegetarian = CASE WHEN name LIKE ? THEN TRUE ELSE FALSE END WHERE id = ?', [station, '%Spicy%', '%Mild%', '%Vegetarian%', itemId])

        // For Europe items, add doneness option
        if (item.name.includes('Wagyu') || item.name.includes('Burger') || item.name.includes('Steak')) {
          const [donenessResult] = await db.execute(
            'INSERT INTO item_options (menu_item_id, option_name, option_type, is_required, sort_order) VALUES (?, ?, ?, ?, ?)',
            [itemId, 'Doneness', 'single', true, 2]
          )
          await db.execute(
            'INSERT INTO option_values (item_option_id, value_name, extra_price, sort_order) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
            [donenessResult.insertId, 'Rare', 0, 1, donenessResult.insertId, 'Medium Rare', 0, 2, donenessResult.insertId, 'Medium', 0, 3, donenessResult.insertId, 'Well Done', 0, 4]
          )
        }

        // For pasta/pizza, add sauce option
        if (item.name.includes('Pasta') || item.name.includes('Pizza') || item.name.includes('Linguine') || item.name.includes('Rigatoni')) {
          const [sauceResult] = await db.execute(
            'INSERT INTO item_options (menu_item_id, option_name, option_type, is_required, sort_order) VALUES (?, ?, ?, ?, ?)',
            [itemId, 'Extra Sauce', 'single', false, 3]
          )
          await db.execute(
            'INSERT INTO option_values (item_option_id, value_name, extra_price, sort_order) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
            [sauceResult.insertId, 'Tomato', 0, 1, sauceResult.insertId, 'Cream', 0.5, 2, sauceResult.insertId, 'Pesto', 1.0, 3]
          )
        }
      }
    }

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
  const [rows] = await db.execute(`
    SELECT r.*, t.table_number, t.location
    FROM reservations r
    LEFT JOIN restaurant_tables t ON t.id = r.table_id
    WHERE r.user_id = ?
    ORDER BY r.date DESC, r.time DESC
  `, [req.user.id])
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
  try {
    const [rows] = await db.execute('SELECT * FROM menu_items WHERE available = TRUE ORDER BY created_at DESC')
    // Attach options to each item
    for (const item of rows) {
      const [options] = await db.execute('SELECT * FROM item_options WHERE menu_item_id = ? ORDER BY sort_order', [item.id])
      for (const opt of options) {
        const [values] = await db.execute('SELECT * FROM option_values WHERE item_option_id = ? ORDER BY sort_order', [opt.id])
        opt.values = values
      }
      item.options = options
    }
    res.json(rows)
  } catch (error) {
    console.error('Menu fetch error:', error)
    res.status(500).json({ message: 'Failed' })
  }
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
      GROUP BY r.menu_item_id, m.name
    `)
    res.json(rows)
  } catch (error) {
    console.error('Error fetching review summaries:', error)
    res.status(500).json({ message: 'Failed to load summaries' })
  }
})

// ===================== CATEGORIES ROUTES =====================
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY cuisine_type, sort_order')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.post('/api/admin/categories', authenticateToken, isAdmin, async (req, res) => {
  const { name, cuisine_type, sort_order } = req.body
  try {
    await db.execute('INSERT INTO categories (name, cuisine_type, sort_order) VALUES (?, ?, ?)', [name, cuisine_type, sort_order || 0])
    res.status(201).json({ message: 'Created' })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.delete('/api/admin/categories/:id', authenticateToken, isAdmin, async (req, res) => {
  await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id])
  res.json({ message: 'Deleted' })
})

// ===================== TABLES ROUTES =====================
app.get('/api/tables', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM restaurant_tables ORDER BY table_number')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.get('/api/admin/tables', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM restaurant_tables ORDER BY table_number')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.get('/api/tables/available', async (req, res) => {
  try {
    const { date, time, guests } = req.query
    let query = 'SELECT * FROM restaurant_tables WHERE is_available = TRUE'
    const params = []
    if (guests) {
      query += ' AND capacity >= ?'
      params.push(parseInt(guests))
    }
    // Check if table is already booked for given date/time
    if (date && time) {
      query += ` AND id NOT IN (SELECT table_id FROM reservations WHERE date = ? AND time = ? AND status NOT IN ('cancelled','rejected'))`
      params.push(date, time)
    }
    query += ' ORDER BY capacity'
    const [rows] = await db.execute(query, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.post('/api/admin/tables', authenticateToken, isAdmin, async (req, res) => {
  const { table_number, capacity, location } = req.body
  try {
    await db.execute('INSERT INTO restaurant_tables (table_number, capacity, location) VALUES (?, ?, ?)', [table_number, capacity, location || 'Main Hall'])
    res.status(201).json({ message: 'Created' })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.delete('/api/admin/tables/:id', authenticateToken, isAdmin, async (req, res) => {
  await db.execute('DELETE FROM restaurant_tables WHERE id = ?', [req.params.id])
  res.json({ message: 'Deleted' })
})

app.patch('/api/admin/tables/:id', authenticateToken, isAdmin, async (req, res) => {
  const { table_number, capacity, location, is_available } = req.body
  try {
    await db.execute('UPDATE restaurant_tables SET table_number = COALESCE(?, table_number), capacity = COALESCE(?, capacity), location = COALESCE(?, location), is_available = COALESCE(?, is_available) WHERE id = ?', [table_number, capacity, location, is_available, req.params.id])
    res.json({ message: 'Updated' })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

// ===================== ITEM OPTIONS ROUTES =====================
app.get('/api/menu/:id/options', async (req, res) => {
  try {
    const [options] = await db.execute('SELECT * FROM item_options WHERE menu_item_id = ? ORDER BY sort_order', [req.params.id])
    for (const opt of options) {
      const [values] = await db.execute('SELECT * FROM option_values WHERE item_option_id = ? ORDER BY sort_order', [opt.id])
      opt.values = values
    }
    res.json(options)
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.post('/api/admin/menu/:id/options', authenticateToken, isAdmin, async (req, res) => {
  const { option_name, option_type, is_required, values } = req.body
  try {
    const [result] = await db.execute(
      'INSERT INTO item_options (menu_item_id, option_name, option_type, is_required) VALUES (?, ?, ?, ?)',
      [req.params.id, option_name, option_type || 'single', is_required || false]
    )
    if (values && Array.isArray(values)) {
      for (const v of values) {
        await db.execute('INSERT INTO option_values (item_option_id, value_name, extra_price) VALUES (?, ?, ?)', [result.insertId, v.value_name, v.extra_price || 0])
      }
    }
    res.status(201).json({ message: 'Created' })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

// ===================== ORDERS WITH NEW FIELDS =====================
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, total, paymentMethod, status: orderStatus, orderType, tableId, kitchenStatus } = req.body
  try {
    const [result] = await db.execute(
      'INSERT INTO orders (user_id, total, payment_method, status, order_type, table_id, kitchen_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, total, paymentMethod || 'khqr', orderStatus || 'pending', orderType || 'dinein', tableId || null, kitchenStatus || null]
    )
    const orderId = result.insertId
    
    for (const item of items) {
      let station = null
      let dbMenuItemId = null
      // Only use menuItemId if it's a real DB id (not a synthetic local id)
      if (item.menuItemId && item.menuItemId < 10000) {
        dbMenuItemId = item.menuItemId
        try {
          const [menuRows] = await db.execute('SELECT station FROM menu_items WHERE id = ?', [item.menuItemId])
          if (menuRows.length > 0) station = menuRows[0].station
        } catch (e) {}
      }
      await db.execute(
        'INSERT INTO order_items (order_id, menu_item_id, name, price, quantity, image_url, selected_options, station) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, dbMenuItemId, item.name, item.price, item.quantity, item.image_url || '', item.selectedOptions ? JSON.stringify(item.selectedOptions) : null, station]
      )
    }

    // Notify admin
    const [admins] = await db.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1')
    if (admins.length > 0) {
      const typeLabel = orderType === 'takeaway' ? 'Takeaway' : 'Dine-in'
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
        [admins[0].id, `New ${typeLabel} Order`, `Order #${orderId} for $${total} - ${typeLabel}`, 'order', orderId]
      )
    }

    res.status(201).json({ id: orderId, message: 'Order created' })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ message: 'Failed to create order' })
  }
})

// Update order kitchen status (real-time workflow: received → preparing → ready)
app.patch('/api/admin/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const { kitchen_status } = req.body
  if (!kitchen_status) return res.status(400).json({ message: 'kitchen_status required' })
  
  const validStatuses = ['received', 'preparing', 'ready']
  if (!validStatuses.includes(kitchen_status)) {
    return res.status(400).json({ message: 'Status must be: received, preparing, or ready' })
  }
  
  try {
    const [order] = await db.execute('SELECT user_id, total FROM orders WHERE id = ?', [req.params.id])
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' })
    
    await db.execute('UPDATE orders SET kitchen_status = ? WHERE id = ?', [kitchen_status, req.params.id])
    
    // If completed, also update main status
    if (kitchen_status === 'ready') {
      await db.execute('UPDATE orders SET status = ? WHERE id = ?', ['ready', req.params.id])
    }
    
    // Notify customer
    const statusLabels = { received: 'Received by Kitchen', preparing: 'Being Prepared', ready: 'Ready to Serve' }
    const title = statusLabels[kitchen_status] || kitchen_status
    const msg = kitchen_status === 'ready' 
      ? `Your order #${req.params.id} is ready! Please collect it at the counter.`
      : `Your order #${req.params.id} is now ${statusLabels[kitchen_status] || kitchen_status}.`
    
    await db.execute(
      'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
      [order[0].user_id, `🍳 ${title}`, msg, 'order', req.params.id]
    )
    
    res.json({ message: `Order #${req.params.id} marked as ${kitchen_status}` })
  } catch (error) {
    console.error('Error updating kitchen status:', error)
    res.status(500).json({ message: 'Failed' })
  }
})

// Get orders grouped by kitchen station (for admin)
app.get('/api/admin/kitchen', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.status NOT IN ('cancelled', 'rejected')
      ORDER BY o.created_at DESC
    `)
    
    // Get order items with station info
    const result = []
    for (const order of orders) {
      const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id])
      result.push({ ...order, items })
    }
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

// ===================== RESERVATIONS WITH NEW FIELDS =====================
app.post('/api/reservations', authenticateToken, async (req, res) => {
  const { date, time, guests, name, email, phone, specialRequests, bookingType, occasionNote, tableId } = req.body
  try {
    const [result] = await db.execute(
      'INSERT INTO reservations (user_id, date, time, guests, name, email, phone, special_requests, booking_type, occasion_note, table_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, date, time, guests, name, email, phone, specialRequests, bookingType || 'regular', occasionNote || null, tableId || null]
    )
    
    // If table assigned, mark it as unavailable
    if (tableId) {
      await db.execute('UPDATE restaurant_tables SET is_available = FALSE WHERE id = ?', [tableId])
    }

    // Notify admin
    const [admins] = await db.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1')
    if (admins.length > 0) {
      const typeLabel = bookingType === 'event' ? 'Event Booking' : 'Reservation'
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
        [admins[0].id, `New ${typeLabel}`, `${name} for ${guests} people on ${date}${occasionNote ? ' - ' + occasionNote : ''}`, 'reservation', result.insertId]
      )
    }
    res.status(201).json({ id: result.insertId, message: 'Reservation created' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create reservation' })
  }
})

// Routes - Admin
app.get('/api/admin/reservations', authenticateToken, isAdmin, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT r.*, t.table_number, t.location
    FROM reservations r
    LEFT JOIN restaurant_tables t ON t.id = r.table_id
    ORDER BY r.created_at DESC
  `)
  res.json(rows)
})

// Mark a reservation as paid (by customer)
app.patch('/api/reservations/:id/pay', authenticateToken, async (req, res) => {
  const { id } = req.params
  try {
    const [resv] = await db.execute('SELECT * FROM reservations WHERE id = ? AND user_id = ?', [id, req.user.id])
    if (resv.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' })
    }
    if (resv[0].status !== 'pending') {
      return res.status(400).json({ message: 'Reservation is not in pending status' })
    }
    await db.execute('UPDATE reservations SET status = ? WHERE id = ?', ['confirmed', id])
    
    // Notify admin
    const [admins] = await db.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1')
    if (admins.length > 0) {
      const r = resv[0]
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
        [admins[0].id, '💳 Reservation Paid', `${r.name} paid for reservation #${id} - ${r.guests} guests on ${r.date}`, 'reservation', id]
      )
    }
    res.json({ message: 'Payment confirmed', status: 'confirmed' })
  } catch (error) {
    console.error('Error processing reservation payment:', error)
    res.status(500).json({ message: 'Failed to process payment' })
  }
})

app.patch('/api/admin/reservations/:id', authenticateToken, isAdmin, async (req, res) => {
  const { status, table_id } = req.body
  try {
    const [resv] = await db.execute('SELECT user_id, date, time, table_id FROM reservations WHERE id = ?', [req.params.id])
    if (resv.length === 0) return res.status(404).json({ message: 'Reservation not found' })
    
    if (status) {
      await db.execute('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id])
    }
    
    // Handle table assignment
    if (table_id !== undefined && table_id !== null) {
      // Free the old table if it was assigned
      const oldTableId = resv[0].table_id
      if (oldTableId && oldTableId !== table_id) {
        await db.execute('UPDATE restaurant_tables SET is_available = TRUE WHERE id = ?', [oldTableId])
      }
      // Assign the new table
      await db.execute('UPDATE reservations SET table_id = ? WHERE id = ?', [table_id, req.params.id])
      await db.execute('UPDATE restaurant_tables SET is_available = FALSE WHERE id = ?', [table_id])
    } else if (table_id === null) {
      // Unassign table
      const oldTableId = resv[0].table_id
      if (oldTableId) {
        await db.execute('UPDATE restaurant_tables SET is_available = TRUE WHERE id = ?', [oldTableId])
      }
      await db.execute('UPDATE reservations SET table_id = NULL WHERE id = ?', [req.params.id])
    }
    
    // Re-fetch updated reservation
    const [updated] = await db.execute(`
      SELECT r.*, t.table_number, t.location
      FROM reservations r
      LEFT JOIN restaurant_tables t ON t.id = r.table_id
      WHERE r.id = ?
    `, [req.params.id])
    
    // Notify customer
    if (resv.length > 0 && status) {
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
      const tableInfo = updated[0]?.table_number ? ` at Table ${updated[0].table_number} (${updated[0].location || 'Main Hall'})` : ''
      const msg = status === 'confirmed'
        ? `Your booking for ${dateAndTime} has been accepted${tableInfo}.`
        : `Your booking for ${dateAndTime} is ${status}.`
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
        [resv[0].user_id, title, msg, 'reservation', req.params.id]
      )
    } else if (resv.length > 0 && table_id !== undefined) {
      // Table assignment change notification
      const tableInfo = updated[0]?.table_number ? `Table ${updated[0].table_number} (${updated[0].location || 'Main Hall'})` : 'no table'
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
        [resv[0].user_id, 'Table Assignment Updated', `Your table has been updated to ${tableInfo}.`, 'reservation', req.params.id]
      )
    }
    
    res.json({ message: 'Updated', reservation: updated[0] || null })
  } catch (error) {
    console.error('Error updating reservation:', error)
    res.status(500).json({ message: 'Failed' })
  }
})

app.patch('/api/admin/orders/:id', authenticateToken, isAdmin, async (req, res) => {
  const { status, orderType, tableId } = req.body
  if (!status) return res.status(400).json({ message: 'Status is required' })
  try {
    const [order] = await db.execute('SELECT user_id, total FROM orders WHERE id = ?', [req.params.id])
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' })

    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id])
    if (orderType) await db.execute('UPDATE orders SET order_type = ? WHERE id = ?', [orderType, req.params.id])
    if (tableId) await db.execute('UPDATE orders SET table_id = ? WHERE id = ?', [tableId, req.params.id])
    
    // Notify customer
    const title = status === 'paid' ? 'Order Accepted!' : 'Order Status Update'
    const msg = status === 'paid' 
      ? `Your order #${req.params.id} for $${order[0].total} has been accepted and is being prepared.` 
      : `Your order #${req.params.id} has been ${status}.`
    
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
  const { name, description, price, category, image_url, cuisine, station, spice_level, is_vegetarian, allergens } = req.body
  try {
    const [result] = await db.execute(
      'INSERT INTO menu_items (name, description, price, category, image_url, cuisine, station, spice_level, is_vegetarian, allergens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, category, image_url, cuisine || 'International', station || null, spice_level || null, is_vegetarian || false, allergens || null]
    )
    
    // Auto-create default spice level option
    const [optResult] = await db.execute(
      'INSERT INTO item_options (menu_item_id, option_name, option_type, is_required, sort_order) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, 'Spice Level', 'single', false, 1]
    )
    await db.execute(
      'INSERT INTO option_values (item_option_id, value_name, extra_price, sort_order) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
      [optResult.insertId, 'Mild', 0, 1, optResult.insertId, 'Medium', 0, 2, optResult.insertId, 'Spicy', 0, 3]
    )
    
    res.status(201).json({ message: 'Created', id: result.insertId })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

app.put('/api/admin/menu/:id', authenticateToken, isAdmin, async (req, res) => {
  const { name, description, price, category, image_url, cuisine, station, spice_level, is_vegetarian, allergens } = req.body
  try {
    await db.execute(
      'UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, image_url = ?, cuisine = ?, station = ?, spice_level = ?, is_vegetarian = ?, allergens = ? WHERE id = ?',
      [name, description, price, category, image_url, cuisine, station || null, spice_level || null, is_vegetarian || false, allergens || null, req.params.id]
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

// ===================== WISHLIST ROUTES =====================
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM wishlist WHERE user_id = ? ORDER BY created_at DESC', [req.user.id])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed to load wishlist' })
  }
})

app.post('/api/wishlist', authenticateToken, async (req, res) => {
  const { menu_item_id, menu_item_name, menu_item_price, menu_item_image } = req.body
  try {
    // Check if already in wishlist
    const [existing] = await db.execute('SELECT id FROM wishlist WHERE user_id = ? AND menu_item_id = ?', [req.user.id, menu_item_id])
    if (existing.length > 0) {
      return res.json({ message: 'Already in wishlist', id: existing[0].id })
    }
    const [result] = await db.execute(
      'INSERT INTO wishlist (user_id, menu_item_id, menu_item_name, menu_item_price, menu_item_image) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, menu_item_id, menu_item_name, menu_item_price, menu_item_image]
    )
    res.status(201).json({ id: result.insertId, message: 'Added to wishlist' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to wishlist' })
  }
})

app.delete('/api/wishlist/:menu_item_id', authenticateToken, async (req, res) => {
  try {
    await db.execute('DELETE FROM wishlist WHERE user_id = ? AND menu_item_id = ?', [req.user.id, req.params.menu_item_id])
    res.json({ message: 'Removed from wishlist' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from wishlist' })
  }
})

// Check if items are in wishlist (batch)
app.post('/api/wishlist/check', authenticateToken, async (req, res) => {
  const { menu_item_ids } = req.body
  if (!menu_item_ids || !Array.isArray(menu_item_ids) || menu_item_ids.length === 0) {
    return res.json([])
  }
  try {
    const placeholders = menu_item_ids.map(() => '?').join(',')
    const [rows] = await db.execute(`SELECT menu_item_id FROM wishlist WHERE user_id = ? AND menu_item_id IN (${placeholders})`, [req.user.id, ...menu_item_ids])
    res.json(rows.map(r => r.menu_item_id))
  } catch (error) {
    res.status(500).json({ message: 'Failed to check wishlist' })
  }
})

// ===================== COUPON / PROMOTION ROUTES =====================

// Get user's active coupons
app.get('/api/coupons/mine', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT uc.*, c.code, c.discount_percent, c.valid_until 
      FROM user_coupons uc
      JOIN coupons c ON c.id = uc.coupon_id
      WHERE uc.user_id = ? AND uc.is_used = FALSE AND (c.valid_until IS NULL OR c.valid_until >= CURDATE())
      ORDER BY uc.earned_at DESC
    `, [req.user.id])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed to load coupons' })
  }
})

// Check loyalty progress and auto-reward
app.get('/api/coupons/progress', authenticateToken, async (req, res) => {
  try {
    const [orderCount] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status = ?', [req.user.id, 'paid'])
    const [bookingCount] = await db.execute('SELECT COUNT(*) as count FROM reservations WHERE user_id = ? AND status = ?', [req.user.id, 'confirmed'])
    const totalActivity = Number(orderCount[0].count) + Number(bookingCount[0].count)
    const threshold = 10
    
    res.json({
      orderCount: Number(orderCount[0].count),
      bookingCount: Number(bookingCount[0].count),
      totalActivity,
      threshold,
      progressPercent: Math.min(100, (totalActivity / threshold) * 100),
      remainingForReward: Math.max(0, threshold - totalActivity),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to load progress' })
  }
})

// Admin: create a coupon
app.post('/api/admin/coupons', authenticateToken, isAdmin, async (req, res) => {
  const { code, discount_percent, min_orders, valid_until } = req.body
  try {
    await db.execute(
      'INSERT INTO coupons (code, discount_percent, min_orders, valid_until) VALUES (?, ?, ?, ?)',
      [code, discount_percent || 10, min_orders || 10, valid_until || null]
    )
    res.status(201).json({ message: 'Coupon created' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create coupon' })
  }
})

// Admin: list all coupons
app.get('/api/admin/coupons', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM coupons ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Failed to load coupons' })
  }
})

// Admin: issue a coupon to all users who meet the threshold
app.post('/api/admin/coupons/issue-to-qualified', authenticateToken, isAdmin, async (req, res) => {
  const { coupon_id } = req.body
  if (!coupon_id) return res.status(400).json({ message: 'coupon_id required' })
  try {
    const [coupon] = await db.execute('SELECT * FROM coupons WHERE id = ?', [coupon_id])
    if (coupon.length === 0) return res.status(404).json({ message: 'Coupon not found' })
    
    const minOrders = coupon[0].min_orders
    
    // Find users who have at least minOrders paid orders + confirmed bookings
    const [qualifiedUsers] = await db.execute(`
      SELECT u.id, u.name FROM users u
      WHERE u.role = 'user' AND (
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id AND status = 'paid') +
        (SELECT COUNT(*) FROM reservations WHERE user_id = u.id AND status = 'confirmed')
      ) >= ?
    `, [minOrders])
    
    let issued = 0
    for (const user of qualifiedUsers) {
      // Check if already issued
      const [existing] = await db.execute('SELECT id FROM user_coupons WHERE user_id = ? AND coupon_id = ?', [user.id, coupon_id])
      if (existing.length === 0) {
        await db.execute('INSERT INTO user_coupons (user_id, coupon_id) VALUES (?, ?)', [user.id, coupon_id])
        // Also notify the user
        await db.execute(
          'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
          [user.id, '🎉 Congratulations! You earned a coupon!', `You've received a ${coupon[0].discount_percent}% discount coupon for being a loyal customer! Use code: ${coupon[0].code}`, 'system', coupon_id]
        )
        issued++
      }
    }
    res.json({ message: `Issued coupon to ${issued} qualified users` })
  } catch (error) {
    res.status(500).json({ message: 'Failed to issue coupons' })
  }
})

// ===================== MENU NOTIFICATION ROUTES =====================

// Admin: notify all users about new menu item
app.post('/api/admin/notify-new-menu', authenticateToken, isAdmin, async (req, res) => {
  const { menu_item_name, menu_item_id } = req.body
  try {
    const [users] = await db.execute('SELECT id FROM users WHERE role = ?', ['user'])
    let notified = 0
    for (const user of users) {
      await db.execute(
        'INSERT INTO notifications (user_id, title, message, type, reference_id) VALUES (?, ?, ?, ?, ?)',
        [user.id, '🍽️ New Menu Item Added!', `Check out our new dish: ${menu_item_name}. Come taste it today at NekMak!`, 'system', menu_item_id || null]
      )
      notified++
    }
    res.json({ message: `Notified ${notified} users about new menu item` })
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notifications' })
  }
})

// Get unread notification count
app.get('/api/notifications/unread-count', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE', [req.user.id])
    res.json({ count: rows[0].count })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Mark all notifications as read
app.post('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id])
    res.json({ message: 'All marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Failed' })
  }
})

// Get user's order items (for order detail view)
app.get('/api/user/orders/:id/items', authenticateToken, async (req, res) => {
  try {
    const [order] = await db.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' })
    const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [req.params.id])
    res.json({ order: order[0], items })
  } catch (error) {
    res.status(500).json({ message: 'Failed to load order details' })
  }
})

// Order statistics for user (for orders page - calculation feature)
app.get('/api/user/orders/stats', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_spent,
        COALESCE(AVG(total), 0) as average_order
      FROM orders 
      WHERE user_id = ? AND status = 'paid'
    `, [req.user.id])
    
    // This month stats
    const [monthRows] = await db.execute(`
      SELECT 
        COUNT(*) as month_orders,
        COALESCE(SUM(total), 0) as month_spent
      FROM orders 
      WHERE user_id = ? AND status = 'paid' 
        AND MONTH(created_at) = MONTH(CURDATE()) 
        AND YEAR(created_at) = YEAR(CURDATE())
    `, [req.user.id])
    
    res.json({
      totalOrders: Number(rows[0].total_orders),
      totalSpent: Number(rows[0].total_spent),
      averageOrder: Number(rows[0].average_order),
      monthOrders: Number(monthRows[0].month_orders),
      monthSpent: Number(monthRows[0].month_spent),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to load stats' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Admin routes available at http://localhost:${PORT}/api/admin/*`)
  console.log(`Image upload available at http://localhost:${PORT}/api/admin/upload-image`)
})
