import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as AppleStrategy } from 'passport-apple'

dotenv.config()

console.log('--- Auth Config Check ---')
console.log('Port:', process.env.PORT)
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'MISSING')
if (process.env.GOOGLE_CLIENT_ID) {
  console.log('Google Client ID ends with:', process.env.GOOGLE_CLIENT_ID.slice(-10))
}
console.log('-------------------------')

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

    // Create users table if not exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        provider VARCHAR(50),
        provider_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Ensure social login columns exist (for migration)
    try {
      await db.execute('ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL')
      await db.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT "local"')
      await db.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255)')
    } catch (e) {
      console.log('Schema check: provider columns already present or handled.')
    }

    // Create admin user if not exists
    await db.execute(`
      INSERT IGNORE INTO users (email, password, name, role, provider) 
      VALUES ('admin@gmail.com', 'admin123', 'Admin', 'admin', 'local')
    `)

    // Create reservations table
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
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create menu_items table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category ENUM('Foods', 'Drinks', 'Fruites', 'Pizza&Buger', 'Sweets', 'Vegeterain', 'Wines') NOT NULL,
        image_url VARCHAR(500),
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed menu items if empty
    const [menuCount] = await db.execute('SELECT COUNT(*) as count FROM menu_items')
    if (menuCount[0].count === 0) {
      const items = [
        // FOODS
        { name: 'Traditional Fish Amok', desc: 'Steamed fish in banana leaf with coconut curry', price: 12.00, cat: 'Foods', img: 'Foods/sharonang-fish-amok-921926_1920.jpg' },
        { name: 'Savory Beef Lok Lak', desc: 'Classic stir-fried beef with lime and pepper', price: 14.00, cat: 'Foods', img: 'Foods/kan_chansathya-khmer-9024474_1920.jpg' },
        { name: 'Khmer Red Curry', desc: 'Aromatic curry with chicken and sweet potatoes', price: 13.00, cat: 'Foods', img: 'Foods/kan_chansathya-khmer-food-3771719_1920.jpg' },
        { name: 'Signature Wagyu', desc: 'Premium 12oz Wagyu striploin, bone marrow jus', price: 65.00, cat: 'Foods', img: 'Foods/alex-munsell-auIbTAcSH6E-unsplash.jpg' },
        { name: 'Grilled Scallops', desc: 'Fresh scallops with garlic butter and herbs', price: 28.00, cat: 'Foods', img: 'Foods/pichara-g-I7PRofUoE-unsplash.jpg' },
        { name: 'Herb Crusted Salmon', desc: 'Atlantic salmon with garden fresh herbs', price: 32.00, cat: 'Foods', img: 'Foods/alex-munsell-Yr4n8O_3UPc-unsplash.jpg' },
        
        // DRINKS
        { name: 'Signature Mojito', desc: 'Fresh mint, lime, and premium white rum', price: 9.00, cat: 'Drinks', img: 'Drinks/rodion-kutsaiev-x4z7GiV5_-0-unsplash.jpg' },
        { name: 'Cold Brew Fusion', desc: 'Specialty coffee with a hint of vanilla bean', price: 6.50, cat: 'Drinks', img: 'Drinks/kobby-mendez-xBFTjrMIC0c-unsplash.jpg' },
        { name: 'Citrus Sparkler', desc: 'Zesty blend of orange, lemon, and soda', price: 5.00, cat: 'Drinks', img: 'Drinks/ash-edmonds-fsI-_MRsic0-unsplash.jpg' },
        { name: 'Berry Refresher', desc: 'Mixed berries with sparkling mineral water', price: 7.00, cat: 'Drinks', img: 'Drinks/svitlana-vexxZA_JNso-unsplash.jpg' },
        { name: 'Tropical Smoothie', desc: 'Mango, pineapple, and coconut cream blend', price: 8.50, cat: 'Drinks', img: 'Drinks/clovis-wood-iUtcVxqxkPk-unsplash.jpg' },

        // FRUITES
        { name: 'Dragon Fruit Platter', desc: 'Exotic red and white pitaya selection', price: 10.00, cat: 'Fruites', img: 'Fruites/jonas-kakaroto-5JQH9Iqnm9o-unsplash.jpg' },
        { name: 'Summer Fruit Medley', desc: 'Fresh seasonal berries and stone fruits', price: 12.00, cat: 'Fruites', img: 'Fruites/brooke-lark-1Rm9GLHV0UA-unsplash.jpg' },
        { name: 'Exotic Papaya', desc: 'Sun-ripened local papaya with lime squeeze', price: 8.00, cat: 'Fruites', img: 'Fruites/jo-sonn-zeFy-oCUhV8-unsplash.jpg' },
        { name: 'Citrus Collection', desc: 'Zesty assortment of local citrus fruits', price: 9.50, cat: 'Fruites', img: 'Fruites/arturrro-GdTLaWamFHw-unsplash.jpg' },

        // PIZZA & BUGER
        { name: 'Truffle Masterpiece', desc: 'Black truffle, wagyu beef, caramelized onions', price: 22.00, cat: 'Pizza&Buger', img: 'Pizza&Buger/martinquijandria-big-2530144_1920.jpg' },
        { name: 'Artisanal Margherita', desc: 'Buffalo mozzarella, fresh basil, San Marzano', price: 18.00, cat: 'Pizza&Buger', img: 'Pizza&Buger/joshuemd-pizza-329523_1920.jpg' },
        { name: 'Pepperoni Feast', desc: 'Double-cured pepperoni and spicy chili honey', price: 20.00, cat: 'Pizza&Buger', img: 'Pizza&Buger/hoaluu-pizza-2589569_1920.jpg' },
        { name: 'Garden Pizza', desc: 'Fresh farm vegetables and ricotta cheese', price: 17.00, cat: 'Pizza&Buger', img: 'Pizza&Buger/engin_akyurt-pizza-5661748_1920.jpg' },

        // SWEETS
        { name: 'Gold Leaf Matcha', desc: 'Matcha sponge, velvet cream, 24k gold leaf', price: 12.00, cat: 'Sweets', img: 'Sweets/pexels-blueberries-1867398_1920.jpg' },
        { name: 'Daily Cupcake', desc: 'Handcrafted daily signature cupcake selection', price: 6.00, cat: 'Sweets', img: 'Sweets/cegoh-cupcakes-1133146_1920.jpg' },
        { name: 'Velvet Pancakes', desc: 'Fluffy pancakes with maple and berries', price: 14.00, cat: 'Sweets', img: 'Sweets/daria-yakovleva-pancakes-2139844_1920.jpg' },
        { name: 'Chocolate Decadence', desc: 'Rich dark chocolate cake with ganache', price: 11.00, cat: 'Sweets', img: 'Sweets/daria-yakovleva-cake-1971552_1920.jpg' },

        // VEGETERAIN
        { name: 'Quinoa Garden', desc: 'Organic quinoa, avocado, and garden herbs', price: 15.00, cat: 'Vegeterain', img: 'Vegeterain/joseph-gonzalez-QaGDmf5tMiE-unsplash.jpg' },
        { name: 'Roasted Harvest', desc: 'Seasonal vegetables with balsamic reduction', price: 14.00, cat: 'Vegeterain', img: 'Vegeterain/ella-olsson-mmnKI8kMxpc-unsplash.jpg' },
        { name: 'Avocado Toast Luxe', desc: 'Sourdough, poached egg, and microgreens', price: 13.00, cat: 'Vegeterain', img: 'Vegeterain/brooke-lark-jUPOXXRNdcA-unsplash.jpg' },

        // WINES
        { name: 'Vintage Cabernet', desc: 'Full-bodied red, notes of oak and cherry', price: 65.00, cat: 'Wines', img: 'Wines/matthieu-joannon-6ciLddToTgM-unsplash.jpg' },
        { name: 'Reserve Chardonnay', desc: 'Crisp white with buttery finish and vanilla', price: 58.00, cat: 'Wines', img: 'Wines/kevin-kelly-PPneSBqfCCU-unsplash.jpg' },
        { name: 'Sparkling Rose', desc: 'Elegant bubbles with hints of wild berry', price: 72.00, cat: 'Wines', img: 'Wines/aesop-wines-wS7f61WuRZk-unsplash.jpg' }
      ];

      const values = items.map(i => `('${i.name.replace(/'/g, "''")}', '${i.desc.replace(/'/g, "''")}', ${i.price}, '${i.cat}', '${i.img}')`).join(',');
      await db.execute(`INSERT INTO menu_items (name, description, price, category, image_url) VALUES ${values}`);
      console.log('Complete menu assets seeded');
    }
  } catch (error) {
    console.error('Database initialization failed:', error.message)
    console.error('Please ensure MySQL is running and the database "' + process.env.DB_NAME + '" exists.')
  }
}

await initDB()

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
app.use(express.json())
app.use(passport.initialize())

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
        ['google', profile.id]
      );
      if (rows.length > 0) {
        return done(null, rows[0]);
      }

      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error('No email associated with this Google account'), null);
      }
      const email = profile.emails[0].value;

      const [existing] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      if (existing.length > 0) {
        await db.execute(
          'UPDATE users SET provider = ?, provider_id = ? WHERE id = ?',
          ['google', profile.id, existing[0].id]
        );
        return done(null, { ...existing[0], provider: 'google', provider_id: profile.id });
      }

      const [result] = await db.execute(
        'INSERT INTO users (email, name, provider, provider_id, role) VALUES (?, ?, ?, ?, ?)',
        [email, profile.displayName, 'google', profile.id, 'user']
      );

      const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
      return done(null, newUser[0]);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Passport Apple OAuth Strategy
passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID || 'dummy',
    teamID: process.env.APPLE_TEAM_ID || 'dummy',
    keyID: process.env.APPLE_KEY_ID || 'dummy',
    privateKey: (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    callbackURL: "/api/auth/apple/callback"
  },
  (issuer, subject, email, accessToken, refreshToken, profile, done) => {
    (async () => {
      try {
        const providerId = subject;
        const [rows] = await db.execute(
          'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
          ['apple', providerId]
        );
        if (rows.length > 0) {
          return done(null, rows[0]);
        }

        const userEmail = email || `apple_${providerId}@noemail.local`;
        const displayName = email ? email.split('@')[0] : 'Apple User';

        if (email) {
          const [existing] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
          );
          if (existing.length > 0) {
            await db.execute(
              'UPDATE users SET provider = ?, provider_id = ? WHERE id = ?',
              ['apple', providerId, existing[0].id]
            );
            return done(null, { ...existing[0], provider: 'apple', provider_id: providerId });
          }
        }

        const [result] = await db.execute(
          'INSERT INTO users (email, name, provider, provider_id, role) VALUES (?, ?, ?, ?, ?)',
          [userEmail, displayName, 'apple', providerId, 'user']
        );

        const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
        return done(null, newUser[0]);
      } catch (error) {
        return done(error, null);
      }
    })();
  }
));

// JWT middleware
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

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'LokPa Restaurant API Server' })
})

// Local registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Check if user exists
    const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, provider) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, 'user', 'local']
    )

    const token = jwt.sign(
      { id: result.insertId, email, role: 'user', name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.status(201).json({ 
      token, 
      user: { id: result.insertId, email, name, role: 'user' } 
    })
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Local login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const user = rows[0]
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Google OAuth
app.get('/api/auth/google', (req, res, next) => {
  const origin = req.headers.referer || 'http://localhost:5173';
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: Buffer.from(JSON.stringify({ origin })).toString('base64')
  })(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    const stateStr = req.query.state ? Buffer.from(req.query.state, 'base64').toString() : '{}';
    let state = { origin: 'http://localhost:5173' };
    try { state = JSON.parse(stateStr); } catch (e) {}
    
    const origin = state.origin || 'http://localhost:5173';
    const baseUrl = origin.includes('5174') ? 'http://localhost:5174' : 'http://localhost:5173';

    if (err || !user) {
      console.error('Auth Error:', err);
      return res.redirect(`${baseUrl}/?error=auth_failed`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    res.redirect(`${baseUrl}/auth/callback?token=${token}`)
  })(req, res, next);
});

// Apple OAuth
app.get('/api/auth/apple', (req, res, next) => {
  const origin = req.headers.referer || 'http://localhost:5173';
  passport.authenticate('apple', { 
    scope: ['name', 'email'],
    state: Buffer.from(JSON.stringify({ origin })).toString('base64')
  })(req, res, next);
});

app.get('/api/auth/apple/callback', (req, res, next) => {
  passport.authenticate('apple', { session: false }, (err, user) => {
    const stateStr = req.query.state ? Buffer.from(req.query.state, 'base64').toString() : '{}';
    let state = { origin: 'http://localhost:5173' };
    try { state = JSON.parse(stateStr); } catch (e) {}
    
    const origin = state.origin || 'http://localhost:5173';
    const baseUrl = origin.includes('5174') ? 'http://localhost:5174' : 'http://localhost:5173';

    if (err || !user) {
      console.error('Apple Auth Error:', err);
      return res.redirect(`${baseUrl}/?error=auth_failed`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    res.redirect(`${baseUrl}/auth/callback?token=${token}`)
  })(req, res, next);
});

// Protected route
app.get('/api/profile', authenticateToken, async (req, res) => {
  const [rows] = await db.execute('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.id])
  res.json(rows[0])
})

// Admin only route
app.get('/api/admin', authenticateToken, isAdmin, (req, res) => {
  res.json({ message: 'Admin access granted' })
})

// Logout
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

// Menu routes
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM menu_items WHERE available = TRUE')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu' })
  }
})

// Reservation routes
app.post('/api/reservations', authenticateToken, async (req, res) => {
  const { date, time, guests, name, email, phone, specialRequests } = req.body
  const userId = req.user.id

  try {
    await db.execute(
      'INSERT INTO reservations (user_id, date, time, guests, name, email, phone, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, date, time, guests, name, email, phone, specialRequests]
    )
    res.status(201).json({ message: 'Reservation created successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation' })
  }
})

// Admin: Get all reservations
app.get('/api/admin/reservations', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM reservations ORDER BY date DESC, time DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Review routes
app.post('/api/reviews', authenticateToken, async (req, res) => {
  const { menuItemId, rating, comment, isFavorite } = req.body
  const userId = req.user.id

  try {
    // Check if review already exists for this user and menu item
    const [existing] = await db.execute('SELECT * FROM reviews WHERE menu_item_id = ? AND user_id = ?', [menuItemId, userId])

    if (existing.length > 0) {
      // Update existing review
      await db.execute('UPDATE reviews SET rating = ?, comment = ?, is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE menu_item_id = ? AND user_id = ?', [rating, comment, isFavorite, menuItemId, userId])
      res.json({ message: 'Review updated successfully' })
    } else {
      // Create new review
      await db.execute('INSERT INTO reviews (menu_item_id, user_id, rating, comment, is_favorite) VALUES (?, ?, ?, ?, ?)', [menuItemId, userId, rating, comment, isFavorite])
      res.status(201).json({ message: 'Review created successfully' })
    }
  } catch (error) {
    console.error('Error handling review:', error)
    res.status(500).json({ message: 'Error processing review' })
  }
})

app.get('/api/reviews/menu/:menuItemId', async (req, res) => {
  const { menuItemId } = req.params

  try {
    const [rows] = await db.execute('SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.menu_item_id = ? ORDER BY r.created_at DESC', [menuItemId])
    res.json(rows)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json({ message: 'Error fetching reviews' })
  }
})

app.get('/api/reviews/user', authenticateToken, async (req, res) => {
  const userId = req.user.id

  try {
    const [rows] = await db.execute('SELECT r.*, mi.name as menu_item_name FROM reviews r JOIN menu_items mi ON r.menu_item_id = mi.id WHERE r.user_id = ? ORDER BY r.created_at DESC', [userId])
    res.json(rows)
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    res.status(500).json({ message: 'Error fetching user reviews' })
  }
})
