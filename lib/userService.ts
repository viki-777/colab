import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

interface User {
  id: string
  name: string
  email: string
  password: string
}

// File path for storing users
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(USERS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load users from file
const loadUsers = (): User[] => {
  try {
    ensureDataDir()
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading users:', error)
  }
  
  // Return default users if file doesn't exist or there's an error
  return [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: '$2b$12$cpLAGVpe.GAEk/Qun.SyFusdGUR/.dO3AetQY5LR5pnVS.vEaUwlu', // 'password'
    },
    {
      id: '2',
      name: 'Vikas',
      email: 'vikas.iiitm.career@gmail.com',
      password: '$2b$12$cpLAGVpe.GAEk/Qun.SyFusdGUR/.dO3AetQY5LR5pnVS.vEaUwlu', // 'password' - you can change this
    }
  ]
}

// Save users to file
const saveUsers = (users: User[]) => {
  try {
    ensureDataDir()
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

// Initialize users from file
let users: User[] = loadUsers()

export const userService = {
  // Find user by email
  findByEmail: (email: string): User | undefined => {
    return users.find(user => user.email === email)
  },

  // Create a new user
  create: async (userData: { name: string; email: string; password: string }): Promise<Omit<User, 'password'>> => {
    // Check if user already exists
    const existingUser = users.find(user => user.email === userData.email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Create new user
    const newUser: User = {
      id: String(users.length + 1),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    }

    users.push(newUser)
    
    // Save to file to persist across server restarts
    saveUsers(users)

    // Return user without password
    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  },

  // Verify password
  verifyPassword: async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword)
  },

  // Get all users (for debugging - remove in production)
  getAll: (): Omit<User, 'password'>[] => {
    return users.map(({ password, ...user }) => user)
  }
}
