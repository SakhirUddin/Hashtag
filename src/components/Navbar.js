import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, UploadCloud, Menu, X, LogOut, ShieldCheck, 
  Folder, Bell, Heart, MessageSquare, UserCheck, Briefcase, CheckCheck 
} from 'lucide-react';
import { 
  getCurrentUser, logout, 
  getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi 
} from '../services/api';

export default function Navbar({ searchTerm, setSearchTerm, onOpenUpload }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Notification center state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNotificationsApi();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 25000); // Check for live notifications
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications]);

  // Click outside to dismiss notifications popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markNotificationReadApi(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setNotificationsOpen(false);

      if (notif.type === 'follow' && notif.actor) {
        navigate(`/profile/${notif.actor.username}`);
      } else if (notif.type === 'inquiry') {
        navigate(`/profile/${user?.username}`);
      } else if (notif.photo) {
        navigate(`/?q=${encodeURIComponent(notif.photo.title || '')}`);
      }
    } catch (err) {
      console.error('Error opening notification:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
              #
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-gray-900">
              Hashtag
            </span>
          </Link>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl relative hidden md:block"
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search high-resolution photos, #nature, #architecture, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-gray-900 text-sm rounded-full pl-10 pr-12 py-2.5 transition-all outline-none border border-transparent focus:border-gray-300 focus:ring-4 focus:ring-gray-100"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/collections"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Folder className="w-4 h-4 text-gray-500" />
              <span>Collections</span>
            </Link>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-full transition-all shadow-sm hover:shadow active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Submit a Photo</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2">
                {user.role === 'admin' && (
                  <Link
                    to="/Admin"
                    className="inline-flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-full transition-colors shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Notifications Bell Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {/* Dropdown Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-scaleIn">
                      {/* Popover Header */}
                      <div className="px-4 pb-2.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-800" />
                          <h4 className="font-extrabold text-sm text-gray-900">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-gray-500 hover:text-black flex items-center gap-1 hover:underline"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      {/* Popover List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-gray-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs font-semibold">No notifications yet</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">We'll alert you when creators interact with you</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notif.isRead ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <div className="relative flex-shrink-0 mt-0.5">
                                <img
                                  src={notif.actor?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${notif.actor?.username || 'user'}`}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                />
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white shadow-sm border border-gray-100">
                                  {notif.type === 'like' && <Heart className="w-2.5 h-2.5 text-red-500 fill-current" />}
                                  {notif.type === 'comment' && <MessageSquare className="w-2.5 h-2.5 text-blue-500 fill-current" />}
                                  {notif.type === 'follow' && <UserCheck className="w-2.5 h-2.5 text-green-500" />}
                                  {notif.type === 'inquiry' && <Briefcase className="w-2.5 h-2.5 text-purple-600" />}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-900 leading-snug">
                                  <strong className="font-bold">{notif.actor?.displayName || notif.actor?.username || 'Someone'}</strong>{' '}
                                  {notif.type === 'like' && 'liked your photo'}
                                  {notif.type === 'comment' && `commented: "${notif.content || ''}"`}
                                  {notif.type === 'follow' && 'started following your gallery'}
                                  {notif.type === 'inquiry' && `sent a booking inquiry: ${notif.content || ''}`}
                                </p>
                                <span className="text-[10px] text-gray-400 block mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>

                              {notif.photo && (
                                <img
                                  src={notif.photo.thumbnailUrl || notif.photo.imageUrl}
                                  alt=""
                                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-200"
                                />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to={`/profile/${user.username}`}
                  title="View your profile"
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 py-1.5 px-3 rounded-full border border-gray-200 transition-colors group cursor-pointer"
                >
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=creator'}
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="text-xs font-bold text-gray-800 group-hover:text-black">{user.displayName || user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/Login"
                  className="text-sm font-medium text-gray-700 hover:text-black px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Log in
                </Link>

                <Link
                  to="/Signup"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-black rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos & hashtags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 text-gray-900 text-sm rounded-full pl-10 pr-4 py-2 outline-none border border-transparent focus:border-gray-300"
            />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/collections"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl font-bold text-sm transition-colors"
          >
            <Folder className="w-4 h-4 text-gray-600" />
            Explore Collections & Moodboards
          </Link>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenUpload();
            }}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl font-medium text-sm"
          >
            <UploadCloud className="w-4 h-4" />
            Submit a Photo
          </button>
          
          {user ? (
            <div className="pt-2 space-y-2 border-t border-gray-100">
              {user.role === 'admin' && (
                <Link
                  to="/Admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 py-2 rounded-xl text-sm font-bold"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Admin Command Center
                </Link>
              )}
              <div className="flex items-center justify-between">
                <Link
                  to={`/profile/${user.username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-black"
                >
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=creator'}
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>{user.displayName || user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-600 font-semibold"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                to="/Login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700"
              >
                Log In
              </Link>
              <Link
                to="/Signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
