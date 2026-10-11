import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, Download, Eye, Camera, Calendar, MapPin, 
  Share2, Edit3, UploadCloud, Check, ShieldCheck, 
  Sparkles, Trash2, ArrowLeft, UserCheck, Plus
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PhotoModal from '../components/PhotoModal';
import UploadModal from '../components/UploadModal';
import { 
  getUserProfile, updateUserProfile, deleteUserPhoto, 
  getCurrentUser
} from '../services/api';

export default function ProfilePage() {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
  const targetUsername = paramUsername || currentUser?.username;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'likes' | 'stats'
  
  // Modals & Interactivity
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const isOwnProfile = currentUser && profileData && (
    currentUser.username?.toLowerCase() === profileData.profile.username?.toLowerCase() ||
    currentUser.id === profileData.profile.id
  );

  const fetchProfile = useCallback(async () => {
    if (!targetUsername) {
      navigate('/Login');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getUserProfile(targetUsername);
      setProfileData(data);
      setEditName(data.profile.displayName);
      setEditBio(data.profile.bio || '');
      setEditAvatar(data.profile.avatarUrl || '');
    } catch (err) {
      setError(err.message || 'User profile not found.');
    } finally {
      setLoading(false);
    }
  }, [targetUsername, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateUserProfile({
        displayName: editName,
        bio: editBio,
        avatarUrl: editAvatar,
      });
      setProfileData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          displayName: updated.displayName,
          bio: updated.bio,
          avatarUrl: updated.avatarUrl,
        },
      }));
      setEditModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeletePhoto = async (e, photoId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this photo permanently?')) return;

    try {
      await deleteUserPhoto(photoId);
      setProfileData((prev) => ({
        ...prev,
        photos: prev.photos.filter((p) => p.id !== photoId),
        profile: {
          ...prev.profile,
          stats: {
            ...prev.profile.stats,
            photosCount: Math.max(0, prev.profile.stats.photosCount - 1),
          },
        },
      }));
    } catch (err) {
      alert('Failed to delete photo: ' + err.message);
    }
  };

  const handlePhotoUpdate = (updatedPhoto) => {
    setProfileData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        photos: prev.photos.map((p) => (p.id === updatedPhoto.id ? { ...p, ...updatedPhoto } : p)),
        likedPhotos: prev.likedPhotos.map((p) => (p.id === updatedPhoto.id ? { ...p, ...updatedPhoto } : p)),
      };
    });
    if (selectedPhoto && selectedPhoto.id === updatedPhoto.id) {
      setSelectedPhoto((prev) => ({ ...prev, ...updatedPhoto }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Navbar onOpenUpload={() => setUploadModalOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="mt-4 text-xs font-semibold text-gray-400">Loading creator profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Navbar onOpenUpload={() => setUploadModalOpen(true)} />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Profile Not Found</h2>
          <p className="text-sm text-gray-500 mt-2">{error || "The requested user account doesn't exist on #Hashtag."}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Photos</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { profile, photos, likedPhotos } = profileData;
  const { stats } = profile;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar onOpenUpload={() => setUploadModalOpen(true)} />

      {/* Hero Cover Banner */}
      <div className="relative h-48 sm:h-64 md:h-72 w-full bg-gradient-to-r from-gray-900 via-neutral-800 to-black overflow-hidden shadow-inner">
        {/* Abstract pattern backdrop */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Top bar breadcrumb / back */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Feed</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-200 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full transition-all"
              title="Share profile link"
            >
              {shareToast ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{shareToast ? 'Copied!' : 'Share Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 z-20 pb-16">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-gray-100">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
            
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="relative group">
                <img
                  src={profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
                  alt={profile.displayName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-2xl bg-gray-100"
                />
                {isOwnProfile && (
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="absolute bottom-1 right-1 p-2 rounded-xl bg-black text-white hover:bg-gray-800 shadow-lg transition-transform hover:scale-105"
                    title="Change Avatar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {profile.displayName}
                  </h1>

                  {/* Role badge */}
                  {profile.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                      <ShieldCheck className="w-3 h-3 text-purple-600" />
                      Super Admin
                    </span>
                  ) : profile.role === 'creator' ? (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      Verified Creator
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      Explorer
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-gray-400 mt-0.5">
                  @{profile.username}
                </p>

                {profile.bio && (
                  <p className="text-sm text-gray-600 mt-3 max-w-xl leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-400 mt-3 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>Available Globally</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-center gap-3">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-md active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-sm active:scale-95 ${
                      isFollowing
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        : 'bg-black hover:bg-gray-800 text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Follow Creator</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full transition-colors"
                  >
                    <span>Hire Me</span>
                  </a>
                </>
              )}
            </div>

          </div>

          {/* Real Telemetry Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-6 border-b border-gray-100">
            
            <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/80">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Uploaded</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.photosCount}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/80">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Total Views</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/80">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Downloads</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.totalDownloads.toLocaleString()}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100/80">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Likes Received</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.totalLikes.toLocaleString()}</p>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-6">
            <button
              onClick={() => setActiveTab('photos')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'photos'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photos ({photos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('likes')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'likes'
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Favorites & Likes ({likedPhotos.length})</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="pt-8">
            {activeTab === 'photos' ? (
              photos.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No photos shared yet</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    {isOwnProfile
                      ? 'Upload your best high-resolution work to start sharing with the world.'
                      : `${profile.displayName} hasn't uploaded any photos to #Hashtag yet.`}
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-800"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Photo Now</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-zoom-in bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <img
                        src={photo.thumbnail}
                        alt={photo.title}
                        loading="lazy"
                        className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                        
                        {/* Top controls */}
                        <div className="flex justify-end gap-2">
                          {isOwnProfile && (
                            <button
                              onClick={(e) => handleDeletePhoto(e, photo.id)}
                              title="Delete Photo"
                              className="p-2 rounded-full bg-red-600/90 hover:bg-red-600 text-white backdrop-blur-md transition-all active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Bottom Info */}
                        <div className="text-white">
                          <p className="font-bold text-sm leading-tight drop-shadow truncate">{photo.title}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-300 mt-1.5 font-medium">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {photo.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" /> {photo.downloads || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-red-400 fill-current" /> {photo.likes || 0}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              likedPhotos.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No favorited photos</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Photos you like while exploring the platform will be collected here.
                  </p>
                  <Link
                    to="/"
                    className="mt-4 inline-flex items-center gap-2 bg-black text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-800"
                  >
                    <span>Browse Gallery</span>
                  </Link>
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                  {likedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-zoom-in bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <img
                        src={photo.thumbnail}
                        alt={photo.title}
                        loading="lazy"
                        className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                        <div className="text-white">
                          <p className="font-bold text-sm leading-tight drop-shadow truncate">{photo.title}</p>
                          <p className="text-xs text-gray-300 truncate mt-0.5">by {photo.photographer.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onPhotoUpdate={handlePhotoUpdate}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={(newPhoto) => {
          setProfileData((prev) => ({
            ...prev,
            photos: [newPhoto, ...prev.photos],
            profile: {
              ...prev.profile,
              stats: {
                ...prev.profile.stats,
                photosCount: prev.profile.stats.photosCount + 1,
              },
            },
          }));
        }}
      />

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-scaleIn">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Edit Your Profile</h2>
            <p className="text-xs text-gray-500 mt-1">Update your display information and creator bio.</p>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
                <p className="text-[11px] text-gray-400 mt-1">Paste any hosted image URL (Unsplash, DiceBear, etc.).</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Bio</label>
                <textarea
                  rows="3"
                  placeholder="Tell the world about your photography journey and style..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 bg-black hover:bg-gray-800 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
