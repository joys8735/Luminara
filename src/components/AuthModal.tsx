import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react';
import { toast } from 'sonner';
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onMetamaskConnect?: () => Promise<void>;
  onGoogleLogin?: () => Promise<void>;
}


export function AuthModal({
  isOpen,
  onClose,
  initialMode,
  onMetamaskConnect,
  onGoogleLogin
}: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      toast.success('Successfully logged in!');
    } else {
      toast.success('Account created successfully!');
    }
    onClose();
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      if (onGoogleLogin) {
        await onGoogleLogin();
      } else {
        toast.success('Google login initiated!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetamaskLogin = async () => {
    setIsLoading(true);
    try {
      if (onMetamaskConnect) {
        await onMetamaskConnect();
      } else {
        toast.success('Metamask connection initiated!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Metamask connection failed');
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg max-w-md w-full p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#a0a0a0] hover:text-[#e0e0e0] transition-colors">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#e0e0e0] mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-[#a0a0a0]">
            {mode === 'login' ? 'Sign in to your account to continue' : 'Join SolanaVerse and start investing'}
          </p>
        </div>

        {/* Google Login */}
        <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#1a1a1a] hover:bg-[#222] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] font-medium text-xs transition-colors mb-4">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1f1f1f]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[#121212] text-[#707070]">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && <div>
              <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707070]" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-xs focus:outline-none focus:border-[#3b82f6]" placeholder="Enter your username" required />
              </div>
            </div>}

          <div>
            <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707070]" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-xs focus:outline-none focus:border-[#3b82f6]" placeholder="Enter your email" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a0a0a0] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707070]" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg text-[#e0e0e0] text-xs focus:outline-none focus:border-[#3b82f6]" placeholder="Enter your password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#e0e0e0]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === 'login' && <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-[#a0a0a0]">
                <input type="checkbox" className=" mr-2 w-4 h-4 text-[#3b82f6] bg-[#1a1a1a] border-[#1f1f1f] rounded focus:ring-[#3b82f6]" />
                Remember me
              </label>
              <button type="button" className="text-[#3b82f6] hover:text-[#2563eb]">
                Forgot password?
              </button>
            </div>}

          <button type="submit" className="w-full py-2.5 px-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg font-medium text-xs transition-all">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-[#a0a0a0]">
          {mode === 'login' ? <>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="text-[#3b82f6] hover:text-[#2563eb] font-medium">
                Sign up
              </button>
            </> : <>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-[#3b82f6] hover:text-[#2563eb] font-medium">
                Sign in
              </button>
            </>}
        </div>

        {mode === 'register' && <div className="mt-4 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-3">
            <p className="text-xs text-[#a0a0a0] text-center">
              By creating an account, you agree to our{' '}
              <button className="text-[#3b82f6] hover:text-[#2563eb]">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-[#3b82f6] hover:text-[#2563eb]">
                Privacy Policy
              </button>
            </p>
          </div>}
      </div>
    </div>;
}
export default AuthModal;
