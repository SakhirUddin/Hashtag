import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import HashtagBar from '../components/HashtagBar';
import MasonryGrid from '../components/MasonryGrid';
import PhotoModal from '../components/PhotoModal';
import UploadModal from '../components/UploadModal';
import AddToCollectionModal from '../components/AddToCollectionModal';
import Footer from '../components/Footer';
import { getPhotos, getCurrentUser } from '../services/api';
import { MOCK_PHOTOS } from '../data/mockPhotos';

export default function MainPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFeed, setActiveFeed] = useState('explore'); // 'explore' | 'following'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [activeSort, setActiveSort] = useState('latest');
  const [activeOrientation, setActiveOrientation] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [saveModalPhoto, setSaveModalPhoto] = useState(null);

  const currentUser = getCurrentUser();

  // Fetch photos from backend API
  const loadPhotos = useCallback(async (tag, query, sort, orientation, feed) => {
    setLoading(true);
    try {
      const data = await getPhotos(tag, query, sort, orientation, feed);
      setPhotos(data);
    } catch (err) {
      console.warn('Backend API unavailable, falling back to cached photos:', err);
      // Client-side fallback if server is offline
      let filtered = MOCK_PHOTOS.filter((p) => {
        const matchesTag = tag === 'All' || p.hashtags.some(t => t.toLowerCase() === tag.toLowerCase());
        const term = query.toLowerCase().trim();
        const matchesSearch = !term || p.title.toLowerCase().includes(term) || p.hashtags.some(t => t.toLowerCase().includes(term));
        return matchesTag && matchesSearch;
      });
      if (sort === 'popular') filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      if (sort === 'downloads') filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      if (sort === 'views') filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      setPhotos(filtered);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPhotos(activeTag, searchTerm, activeSort, activeOrientation, activeFeed);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeTag, searchTerm, activeSort, activeOrientation, activeFeed, loadPhotos]);

  const handleSelectHashtag = (tag) => {
    setActiveTag(tag);
    const galleryElem = document.getElementById('gallery-section');
    if (galleryElem) {
      galleryElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUploadSuccess = (newPhoto) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handlePhotoUpdate = useCallback((updatedPhoto) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === updatedPhoto.id ? { ...p, ...updatedPhoto } : p))
    );
    setSelectedPhoto((prev) =>
      prev && prev.id === updatedPhoto.id ? { ...prev, ...updatedPhoto } : prev
    );
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Sticky Header */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenUpload={() => setUploadModalOpen(true)}
      />

      {/* Hero Banner */}
      {!searchTerm && (
        <HeroBanner
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelectTag={handleSelectHashtag}
        />
      )}

      {/* Sticky Hashtags Filter Pill Bar */}
      <HashtagBar
        activeTag={activeTag}
        onSelectTag={handleSelectHashtag}
        activeSort={activeSort}
        onSelectSort={(s) => setActiveSort(s)}
        activeOrientation={activeOrientation}
        onSelectOrientation={(o) => setActiveOrientation(o)}
        onResetFilters={() => {
          setSearchTerm('');
          setActiveTag('All');
          setActiveSort('latest');
          setActiveOrientation('all');
        }}
      />

      {/* Main Content Gallery */}
      <main id="gallery-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Feed Switcher Tabs: Explore vs Following */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <button
            onClick={() => setActiveFeed('explore')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeFeed === 'explore'
                ? 'bg-black text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore Global</span>
          </button>

          <button
            onClick={() => setActiveFeed('following')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
              activeFeed === 'following'
                ? 'bg-black text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Following Network</span>
          </button>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {activeFeed === 'following'
                ? 'Following Network Feed'
                : searchTerm
                ? `Results for "${searchTerm}"`
                : activeTag === 'All'
                ? 'Curated Free Photos'
                : `#${activeTag} Photos`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {loading 
                ? 'Fetching photos from database...' 
                : activeFeed === 'following'
                ? `Showing ${photos.length} photos from creators you follow`
                : `Showing ${photos.length} photos from SQLite database`}
            </p>
          </div>

          {(searchTerm || activeTag !== 'All' || activeSort !== 'latest' || activeOrientation !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTag('All');
                setActiveSort('latest');
                setActiveOrientation('all');
              }}
              className="text-xs font-semibold text-gray-500 hover:text-black underline underline-offset-4"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Loading Spinner or Masonry Grid or Empty States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Querying #Hashtag SQLite database...</p>
          </div>
        ) : activeFeed === 'following' && !currentUser ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Follow creators you love</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Sign in to follow talented creators and see their newest uploads curated in your personalized network feed.
            </p>
            <Link
              to="/Login"
              className="mt-6 inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white font-bold text-xs px-6 py-3 rounded-full transition-all shadow-md"
            >
              Sign In or Create Account
            </Link>
          </div>
        ) : activeFeed === 'following' && photos.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Your network feed is empty</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              You haven't followed any creators yet, or the creators you follow haven't posted new shots yet.
            </p>
            <button
              onClick={() => setActiveFeed('explore')}
              className="mt-6 inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white font-bold text-xs px-6 py-3 rounded-full transition-all shadow-md"
            >
              Discover Creators in Explore
            </button>
          </div>
        ) : (
          <MasonryGrid
            photos={photos}
            onPhotoClick={(photo) => setSelectedPhoto(photo)}
            onPhotoUpdate={handlePhotoUpdate}
            onSaveToCollection={(photo) => setSaveModalPhoto(photo)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Photo QuickView Modal */}
      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onSelectHashtag={handleSelectHashtag}
        onPhotoUpdate={handlePhotoUpdate}
        onSaveToCollection={(photo) => setSaveModalPhoto(photo)}
      />

      {/* Creator Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Add To Collection Modal */}
      {saveModalPhoto && (
        <AddToCollectionModal
          isOpen={Boolean(saveModalPhoto)}
          photo={saveModalPhoto}
          onClose={() => setSaveModalPhoto(null)}
        />
      )}
    </div>
  );
}