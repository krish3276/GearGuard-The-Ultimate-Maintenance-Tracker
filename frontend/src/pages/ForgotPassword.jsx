import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cog, Mail, ArrowLeft, Loader2, CheckCircle, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API call - Replace with actual API call when backend is ready
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setEmail('');
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl shadow-glow mb-4">
            <Cog className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">GearGuard</h1>
          <p className="text-gray-400 mt-2">Maintenance Management System</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-dark-800/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-dark-700/50">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500/10 rounded-xl mb-4">
                  <Mail className="w-6 h-6 text-primary-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Forgot Password?</h2>
                <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400 animate-shake">
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
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold
                           hover:from-primary-500 hover:to-primary-400 transition-all duration-300
                           focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-dark-900
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm hover:shadow-glow
                           flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-primary-400 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Back to Sign in
                </Link>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-6 animate-bounce-slow">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Check your email</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                We've sent password reset instructions to:
              </p>
              <p className="text-primary-400 font-medium mb-6">{email}</p>
              <p className="text-gray-500 text-xs mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleResend}
                  className="w-full py-3 bg-glass-light text-gray-200 rounded-xl font-semibold
                           border border-glass-border hover:bg-glass-hover hover:border-glass-hover
                           transition-all duration-300 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  Try another email
                </button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm text-gray-400 
                           hover:text-primary-400 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Back to Sign in
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2024 GearGuard. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
