import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { getProviders, signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FcGoogle } from 'react-icons/fc'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi'
import { toast } from 'react-toastify'

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

interface SignInProps {
  providers: Record<string, Provider>
}

export default function SignIn({ providers }: SignInProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // --- NO LOGIC MODIFICATION ---
  // All handlers and logic remain exactly the same.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })


      if (result?.error) {
        toast.error(`Authentication failed: ${result.error}`)
      } else if (result?.ok) {
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else {
        toast.error('Authentication failed')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }
  // --- END OF LOGIC SECTION ---

  return (
    // Parent container using flex for the two-column layout
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-900 via-black via-zinc-900 to-blue-900">
      
      {/* Left Side: Sign-In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 text-gray-700">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
             Signin
            </h1>
            <p className="text-gray-200 mt-2">Collaborate on the digital board</p>
          </div>

       
          <div className="bg-zinc/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Show success message if redirected from signup */}
            {router.query.message === 'account-created' && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">Account created successfully! Please sign in.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/95 text-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/95"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <FcGoogle className="h-5 w-5" />
                Sign in with Google
              </button>
            </div>

            {/* Sign Up Link */}
                      {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign up
            </Link>
          </p>
          </div>
        </div>
      </div>

      
      
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="relative w-full max-w-lg h-96 lg:h-[500px]">
            <img 
              src="/logo.png" 
              alt="Collaboration Platform"
              className="w-full h-full object-cover rounded-3xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-black/30 rounded-3xl"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">Real-time Collaboration</h2>
              <p className="text-lg opacity-90">Join teams from around the world and bring your ideas to life on our interactive digital canvas.</p>
            </div>
          </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const providers = await getProviders()

  return {
    props: {
      providers: providers ?? {},
    },
  }
}