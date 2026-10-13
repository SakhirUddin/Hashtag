import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Globe, Trash2, Calendar, Folder, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MasonryGrid from '../components/MasonryGrid';
import PhotoModal from '../components/PhotoModal';
import AddToCollectionModal from '../components/AddToCollectionModal';
import { getCollectionDetail, deleteCollectionApi } from '../services/api';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [saveModalPhoto, setSaveModalPhoto] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCollection = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCollectionDetail(id);
      setCollection(data);
    } catch (err) {
      console.error('Fetch collection failed:', err);
      setError(err.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${collection.title}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteCollectionApi(id);
      navigate(-1);
    } catch (err) {
      alert(err.message || 'Failed to delete collection');
      setDeleting(false);
    }
  };

  // Convert raw photos into MasonryGrid compatible shape
  const mappedPhotos = collection?.photos?.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    url: p.imageUrl,
    thumbnail: p.thumbnailUrl,
    width: p.width,
    height: p.height,
    aspectRatio: p.aspectRatio,
    likes: p.likesCount,
    downloads: p.downloadsCount,
    views: p.viewsCount,
    isLiked: p.isLiked,
    photographer: {
      name: p.user?.displayName || 'Creator',
      username: p.user?.username || 'creator',
      avatarUrl: p.user?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${p.user?.username}`,
    },
    tags: p.tags || [],
    camera: p.camera,
    lens: p.lens,
    location: p.location,
    createdAt: p.createdAt,
  })) || [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar onSearch={() => {}} onTagSelect={() => {}} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-black animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading collection...</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Collection Unavailable</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-all shadow-md"
            >
              Return to Feed
            </button>
          </div>
        ) : (
          <div>
            {/* Collection Header Banner */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/70 border border-gray-200/70 rounded-3xl p-6 sm:p-10 mb-10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        collection.isPrivate
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {collection.isPrivate ? (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Private Collection</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3" />
                          <span>Public Collection</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {collection.photoCount} {collection.photoCount === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {collection.title}
                  </h1>

                  {collection.description && (
                    <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
                      {collection.description}
                    </p>
                  )}

                  {/* Curator Meta */}
                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      to={`/profile/${collection.curator.username}`}
                      className="flex items-center gap-2.5 group"
                    >
                      <img
                        src={
                          collection.curator.avatarUrl ||
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${collection.curator.username}`
                        }
                        alt={collection.curator.displayName}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="text-xs font-bold text-gray-800 group-hover:underline">
                        Curated by {collection.curator.displayName}
                      </span>
                    </Link>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(collection.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Owner Actions */}
                {collection.isOwner && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deleting ? 'Deleting...' : 'Delete Collection'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Photos Grid */}
            {mappedPhotos.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">This collection is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Browse the feed and click the bookmark button on any photo to save it here.
                </p>
                <Link
                  to="/"
                  className="mt-4 inline-block px-6 py-2 bg-black text-white rounded-full text-xs font-semibold hover:bg-gray-800 transition-all shadow-md"
                >
                  Explore Photos
                </Link>
              </div>
            ) : (
              <MasonryGrid
                photos={mappedPhotos}
                onPhotoClick={(photo) => setSelectedPhoto(photo)}
                onSaveToCollection={(photo) => setSaveModalPhoto(photo)}
              />
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Detail Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onSaveToCollection={(p) => setSaveModalPhoto(p)}
        />
      )}

      {/* Save to Collection Modal */}
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
