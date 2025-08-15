import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AuthContextType {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  
  const value: AuthContextType = {
    user: session?.user ? {
      id: (session.user as any).id || (session.user as any).sub || session.user.email!,
      name: session.user.name!,
      email: session.user.email!,
      image: session.user.image || undefined,
    } : null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
