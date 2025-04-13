import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getComments, addComment, getUserProfile } from "../utils/api";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
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

  if (!post) return <p>Loading...</p>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>

      <hr />
      <h2>Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet. Be the first!</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id}>
            <strong>{comment.user?.username || "Anonymous"}:</strong>

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
