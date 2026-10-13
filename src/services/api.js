const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('hashtag_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getPhotos(tag = 'All', search = '', sort = 'latest', orientation = 'all', feed = 'explore') {
  const params = new URLSearchParams();
  if (tag && tag.toLowerCase() !== 'all') params.append('tag', tag);
  if (search && search.trim()) params.append('q', search.trim());
  if (sort && sort !== 'latest') params.append('sort', sort);
  if (orientation && orientation !== 'all') params.append('orientation', orientation);
  if (feed && feed === 'following') params.append('feed', 'following');

  const response = await fetch(`${API_BASE}/photos?${params.toString()}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch photos');
  const data = await response.json();
  return data.photos;
}

export async function getRelatedPhotos(photoId) {
  try {
    const response = await fetch(`${API_BASE}/photos/${photoId}/related`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.photos || [];
  } catch (err) {
    return [];
  }
}

export async function getTags() {
  const response = await fetch(`${API_BASE}/tags`);
  if (!response.ok) throw new Error('Failed to fetch tags');
  const data = await response.json();
  return data.tags;
}

export async function uploadPhotoApi(formData) {
  const response = await fetch(`${API_BASE}/photos/upload`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload photo');
  }
  const data = await response.json();
  return data.photo;
}

export async function recordViewApi(photoId) {
  try {
    const response = await fetch(`${API_BASE}/photos/${photoId}/view`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    return null;
  }
}

export async function likePhotoApi(photoId) {
  const response = await fetch(`${API_BASE}/photos/${photoId}/like`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'Failed to update like');
    error.requireAuth = data.requireAuth || false;
    throw error;
  }
  return data;
}

export async function trackDownloadApi(photoId, size = 'original') {
  const response = await fetch(`${API_BASE}/photos/${photoId}/download?size=${size}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to record download');
  return await response.json();
}

// Authentication APIs
export async function loginApi(identifier, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Invalid credentials');
  localStorage.setItem('hashtag_token', data.token);
  localStorage.setItem('hashtag_user', JSON.stringify(data.user));
  return data;
}

export async function registerApi(userData) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create account');
  localStorage.setItem('hashtag_token', data.token);
  localStorage.setItem('hashtag_user', JSON.stringify(data.user));
  return data;
}

export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('hashtag_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('hashtag_token');
  localStorage.removeItem('hashtag_user');
}

// Admin APIs
export async function getAdminStats() {
  const response = await fetch(`${API_BASE}/admin/stats`);
  if (!response.ok) throw new Error('Failed to fetch admin stats');
  return await response.json();
}

export async function getAdminPhotos() {
  const response = await fetch(`${API_BASE}/admin/photos`);
  if (!response.ok) throw new Error('Failed to fetch admin photos');
  const data = await response.json();
  return data.photos;
}

export async function toggleFeaturePhoto(photoId) {
  const response = await fetch(`${API_BASE}/admin/photos/${photoId}/feature`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error('Failed to toggle featured status');
  return await response.json();
}

export async function deletePhoto(photoId) {
  const response = await fetch(`${API_BASE}/admin/photos/${photoId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete photo');
  return await response.json();
}

export async function getAdminUsers() {
  const response = await fetch(`${API_BASE}/admin/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  const data = await response.json();
  return data.users;
}

export async function updateUserRole(userId, role) {
  const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw new Error('Failed to update user role');
  return await response.json();
}

export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return await response.json();
}

// User Profile APIs
export async function getUserProfile(username) {
  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load user profile');
  }
  return await response.json();
}

export async function updateUserProfile(profileData) {
  const response = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update profile');
  }
  const data = await response.json();
  localStorage.setItem('hashtag_user', JSON.stringify(data.user));
  return data.user;
}

export async function deleteUserPhoto(photoId) {
  const response = await fetch(`${API_BASE}/users/photos/${photoId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to delete photo');
  return await response.json();
}

// Collections APIs
export async function getCollections() {
  const response = await fetch(`${API_BASE}/collections`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch collections');
  const data = await response.json();
  return data.collections;
}

export async function getCollectionDetail(collectionId) {
  const response = await fetch(`${API_BASE}/collections/${collectionId}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch collection details');
  }
  const data = await response.json();
  return data.collection;
}

export async function getMyCollectionsStatus(photoId) {
  const params = photoId ? `?photoId=${encodeURIComponent(photoId)}` : '';
  const response = await fetch(`${API_BASE}/collections/my/status${params}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch my collections');
  const data = await response.json();
  return data.collections;
}

export async function getUserCollections(username) {
  const response = await fetch(`${API_BASE}/collections/user/${encodeURIComponent(username)}`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch user collections');
  const data = await response.json();
  return data;
}

export async function createCollectionApi({ title, description, isPrivate }) {
  const response = await fetch(`${API_BASE}/collections`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, isPrivate }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create collection');
  }
  const data = await response.json();
  return data.collection;
}

export async function addPhotoToCollectionApi(collectionId, photoId) {
  const response = await fetch(`${API_BASE}/collections/${collectionId}/photos`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ photoId }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add photo to collection');
  }
  return await response.json();
}

export async function removePhotoFromCollectionApi(collectionId, photoId) {
  const response = await fetch(`${API_BASE}/collections/${collectionId}/photos/${photoId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to remove photo from collection');
  return await response.json();
}

export async function deleteCollectionApi(collectionId) {
  const response = await fetch(`${API_BASE}/collections/${collectionId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to delete collection');
  return await response.json();
}

// Social & Community APIs
export async function followUserApi(userId) {
  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/follow`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update follow status');
  }
  return await response.json();
}

export async function getPhotoComments(photoId) {
  const response = await fetch(`${API_BASE}/photos/${photoId}/comments`, {
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch comments');
  const data = await response.json();
  return data.comments || [];
}

export async function postPhotoComment(photoId, content) {
  const response = await fetch(`${API_BASE}/photos/${photoId}/comments`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to post comment');
  }
  const data = await response.json();
  return data.comment;
}

export async function deletePhotoComment(photoId, commentId) {
  const response = await fetch(`${API_BASE}/photos/${photoId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to delete comment');
  return await response.json();
}

