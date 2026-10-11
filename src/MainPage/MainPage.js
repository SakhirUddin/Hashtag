import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import HashtagBar from '../components/HashtagBar';
import MasonryGrid from '../components/MasonryGrid';
import PhotoModal from '../components/PhotoModal';
import UploadModal from '../components/UploadModal';
import Footer from '../components/Footer';
import { getPhotos } from '../services/api';
import { MOCK_PHOTOS } from '../data/mockPhotos';

export default function MainPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch photos from backend API
  const loadPhotos = useCallback(async (tag, query) => {
    setLoading(true);
    try {
      const data = await getPhotos(tag, query);
      setPhotos(data);
    } catch (err) {
      console.warn('Backend API unavailable, falling back to cached photos:', err);
      // Client-side fallback if server is offline
      const filtered = MOCK_PHOTOS.filter((p) => {
        const matchesTag = tag === 'All' || p.hashtags.some(t => t.toLowerCase() === tag.toLowerCase());
        const term = query.toLowerCase().trim();
        const matchesSearch = !term || p.title.toLowerCase().includes(term) || p.hashtags.some(t => t.toLowerCase().includes(term));
        return matchesTag && matchesSearch;
      });
      setPhotos(filtered);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPhotos(activeTag, searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeTag, searchTerm, loadPhotos]);

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
      />

      {/* Main Content Gallery */}
      <main id="gallery-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {searchTerm
                ? `Results for "${searchTerm}"`
                : activeTag === 'All'
                ? 'Curated Free Photos'
                : `#${activeTag} Photos`}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {loading ? 'Fetching photos from database...' : `Showing ${photos.length} photos from SQLite database`}
            </p>
          </div>

          {(searchTerm || activeTag !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTag('All');
              }}
              className="text-xs font-semibold text-gray-500 hover:text-black underline underline-offset-4"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading Spinner or Masonry Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Querying #Hashtag SQLite database...</p>
          </div>
        ) : (
          <MasonryGrid
            photos={photos}
            onPhotoClick={(photo) => setSelectedPhoto(photo)}
            onPhotoUpdate={handlePhotoUpdate}
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
      />

      {/* Creator Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}