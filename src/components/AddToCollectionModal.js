import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Lock, Globe, Check, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  getMyCollectionsStatus,
  createCollectionApi,
  addPhotoToCollectionApi,
  removePhotoFromCollectionApi,
} from '../services/api';

export default function AddToCollectionModal({ isOpen, onClose, photo }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const navigate = useNavigate();
  const user = getCurrentUser();

  const loadCollections = React.useCallback(async () => {
    if (!user || !photo) return;
    setLoading(true);
    try {
      const data = await getMyCollectionsStatus(photo.id);
      setCollections(data);
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setLoading(false);
    }
  }, [user, photo]);

  useEffect(() => {
    if (isOpen && photo) {
      if (user) {
        loadCollections();
      } else {
        setLoading(false);
      }
      setShowCreate(false);
      setNewTitle('');
      setNewDescription('');
      setNewIsPrivate(false);
    }
  }, [isOpen, photo, user, loadCollections]);

  if (!isOpen || !photo) return null;

  const handleToggleSave = async (col) => {
    setProcessingId(col.id);
    try {
      if (col.hasPhoto) {
        await removePhotoFromCollectionApi(col.id, photo.id);
        setCollections((prev) =>
          prev.map((c) =>
            c.id === col.id
              ? { ...c, hasPhoto: false, photoCount: Math.max(0, c.photoCount - 1) }
              : c
          )
        );
      } else {
        await addPhotoToCollectionApi(col.id, photo.id);
        setCollections((prev) =>
          prev.map((c) =>
            c.id === col.id ? { ...c, hasPhoto: true, photoCount: c.photoCount + 1 } : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to update collection photo:', err);
      alert(err.message || 'Error updating collection');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const newCol = await createCollectionApi({
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        isPrivate: newIsPrivate,
      });

      // Automatically save current photo to the newly created collection
      await addPhotoToCollectionApi(newCol.id, photo.id);

      // Reload list
      await loadCollections();
      setShowCreate(false);
      setNewTitle('');
      setNewDescription('');
      setNewIsPrivate(false);
    } catch (err) {
      console.error('Create collection failed:', err);
      alert(err.message || 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={photo.thumbnail || photo.url}
              alt={photo.title}
              className="w-11 h-11 rounded-xl object-cover shadow-sm"
            />
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                Save to Collection
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[220px]">
                {photo.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[380px] overflow-y-auto">
          {!user ? (
            <div className="text-center py-6">
              <FolderPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-bold text-gray-800 text-base">Sign In Required</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Sign in to your #Hashtag account to create moodboards and save inspiration.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/Login');
                }}
                className="mt-4 px-6 py-2.5 bg-black text-white rounded-full font-semibold text-xs hover:bg-gray-800 transition-all shadow-md active:scale-95"
              >
                Sign In to Continue
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-gray-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading your collections...</span>
            </div>
          ) : showCreate ? (
            /* Create Collection Form */
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">New Collection</h4>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nordic Architecture, Golden Hour"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief note about this collection..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalPrivate"
                  checked={newIsPrivate}
                  onChange={(e) => setNewIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                />
                <label
                  htmlFor="modalPrivate"
                  className="text-xs text-gray-700 flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Make this collection private</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="w-full py-2.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating & Saving...</span>
                  </>
                ) : (
                  <span>Create & Save Photo</span>
                )}
              </button>
            </form>
          ) : (
            /* Collection List */
            <div className="space-y-2">
              {collections.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <FolderPlus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">You don't have any collections yet.</p>
                </div>
              ) : (
                collections.map((col) => {
                  const isProcessing = processingId === col.id;

                  return (
                    <div
                      key={col.id}
                      onClick={() => !isProcessing && handleToggleSave(col)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                        col.hasPhoto
                          ? 'border-green-200 bg-green-50/50 hover:bg-green-50'
                          : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            col.hasPhoto
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {col.isPrivate ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {col.title}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {col.photoCount} {col.photoCount === 1 ? 'photo' : 'photos'}
                            {col.isPrivate && ' • Private'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isProcessing}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                          col.hasPhoto
                            ? 'bg-green-600 text-white shadow-sm hover:bg-red-500 hover:shadow-red-200'
                            : 'bg-gray-100 hover:bg-black hover:text-white text-gray-700'
                        }`}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : col.hasPhoto ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {user && !showCreate && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 text-xs font-bold text-gray-800 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Collection</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
