import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Image as ImageIcon, Users, Download, Eye, 
  Trash2, Star, ArrowLeft, RefreshCw, CheckCircle2, HardDrive
} from 'lucide-react';
import { 
  getAdminStats, getAdminPhotos, toggleFeaturePhoto, 
  deletePhoto, getAdminUsers, updateUserRole, deleteUser, getCurrentUser 
} from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'users' | 'system'
  const [feedback, setFeedback] = useState('');
  
  const currentUser = getCurrentUser();

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, photosData, usersData] = await Promise.all([
        getAdminStats(),
        getAdminPhotos(),
        getAdminUsers(),
      ]);
      setStats(statsData);
      setPhotos(photosData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFeature = async (photoId) => {
    try {
      await toggleFeaturePhoto(photoId);
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, isFeatured: !p.isFeatured } : p))
      );
      setFeedback('Photo featured status updated!');
      setTimeout(() => setFeedback(''), 2500);
    } catch (err) {
      alert('Failed to update photo status');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo permanently?')) return;
    try {
      await deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      if (stats) setStats({ ...stats, totalPhotos: stats.totalPhotos - 1 });
      setFeedback('Photo successfully removed from platform!');
      setTimeout(() => setFeedback(''), 2500);
    } catch (err) {
      alert('Failed to delete photo');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setFeedback('User permissions updated!');
      setTimeout(() => setFeedback(''), 2500);
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their uploaded photos?')) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      loadData();
      setFeedback('User account removed!');
      setTimeout(() => setFeedback(''), 2500);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Admin Access Required</h2>
            <p className="text-sm text-gray-500 mt-1">
              This Command Center is restricted to platform administrators. Please sign in with an administrator account to view telemetry and moderate content.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs text-left font-mono text-gray-700 space-y-1">
            <div className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              Super Admin Demo Account:
            </div>
            <div>Username: <span className="font-bold text-purple-700 select-all">admin</span></div>
            <div>Password: <span className="font-bold text-purple-700 select-all">adminpassword123</span></div>
          </div>
          <div className="pt-2 flex gap-3">
            <Link
              to="/Login"
              className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm text-center"
            >
              Sign In as Admin
            </Link>
            <Link
              to="/"
              className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors text-center"
            >
              Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white pb-20">
      
      {/* Top Admin Navbar */}
      <header className="bg-black text-white border-b border-gray-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight">#Hashtag Admin</span>
              <span className="ml-2 text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                Command Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              title="Refresh Data"
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Toast Alert */}
        {feedback && (
          <div className="mb-6 p-4 bg-green-500 text-white rounded-2xl flex items-center gap-2 text-xs font-bold shadow-lg animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Section Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Platform Overview & Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage photo submissions, creators, and database metrics in real time.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Photos</p>
              <h3 className="text-2xl font-black text-gray-900">{stats?.totalPhotos || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-black text-gray-900">{stats?.totalUsers || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Downloads</p>
              <h3 className="text-2xl font-black text-gray-900">{(stats?.totalDownloads || 0).toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform Views</p>
              <h3 className="text-2xl font-black text-gray-900">{(stats?.totalViews || 0).toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('photos')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'photos'
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo Moderation ({photos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'system'
                ? 'border-black text-black'
                : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>System Health</span>
          </button>
        </div>

        {/* TAB 1: Photo Moderation Table */}
        {activeTab === 'photos' && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Preview & Title</th>
                    <th className="py-4 px-6">Creator</th>
                    <th className="py-4 px-6">Hashtags</th>
                    <th className="py-4 px-6">Engagement</th>
                    <th className="py-4 px-6">Featured</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {photos.map((photo) => (
                    <tr key={photo.id} className="hover:bg-gray-50/80 transition-colors">
                      
                      {/* Image & Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo.thumbnailUrl}
                            alt={photo.title}
                            className="w-14 h-10 object-cover rounded-xl shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{photo.title}</p>
                            <p className="text-xs text-gray-400">{photo.location || 'Global'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-800">{photo.user?.displayName || 'Unknown'}</span>
                        <span className="block text-xs text-gray-400">@{photo.user?.username}</span>
                      </td>

                      {/* Tags */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {photo.tags?.map((pt) => (
                            <span key={pt.tag.id} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                              #{pt.tag.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="py-4 px-6 text-xs text-gray-500">
                        <span>👁️ {photo.viewsCount}</span> • <span>⬇️ {photo.downloadsCount}</span>
                      </td>

                      {/* Featured toggle */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleFeature(photo.id)}
                          className={`p-2 rounded-xl transition-all ${
                            photo.isFeatured
                              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                              : 'bg-gray-100 text-gray-400 hover:text-amber-500'
                          }`}
                          title={photo.isFeatured ? 'Featured on Homepage' : 'Mark as Featured'}
                        >
                          <Star className={`w-4 h-4 ${photo.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      {/* Delete */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: User Management Table */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Photos Uploaded</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                            alt={u.username}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{u.displayName}</p>
                            <p className="text-xs text-gray-400">@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-gray-600 text-xs">
                        {u.email}
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          <option value="creator">Creator</option>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-xs text-gray-600 font-semibold">
                        {u._count?.photos || 0} photos
                      </td>

                      <td className="py-4 px-6 text-right">
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: System Health */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-900">Database Engine</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold">Engine:</span>
                  <span className="font-bold text-gray-900">SQLite (File-based SQL)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold">ORM:</span>
                  <span className="font-bold text-gray-900">Prisma Client v5.21</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold">Location:</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded">server/prisma/dev.db</code>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Status:</span>
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Active & Connected
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-900">Services & Endpoints</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold">REST API Server:</span>
                  <span className="text-gray-900 font-bold">http://localhost:5000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold">React Client:</span>
                  <span className="text-gray-900 font-bold">http://localhost:3000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold">Media Upload Path:</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded">server/uploads/</code>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Upload Limit:</span>
                  <span className="text-gray-900 font-bold">120 MB per file</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
