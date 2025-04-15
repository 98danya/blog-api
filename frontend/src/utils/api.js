const API_URL = import.meta.env.VITE_API_URL;

const apiRequest = async (url, method = "GET", body = null, token = null) => {
  const headers = {};

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(`${API_URL}${url}`, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    throw new Error(error.message || "An unexpected error occurred");
  }
};

export const createPost = async (postData, imageFile, token) => {
  const formData = new FormData();
  formData.append("title", postData.title);
  formData.append("content", postData.content);
  formData.append("published", String(postData.published));

  if (postData.tagNames && Array.isArray(postData.tagNames)) {
    postData.tagNames.forEach((tag) => formData.append("tagNames[]", tag));
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return await apiRequest("/api/posts", "POST", formData, token);
};

export const updatePost = async (id, postData, imageFile, token) => {
  const formData = new FormData();
  formData.append("title", postData.title);
  formData.append("content", postData.content);
  formData.append("published", postData.published);

  if (postData.tagNames && Array.isArray(postData.tagNames)) {
    postData.tagNames.forEach((tag) => formData.append("tagNames[]", tag));
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return await apiRequest(`/api/posts/${id}`, "PUT", formData, token);
};

export const deletePost = async (id, token) => {
  try {
    const res = await fetch(`${API_URL}/api/posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 204) {
      return { ok: true };
    } else {
      const errorText = await res.text();
      throw new Error(`Failed to delete post: ${res.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

export const publishPost = async (postId, token) => {
  return await apiRequest(`/api/posts/${postId}/publish`, "POST", null, token);
};

export const unpublishPost = async (postId, token) => {
  const response = await fetch(`${API_URL}/api/posts/${postId}/unpublish`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to unpublish post");
  }

  return response.json();
};

export const getPosts = async () => {
  return await apiRequest("/api/posts?published=true");
};

export const getAllPosts = async (token) => {
  const res = await fetch(`${API_URL}/api/posts/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getPostById = async (id) => {
  return await apiRequest(`/api/posts/${id}`);
};

export const registerUser = async (email, username, password) => {
  return await apiRequest("/api/auth/register", "POST", {
    email,
    username,
    password,
  });
};

export const loginUser = async (email, password) => {
  return await apiRequest("/api/auth/login", "POST", { email, password });
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};

export const getUserProfile = async (token) => {
  return await apiRequest("/api/auth/profile", "GET", null, token);
};

export const getComments = async (postId) => {
  return await apiRequest(`/api/comments?postId=${postId}`);
};

export const addComment = async (content, postId, userId, token) => {
  return await apiRequest(
    "/api/comments",
    "POST",
    { content, postId, userId },
    token
  );
};

export const getPostLikes = async (postId) => {
  return await apiRequest(`/api/likes/post-likes/${postId}`);
};

export const likePost = async (postId, token) => {
  return await apiRequest(
    `/api/likes/post-likes/${postId}`,
    "POST",
    null,
    token
  );
};

export const unlikePost = async (postId, token) => {
  return await apiRequest(
    `/api/likes/post-likes/${postId}`,
    "DELETE",
    null,
    token
  );
};

export const likeComment = async (commentId, token) => {
  return await apiRequest(
    `/api/likes/comment-likes/${commentId}`,
    "POST",
    null,
    token
  );
};

export const unlikeComment = async (commentId, token) => {
  return await apiRequest(
    `/api/likes/comment-likes/${commentId}`,
    "DELETE",
    null,
    token
  );
};

export const getCommentLikes = async (commentId) => {
  return await apiRequest(`/api/likes/comment-likes/${commentId}`);
};

export const createTag = async (name, token) => {
  return await apiRequest("/api/tags", "POST", { name }, token);
};

export const getTags = async () => {
  return await apiRequest("/api/tags");
};

export const getUsers = async (token) => {
  return await apiRequest("/api/users", "GET", null, token);
};

export const createUser = async (email, username, password, isAdmin, token) => {
  return await apiRequest(
    "/api/users",
    "POST",
    { email, username, password, isAdmin },
    token
  );
};

export const updateUser = async (id, email, username, password, token) => {
  return await apiRequest(
    `/api/users/${id}`,
    "PUT",
    { email, username, password },
    token
  );
};

export const deleteUser = async (id, token) => {
  return await apiRequest(`/api/users/${id}`, "DELETE", null, token);
};