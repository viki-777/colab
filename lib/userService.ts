import bcrypt from 'bcryptjs'

interface User {
  id: string
  name: string
  email: string
  password: string
}

// Mock user database - in a real app, this would be a proper database
let users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2b$12$cpLAGVpe.GAEk/Qun.SyFusdGUR/.dO3AetQY5LR5pnVS.vEaUwlu', // 'password'
  }
]

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
