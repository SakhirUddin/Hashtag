import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Loader2, Plus, Sparkles, Layers } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCollections, getCurrentUser } from '../services/api';

export default function CollectionsExplorePage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = getCurrentUser();

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (err) {
      console.error('Fetch collections error:', err);
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onSearch={() => {}} onTagSelect={() => {}} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Inspiration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Collections & Moodboards
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Explore themed visual collections handpicked by the #Hashtag community, from minimalist architecture to nocturnal street photography.
            </p>
          </div>

          {currentUser && (
            <Link
              to="/profile"
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start sm:self-auto active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Manage My Collections</span>
            </Link>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-black animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Discovering moodboards...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Failed to Load Collections</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">{error}</p>
            <button
              onClick={fetchCollections}
              className="px-5 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800"
            >
              Retry
            </button>
          </div>
        ) : collections.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No public collections yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Be the first to curate a moodboard and share your visual taste with the community!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => {
              const preview = col.previewPhotos || [];
              const mainPhoto = preview[0];
              const subPhoto1 = preview[1];
              const subPhoto2 = preview[2];

              return (
                <Link
                  key={col.id}
                  to={`/collections/${col.id}`}
                  className="group flex flex-col rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 bg-white p-3"
                >
                  {/* Collage Preview Box */}
                  <div className="h-56 w-full rounded-2xl overflow-hidden bg-gray-100 flex gap-1.5 p-1">
                    {/* Main Left Image (2/3 width) */}
                    <div className="flex-1 h-full rounded-xl overflow-hidden bg-gray-200">
                      {mainPhoto ? (
                        <img
                          src={mainPhoto.thumbnailUrl || mainPhoto.imageUrl}
                          alt={mainPhoto.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Folder className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Right Stacked 2 Images (1/3 width) */}
                    <div className="w-28 sm:w-32 h-full flex flex-col gap-1.5">
                      <div className="flex-1 rounded-xl overflow-hidden bg-gray-200">
                        {subPhoto1 ? (
                          <img
                            src={subPhoto1.thumbnailUrl || subPhoto1.imageUrl}
                            alt={subPhoto1.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                      </div>
                      <div className="flex-1 rounded-xl overflow-hidden bg-gray-200">
                        {subPhoto2 ? (
                          <img
                            src={subPhoto2.thumbnailUrl || subPhoto2.imageUrl}
                            alt={subPhoto2.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meta Details */}
                  <div className="p-3 pt-4 flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      <h3 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-blue-600 transition-colors">
                        {col.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {col.photoCount} {col.photoCount === 1 ? 'photo' : 'photos'} • Curated by {col.curator.displayName}
                      </p>
                    </div>

                    <img
                      src={
                        col.curator.avatarUrl ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${col.curator.username}`
                      }
                      alt={col.curator.displayName}
                      className="w-8 h-8 rounded-full object-cover border border-gray-100 flex-shrink-0"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
