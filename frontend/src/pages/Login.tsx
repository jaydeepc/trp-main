import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Brain, User } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups and try again.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignupMode) {
      if (password !== confirmPassword) {
        return setError('Passwords do not match');
      }
      if (password.length < 6) {
        return setError('Password must be at least 6 characters');
      }
    }

    try {
      setError('');
      setIsLoading(true);

      if (isSignupMode) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }

      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.code ? getFirebaseErrorMessage(err.code) : err.message;
      setError(errorMessage || `Failed to ${isSignupMode ? 'sign up' : 'sign in'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.code ? getFirebaseErrorMessage(err.code) : err.message;
      setError(errorMessage || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen"
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, rgba(219, 234, 254, 0.8) 0%, rgba(229, 247, 245, 0.6) 100%)
        `,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f83cc' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-h-screen">
        {/* Left Half - Image Card */}
        <div
          className="relative p-8 flex items-center justify-center col-span-1 lg:col-span-2"
        >
          {/* Image Container - Full Size */}
          <div className="w-full h-full max-h-[calc(100vh-4rem)]">
            <img
              src="https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg?semt=ais_hybrid&w=740&q=80"
              alt="Login Illustration"
              className="w-full h-full object-cover rounded-xl shadow"
            />
          </div>
        </div>

        {/* Right Half - Login Form */}
        <div className="p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Branding */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center justify-center space-x-3 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl mt-3 font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  The Robbie Project
                </h2>
                <p className="text-surface-500 text-sm font-medium">
                  AI Procurement OS
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-surface-300 w-1/3 mx-auto mb-6"></div>

            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-surface-600 font-medium">
                {isSignupMode ? 'Create your account to get started' : 'Sign in to continue to your account'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Login/Signup Form */}
            <form onSubmit={handleEmailLogin} className="space-y-6">
              {/* Name Field - Only for Signup */}
              {isSignupMode && (
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-surface-900 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-surface-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors duration-200 text-surface-900 placeholder-surface-400"
                      placeholder="Enter your full name"
                      required={isSignupMode}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-surface-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-surface-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors duration-200 text-surface-900 placeholder-surface-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-surface-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border-2 border-surface-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors duration-200 text-surface-900 placeholder-surface-400"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-surface-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field - Only for Signup */}
              {isSignupMode && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-surface-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border-2 border-surface-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors duration-200 text-surface-900 placeholder-surface-400"
                      placeholder="Confirm your password"
                      required={isSignupMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 hover:text-surface-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password - Only for Login */}
              {!isSignupMode && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500 focus:ring-2 transition-all"
                    />
                    <span className="text-sm font-medium text-surface-700">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                loading={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {isSignupMode ? 'Create Account' : 'Sign In'}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="w-full border-t border-surface-200"></div>
                <div className="flex-1 text-sm min-w-36">
                  <span className="px-4 text-surface-500 font-medium">Or continue with</span>
                </div>
                <div className="w-full border-t border-surface-200"></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 px-6 py-3 border-2 border-surface-200 rounded-xl hover:border-surface-300 hover:bg-surface-50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-surface-700 font-semibold">Sign in with Google</span>
              </button>
            </form>

            {/* Toggle between Login and Signup */}
            <div className="mt-8 text-center">
              <p className="text-surface-600">
                {isSignupMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignupMode(!isSignupMode);
                    setError('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  {isSignupMode ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
