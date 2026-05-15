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
        category ENUM('appetizer', 'main', 'dessert', 'drink') NOT NULL,
        image_url VARCHAR(500),
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed menu items if empty
    const [menuCount] = await db.execute('SELECT COUNT(*) as count FROM menu_items')
    if (menuCount[0].count === 0) {
      await db.execute(`
        INSERT INTO menu_items (name, description, price, category) VALUES
        ('Truffle Arancini', 'Wild mushroom risotto balls, truffle aioli', 18.00, 'appetizer'),
        ('Seared Scallops', 'Cauliflower purée, crispy pancetta', 24.00, 'appetizer'),
        ('Wagyu Striploin', '12oz, smoked bone marrow, red wine jus', 65.00, 'main'),
        ('Miso Black Cod', 'Coconut jasmine rice, bok choy', 42.00, 'main'),
        ('Gold Leaf Soufflé', 'Dark chocolate, Grand Marnier', 22.00, 'dessert'),
        ('Matcha Tiramisu', 'Espresso-soaked ladyfingers', 16.00, 'dessert')
      `)
      console.log('Sample menu items seeded')
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
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const user = req.user
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    const clientUrl = req.headers.referer || 'http://localhost:5174'
    const redirectUrl = clientUrl.includes('5173') ? 'http://localhost:5173/auth/callback' : 'http://localhost:5174/auth/callback'
    res.redirect(`${redirectUrl}?token=${token}`)
  }
)

// Apple OAuth
app.get('/api/auth/apple',
  passport.authenticate('apple', { scope: ['name', 'email'] })
)

app.get('/api/auth/apple/callback',
  passport.authenticate('apple', { session: false }),
  async (req, res) => {
    const user = req.user
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
    const clientUrl = req.headers.referer || 'http://localhost:5174'
    const redirectUrl = clientUrl.includes('5173') ? 'http://localhost:5173/auth/callback' : 'http://localhost:5174/auth/callback'
    res.redirect(`${redirectUrl}?token=${token}`)
  }
)

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
