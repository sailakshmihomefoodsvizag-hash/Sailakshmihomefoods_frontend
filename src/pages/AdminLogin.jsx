import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Loader2 } from 'lucide-react';
import { adminAPI } from '../services/adminAPI';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminAPI.login(mobile, password);
      
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/FooterBg.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4">
      {/* Slight overlay for page background */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Login Card with Background.avif Inside */}
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Card Background Image */}
        <div className="absolute inset-0 bg-[url('/Background.avif')] bg-cover bg-center bg-no-repeat" />
        
        {/* Dark overlay for card readability */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Card Content */}
        <div className="relative z-10 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
            <img src="/sailakshmi.webp" alt="Sai Lakshmi Home Foods" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-rubik drop-shadow-lg">
            Admin Login
          </h1>
          <p className="text-white/90 mt-2 font-montserrat text-sm drop-shadow-md">
            Sai Lakshmi Foods Management
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl text-red-100 text-sm font-montserrat">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2 font-montserrat drop-shadow-md">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/30 font-montserrat transition-all text-white placeholder:text-white/70 shadow-lg"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2 font-montserrat drop-shadow-md">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/30 font-montserrat transition-all text-white placeholder:text-white/70 shadow-lg"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-montserrat shadow-lg shadow-primary/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>

        {/* Back Link */}
        <p className="mt-6 text-center text-white/90 font-montserrat text-sm drop-shadow-md">
          <a href="/" className="text-white hover:underline font-semibold">
            ← Back to Store
          </a>
        </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
