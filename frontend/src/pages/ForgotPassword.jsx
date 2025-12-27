import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cog, Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // Show success even if email doesn't exist (security best practice)
      // This prevents email enumeration attacks
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-primary-950 to-dark-950"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl shadow-glow mb-4 transition-transform duration-300 hover:scale-105">
            <Cog className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">GearGuard</h1>
          <p className="text-gray-400 mt-2">Maintenance Management System</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-dark-800/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-dark-700/50 transition-all duration-500">
          {!success ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500/10 rounded-xl mb-4">
                  <Mail className="w-6 h-6 text-primary-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Forgot Password?</h2>
                <p className="text-gray-400 mt-2 text-sm">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400 flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={handleInputChange}
                      placeholder="you@company.com"
                      className="w-full px-4 py-3 pl-11 bg-dark-900/50 border border-dark-600/50 rounded-xl text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                               placeholder:text-gray-500 transition-all duration-300"
                      autoFocus
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold
                           hover:from-primary-500 hover:to-primary-400 transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-900
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm hover:shadow-glow
                           flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-4 animate-bounce-once">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Check Your Email</h2>
              <p className="text-gray-400 text-sm mb-6">
                If an account exists with <span className="text-primary-400 font-medium">{email}</span>, 
                you will receive a password reset link shortly.
              </p>
              <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-600/50 mb-6">
                <p className="text-gray-400 text-xs">
                  💡 Tip: Check your spam folder if you don't see the email in your inbox.
                </p>
              </div>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-400 font-medium transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 GearGuard. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
