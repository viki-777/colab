// import { GetServerSideProps } from 'next'
// import { getProviders, signIn, getSession } from 'next-auth/react'
// import { FcGoogle } from 'react-icons/fc'

// interface Provider {
//   id: string
//   name: string
//   type: string
//   signinUrl: string
//   callbackUrl: string
// }

// interface SignInProps {
//   providers: Record<string, Provider>
// }

// export default function SignIn({ providers }: SignInProps) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign in to Colabio
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Collaborate on the digital whiteboard
//           </p>
//         </div>
//         <div className="mt-8 space-y-6">
//           {Object.values(providers).map((provider) => (
//             <div key={provider.name}>
//               <button
//                 onClick={() => signIn(provider.id, { callbackUrl: '/' })}
//                 className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border-gray-300 shadow-sm"
//               >
//                 <span className="absolute left-0 inset-y-0 flex items-center pl-3">
//                   <FcGoogle className="h-6 w-6" />
//                 </span>
//                 Sign in with {provider.name}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const session = await getSession(context)

//   if (session) {
//     return {
//       redirect: {
//         destination: '/',
//         permanent: false,
//       },
//     }
//   }

//   const providers = await getProviders()

//   return {
//     props: {
//       providers: providers ?? {},
//     },
//   }
// }


import { GetServerSideProps } from 'next'
import { getProviders, signIn, getSession } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'

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
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 via-white to-pink-100 px-4 py-12">
      <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-2xl p-10 w-full max-w-md transition-all duration-300 animate-fade-in">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800">Welcome to Colabio</h2>
          <p className="mt-2 text-sm text-gray-600">Collaborate on the digital whiteboard</p>
        </div>
        <div className="mt-8 space-y-4">
          {Object.values(providers).map((provider) => (
            <div key={provider.name}>
              <button
                onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 transition duration-200"
              >
                <FcGoogle className="h-5 w-5" />
                Sign in with {provider.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Add Tailwind fade-in animation class (optional, if using custom animations)
const fadeInAnimation = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
`

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
