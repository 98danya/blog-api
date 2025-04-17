import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import {
  getComments,
  addComment,
  getUserProfile,
  getPostLikes,
  likePost,
  unlikePost,
  likeComment,
  unlikeComment,
  getCommentLikes,
  getPostById,
  logoutUser,
} from "../../utils/api";
import { formatDistanceToNow } from "date-fns";
import "../components/PostDetail.css";

const PostDetail = ({ embeddedPost }) => {
  const location = useLocation();
  const fromAdmin = location.state?.fromAdmin || false;
  const topRef = useRef(null);
  const { id: routeId } = useParams();
  const postId = embeddedPost?.id || routeId;
  const [post, setPost] = useState(embeddedPost || null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likedComments, setLikedComments] = useState({});
  const [commentLikes, setCommentLikes] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUserProfile(token)
        .then((profile) => {
          setUser(profile);
          setLoggedIn(true);
        })
        .catch((err) => {
          console.error("Failed to fetch user profile:", err);
        });
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logoutUser();
    setLoggedIn(false);
    navigate("/");
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!embeddedPost) {
          const postData = await getPostById(postId);
          setPost(postData);
        }

        const commentsData = await getComments(postId);
        setComments(commentsData);

        if (token) {
          const user = await getUserProfile(token);
          setUserId(user.id);
          setIsAdmin(user.isAdmin);
        }
      } catch (err) {
        console.error("Error loading post or comments:", err);
      }
    };

    load();
  }, [postId, embeddedPost, token]);

  useEffect(() => {
    if (post) {
      getPostLikes(post.id).then((likes) => {
        setLikeCount(likes.length);
        if (token && userId) {
          setLiked(likes.some((like) => like.userId === userId));
        }
      });
    }
  }, [post, userId, token]);

  useEffect(() => {
    const updateCommentLikes = async () => {
      if (comments.length === 0) return;

      const updatedLiked = {};
      const updatedCounts = {};

      for (const comment of comments) {
        const likes = await getCommentLikes(comment.id);
        updatedCounts[comment.id] = likes.length;
        if (userId) {
          updatedLiked[comment.id] = likes.some(
            (like) => like.userId === userId
          );
        }
      }

      setCommentLikes(updatedCounts);
      if (userId) setLikedComments(updatedLiked);
    };

    updateCommentLikes();
  }, [userId, comments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment || !userId) return;

    try {
      await addComment(newComment, post.id, userId, token);
      setNewComment("");
      const updated = await getComments(post.id);
      setComments(updated);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      } else {
        console.error("Error deleting comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const startEditingComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditedContent(content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditedContent("");
  };

  const saveEditedComment = async (commentId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: editedContent }),
        }
      );

      if (res.ok) {
        const updated = comments.map((c) =>
          c.id === commentId ? { ...c, content: editedContent } : c
        );
        setComments(updated);
        cancelEditing();
      } else {
        console.error("Failed to update comment");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const toggleLike = async () => {
    if (!token) return;

    try {
      if (liked) {
        await unlikePost(post.id, token);
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await likePost(post.id, token);
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const likeCommentHandler = async (commentId) => {
    if (!token) return;

    try {
      if (likedComments[commentId]) {
        await unlikeComment(commentId, token);
      } else {
        await likeComment(commentId, token);
      }

      const updatedLikes = await getCommentLikes(commentId);
      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: updatedLikes.length,
      }));
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    } catch (err) {
      console.error("Error toggling comment like:", err);
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div className="postdetail-container">
      {fromAdmin && (
        <>
          <div ref={topRef}></div>
          <div className="header-bar">
            <div className="header-left">
              {loggedIn && (
                <span>Welcome{user ? `, ${user.username}` : ""}.</span>
              )}
            </div>

            <div className="header-right">
              {loggedIn ? (
                <>
                  {isAdmin && <Link to="/admin/dashboard">Dashboard</Link>}
                  <Link onClick={handleLogout}>Logout</Link>
                </>
              ) : null}
              <label className="switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          <h1 className="main-title">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              Danya’s Digital Diary
            </Link>
          </h1>
        </>
      )}

      <h1 className="post-header">{post.title}</h1>
      {post.imageUrl && (
        <img
          src={`${import.meta.env.VITE_API_URL}${post.imageUrl}`}
          alt="Post visual"
          style={{
            maxWidth: "100%",
            width: "100%",
            height: "450px",
            borderRadius: "12px",
          }}
        />
      )}
      <div className="post-meta">
        <p className="post-date">
          {formatDistanceToNow(new Date(post.createdAt), {
            addSuffix: true,
          })}
        </p>
        <div className="like-section">
          <button
            onClick={toggleLike}
            className={`like-button heart ${liked ? "liked" : ""}`}
          >
            {liked ? "♥︎" : "♡"}
          </button>
          <span className="like-count">{likeCount}</span>
        </div>
      </div>

      <div
        className="contentText"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <hr />

      <div className="comments-section">
        {!token && (
          <div className="comment-login-prompt">
            <p>
              <a href="/login">Login</a> or <a href="/signup">Register</a> to
              leave a comment.
            </p>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              required
            />
          </div>
        )}

        <div className="comment-create">
          {token && (
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                required
              />
              <br />
              <button type="submit">Post Comment</button>
            </form>
          )}
        </div>
        <h2>Comments</h2>

        {comments.length === 0 ? (
          <p className="no-comments-message">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-box">
              <div className="comment-header">
                <strong className="comment-username">
                  @{comment.user?.username || "Anonymous"}
                </strong>
                <small className="comment-time">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </small>
              </div>

              {editingCommentId === comment.id ? (
                <>
                  <textarea
                    className="comment-edit-textarea"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                  <div className="comment-actions">
                    <button onClick={() => saveEditedComment(comment.id)}>
                      Save
                    </button>
                    <button onClick={cancelEditing}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="comment-content">{comment.content}</p>
                  <div className="comment-actions">
                    <button
                      onClick={() => likeCommentHandler(comment.id)}
                      className={`like-button heart ${
                        likedComments[comment.id] ? "liked" : ""
                      }`}
                    >
                      {likedComments[comment.id] ? "♥︎" : "♡"}
                    </button>
                    <span className="like-count">
                      {commentLikes[comment.id]}
                    </span>

                    {(userId === comment.userId ||
                      (isAdmin && userId === post.authorId)) && (
                      <>
                        <button onClick={() => handleDeleteComment(comment.id)}>
                          Delete
                        </button>
                        {userId === comment.userId && (
                          <button
                            onClick={() =>
                              startEditingComment(comment.id, comment.content)
                            }
                          >
                            Edit
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetail;