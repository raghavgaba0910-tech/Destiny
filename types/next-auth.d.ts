import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      mustChangePassword: boolean
    }
  }
  interface User {
    role: string
    mustChangePassword: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    mustChangePassword: boolean
  }
}
