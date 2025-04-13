const API_URL = import.meta.env.VITE_API_URL;

const apiRequest = async (url, method = 'GET', body = null, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
  
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const options = {
      method,
      headers,
    };
  
    if (body) {
      options.body = JSON.stringify(body);
    }
  
    try {
      const response = await fetch(`${API_URL}${url}`, options);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }
  
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Response is not JSON');
      }
  
    } catch (error) {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  };

export const getPosts = async () => {
    return await apiRequest('/api/posts?published=true');
  };

export const getPostById = async (id) => {
  return await apiRequest(`/api/posts/${id}`);
};

export const registerUser = async (email, username, password) => {
  return await apiRequest('/api/auth/register', 'POST', { email, username, password });
};

export const loginUser = async (email, password) => {
  return await apiRequest('/api/auth/login', 'POST', { email, password });
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};

export const getUserProfile = async (token) => {
  return await apiRequest('/api/auth/profile', 'GET', null, token);
};

export const getComments = async (postId) => {
  return await apiRequest(`/api/comments?postId=${postId}`);
};

export const addComment = async (content, postId, userId, token) => {
  return await apiRequest('/api/comments', 'POST', { content, postId, userId }, token);
};

export const getTags = async () => {
  return await apiRequest('/api/tags');
};

export const getUsers = async (token) => {
  return await apiRequest('/api/users', 'GET', null, token);
};

export const createUser = async (email, username, password, isAdmin, token) => {
  return await apiRequest('/api/users', 'POST', { email, username, password, isAdmin }, token);
};

export const updateUser = async (id, email, username, password, token) => {
  return await apiRequest(`/api/users/${id}`, 'PUT', { email, username, password }, token);
};

export const deleteUser = async (id, token) => {
  return await apiRequest(`/api/users/${id}`, 'DELETE', null, token);
};