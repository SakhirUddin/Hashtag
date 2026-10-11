import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Camera, Compass, Mail, Lock, User, AtSign, Eye, EyeOff, 
  ArrowLeft, Check, Sparkles, AlertCircle, CheckCircle2, Image as ImageIcon 
} from 'lucide-react';
import { loginApi, registerApi } from '../services/api';

// Curated 24 Thumbnail Collection for the Wall
const MOSAIC_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=75', tag: 'Nature', aspect: 'aspect-[3/4]' },
  { url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=75', tag: 'Tokyo', aspect: 'aspect-square' },
  { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=75', tag: 'Food', aspect: 'aspect-[4/5]' },
  { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=75', tag: 'Architecture', aspect: 'aspect-[3/4]' },
  { url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=400&q=75', tag: 'Wildlife', aspect: 'aspect-square' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=75', tag: 'Ocean', aspect: 'aspect-[4/3]' },

  { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=75', tag: 'Vintage', aspect: 'aspect-[4/5]' },
  { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=75', tag: 'Woods', aspect: 'aspect-[3/4]' },
  { url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=75', tag: 'Animals', aspect: 'aspect-square' },
  { url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=75', tag: 'Travel', aspect: 'aspect-[3/4]' },
  { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=75', tag: 'Lakes', aspect: 'aspect-[4/3]' },
  { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=75', tag: 'Workspace', aspect: 'aspect-[4/5]' },

  { url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=75', tag: 'Aurora', aspect: 'aspect-square' },
  { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=75', tag: 'Stars', aspect: 'aspect-[3/4]' },
  { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=75', tag: 'Skyscrapers', aspect: 'aspect-[4/5]' },
  { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=75', tag: 'Cafe', aspect: 'aspect-square' },
  { url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=75', tag: 'Minimal', aspect: 'aspect-[3/4]' },
  { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=75', tag: 'Modern', aspect: 'aspect-[4/3]' },

  { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=75', tag: 'Coding', aspect: 'aspect-[4/5]' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=75', tag: 'Fog', aspect: 'aspect-[3/4]' },
  { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=75', tag: 'Adventure', aspect: 'aspect-square' },
  { url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=75', tag: 'Sunset', aspect: 'aspect-[3/4]' },
  { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=75', tag: 'Portraits', aspect: 'aspect-[4/5]' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=75', tag: 'Mountains', aspect: 'aspect-square' },
];

export default function AuthPage({ initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('creator');
  const [rememberMe, setRememberMe] = useState(true);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Update mode if URL path changes (/Login vs /Signup)
  React.useEffect(() => {
    setIsLogin(location.pathname.toLowerCase().includes('login'));
    setError('');
    setSuccessMsg('');
  }, [location.pathname]);

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 2, text: 'Fair', color: 'bg-orange-500' };
      case 3:
        return { score: 3, text: 'Good', color: 'bg-yellow-500' };
      case 4:
        return { score: 4, text: 'Strong', color: 'bg-green-500' };
      default:
        return { score: 0, text: '', color: 'bg-gray-200' };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginApi(identifier.trim(), password);
        if (res.user?.role === 'admin') {
          setSuccessMsg('Welcome Super Admin! Redirecting to Command Center...');
          setTimeout(() => navigate('/Admin'), 1000);
        } else {
          setSuccessMsg('Welcome back! Redirecting to feed...');
          setTimeout(() => navigate('/'), 1000);
        }
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        await registerApi({
          email: email.trim(),
          username: username.trim().toLowerCase(),
          displayName: displayName.trim(),
          password,
          role,
        });

        setSuccessMsg('Account created successfully! Welcome to #Hashtag.');
        setTimeout(() => navigate('/'), 1200);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white">
      
      {/* LEFT SIDE: Interactive Form Canvas */}
      <div className="w-full lg:w-[48%] xl:w-[42%] flex flex-col justify-between p-6 sm:p-10 md:p-12 z-20 bg-white shadow-2xl overflow-y-auto min-h-screen">
        
        {/* Top Header: Logo & Home Back Button */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              #
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              Hashtag
            </span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explore Photos</span>
          </Link>
        </div>

        {/* Center Content: Main Form */}
        <div className="my-8 max-w-md w-full mx-auto">
          
          {/* Header Title & Mode Switcher Pills */}
          <div className="text-center sm:text-left mb-6">
            <div className="inline-flex p-1 bg-gray-100 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                  isLogin
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                  !isLogin
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Create Account
              </button>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join the Community'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLogin
                ? 'Sign in to access your saved collections and upload high-res photos.'
                : 'Connect with photographers worldwide and publish your work for free.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* SIGNUP ONLY: Persona Selector */}
            {!isLogin && (
              <div className="mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  I am joining as a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      role === 'creator'
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Camera className="w-4 h-4" />
                      {role === 'creator' && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">Creator</p>
                      <p className={`text-[10px] ${role === 'creator' ? 'text-gray-300' : 'text-gray-400'}`}>
                        Share & get downloaded
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('explorer')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      role === 'explorer'
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Compass className="w-4 h-4" />
                      {role === 'explorer' && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">Explorer</p>
                      <p className={`text-[10px] ${role === 'explorer' ? 'text-gray-300' : 'text-gray-400'}`}>
                        Discover & collect
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* LOGIN: Identifier Field (Email or Username) */}
            {isLogin ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="elena_nature or elena@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all"
                  />
                </div>
              </div>
            ) : (
              /* SIGNUP: Full Name, Username, and Email */
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="alex_shots"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="alex@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => alert('Quick testing: use email "elena@hashtag.dev" and password "password123", or sign up a new account!')}
                    className="text-xs font-semibold text-gray-500 hover:text-black underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-sm outline-none focus:border-black focus:ring-4 focus:ring-gray-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* SIGNUP: Live Password Strength Bar */}
              {!isLogin && password && (
                <div className="mt-2 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Password Strength:</span>
                    <span className="font-bold text-gray-700">{passwordStrength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 h-full rounded-full transition-all duration-300 ${
                          step <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isLogin ? 'Sign In to #Hashtag' : 'Create Free Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box for easy testing */}
          <div className="mt-6 p-3 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] text-gray-500">
            <span className="font-bold text-gray-800">💡 Quick Test Credential:</span>
            <div className="flex items-center justify-between mt-1 text-gray-600">
              <span>Username: <code className="bg-white px-1.5 py-0.5 rounded border">elena_nature</code></span>
              <span>Password: <code className="bg-white px-1.5 py-0.5 rounded border">password123</code></span>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400">
          By signing up, you agree to #Hashtag's{' '}
          <a href="#terms" className="underline hover:text-black">Terms of Service</a> and{' '}
          <a href="#privacy" className="underline hover:text-black">Privacy Policy</a>.
        </div>

      </div>

      {/* RIGHT SIDE: Curated 24-Photo Mosaic Wall (Pinterest/Unsplash style) */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-gray-950 p-6 xl:p-8">
        
        {/* Soft Vignette Edge Gradients */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-gray-950 via-gray-950/80 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-950/60 to-transparent pointer-events-none z-10" />

        {/* Floating Header Pill */}
        <div className="relative z-20 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-white text-xs font-semibold shadow-lg">
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Over 120,000+ Curated Creator Photos</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Free Community License</span>
          </div>
        </div>

        {/* Dense Masonry Photo Wall (4 Columns, 24 Photos) */}
        <div className="columns-3 xl:columns-4 gap-3.5 space-y-3.5 h-[94vh] overflow-y-auto scrollbar-none pr-1">
          {MOSAIC_PHOTOS.map((item, idx) => (
            <div
              key={idx}
              className={`group relative break-inside-avoid rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-md hover:shadow-2xl hover:border-white/30 transition-all duration-300 hover:scale-[1.03] cursor-pointer ${item.aspect}`}
            >
              <img
                src={item.url}
                alt={item.tag}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:brightness-110"
              />

              {/* Hover Badge with Hashtag */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2.5 flex items-end justify-between">
                <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                  #{item.tag}
                </span>
                <span className="text-[10px] text-gray-300 font-medium">
                  Free
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
