import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
} from "../../utils/api";
import { formatDistanceToNow } from "date-fns";

const PostDetail = ({ embeddedPost }) => {
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

  const token = localStorage.getItem("token");

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
      if (!userId || comments.length === 0) return;

      const updatedLiked = {};
      const updatedCounts = {};

      for (const comment of comments) {
        const likes = await getCommentLikes(comment.id);
        updatedLiked[comment.id] = likes.some((like) => like.userId === userId);
        updatedCounts[comment.id] = likes.length;
      }

      setLikedComments(updatedLiked);
      setCommentLikes(updatedCounts);
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
    <div>
      {post.imageUrl && (
        <img
          src={`${import.meta.env.VITE_API_URL}${post.imageUrl}`}
          alt="Post visual"
          style={{ maxWidth: "40%", margin: "1rem 0" }}
        />
      )}
      <h1>{post.title}</h1>
      <p>
        By <strong>{post.author.username}</strong>
      </p>
      <p>
        {formatDistanceToNow(new Date(post.publishedAt || post.createdAt), {
          addSuffix: true,
        })}
      </p>
      <p>{post.content}</p>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button onClick={toggleLike}>{liked ? "💔 Unlike" : "❤️ Like"}</button>
        <span>{likeCount}</span>
      </div>

      <hr />
      <h2>Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet. Be the first!</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id}>
            <strong>{comment.user?.username || "Anonymous"}:</strong>
            <br />
            <small>
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </small>

            {editingCommentId === comment.id ? (
              <>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
                <div>
                  <button onClick={() => saveEditedComment(comment.id)}>
                    Save
                  </button>
                  <button onClick={cancelEditing}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p>{comment.content}</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <button onClick={() => likeCommentHandler(comment.id)}>
                    {likedComments[comment.id] ? "💔 Unlike" : "❤️ Like"}
                  </button>
                  <span>{commentLikes[comment.id] || 0}</span>
                </div>
                {(userId === comment.userId ||
                  (isAdmin && userId === post.authorId)) && (
                  <div>
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
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}

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
  );
};

export default PostDetail;