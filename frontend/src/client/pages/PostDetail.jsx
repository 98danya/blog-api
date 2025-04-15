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
} from "../../utils/api";
import { formatDistanceToNow } from "date-fns";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likedComments, setLikedComments] = useState({});
  const [commentLikes, setCommentLikes] = useState({});
  const [editedContent, setEditedContent] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data) => setPost(data))
      .catch((err) => console.error("Error fetching post:", err));

    getComments(id).then(setComments);

    if (token) {
      getUserProfile(token)
        .then((user) => {
          if (user) {
            setUserId(user.id);
          }
        })
        .catch((err) => console.error("Failed to load user profile", err));
    }
  }, [id, token]);

  useEffect(() => {
    if (post) {
      getPostLikes(post.id)
        .then((likes) => {
          setLikeCount(likes.length);
          if (token && userId) {
            setLiked(likes.some((like) => like.userId === userId));
          }
        })
        .catch((err) => console.error("Error fetching likes:", err));
    }
  }, [post, userId, token]);

  useEffect(() => {
    const fetchUserCommentLikes = async () => {
      if (!userId || comments.length === 0) return;

      const updatedLikedComments = {};
      const updatedCommentLikes = {};

      for (const comment of comments) {
        const likes = await getCommentLikes(comment.id);
        updatedLikedComments[comment.id] = likes.some(
          (like) => like.userId === userId
        );
        updatedCommentLikes[comment.id] = likes.length;
      }

      setLikedComments(updatedLikedComments);
      setCommentLikes(updatedCommentLikes);
    };

    fetchUserCommentLikes();
  }, [userId, comments]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!newComment || !userId) {
      console.error("Comment or user ID missing");
      return;
    }

    try {
      const postIdInt = parseInt(id, 10);
      await addComment(newComment, postIdInt, userId, token);
      setNewComment("");
      const updatedComments = await getComments(postIdInt);
      setComments(updatedComments);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId));
      } else {
        console.error("Error deleting comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const startEditingComment = (commentId, currentContent) => {
    setEditingCommentId(commentId);
    setEditedContent(currentContent);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditedContent("");
  };

  const saveEditedComment = async (commentId) => {
    try {
      const response = await fetch(
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

      if (response.ok) {
        const updatedComments = comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: editedContent }
            : comment
        );
        setComments(updatedComments);
        cancelEditing();
      } else {
        console.error("Failed to update comment");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const toggleLike = async () => {
    if (!token) {
      console.log("You must be logged in to like/unlike a post.");
      return;
    }
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
    if (!token) {
      console.log("You must be logged in to like/unlike a comment.");
      return;
    }
    try {
      if (likedComments[commentId]) {
        await unlikeComment(commentId, token);
        setLikedComments((prev) => ({ ...prev, [commentId]: false }));
      } else {
        await likeComment(commentId, token);
        setLikedComments((prev) => ({ ...prev, [commentId]: true }));
      }
      const updatedLikes = await getCommentLikes(commentId);
      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: updatedLikes.length,
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
                {userId === comment.userId && (
                  <div>
                    <button
                      onClick={() =>
                        startEditingComment(comment.id, comment.content)
                      }
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeleteComment(comment.id)}>
                      Delete
                    </button>
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