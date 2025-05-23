import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllPosts,
  deletePost,
  publishPost,
  unpublishPost,
  getUserProfile,
} from "../../utils/api";
import { formatDistanceToNow } from "date-fns";
import "../components/Dashboard.css";
import "../../client/components/Index.css";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const currentUser = await getUserProfile(token);
        setUser(currentUser);

        const allPosts = await getAllPosts(token);
        const userPosts = allPosts.filter(
          (post) => post.authorId === currentUser.id
        );
        setPosts(userPosts);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      const response = await deletePost(postId, token);

      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
      } else {
        throw new Error("Failed to delete post from the database.");
      }
    } catch (err) {
      console.error("Failed to delete post:", err.message);
      alert(`Something went wrong while deleting: ${err.message}`);
    }
  };

  const handlePublish = async (postId) => {
    const token = localStorage.getItem("token");

    try {
      await publishPost(postId, token);
      const allPosts = await getAllPosts(token);
      setPosts(allPosts.filter((post) => post.authorId === user.id));
    } catch (error) {
      console.error("Failed to publish post:", error.message);
      alert("Something went wrong while publishing.");
    }
  };

  const handleUnpublish = async (postId) => {
    const token = localStorage.getItem("token");

    try {
      await unpublishPost(postId, token);
      const allPosts = await getAllPosts(token);
      setPosts(allPosts.filter((post) => post.authorId === user.id));
    } catch (error) {
      console.error("Failed to unpublish post:", error.message);
      alert("Something went wrong while unpublishing.");
    }
  };

  const publishedPosts = posts.filter((post) => post.published);
  const draftPosts = posts.filter((post) => !post.published);

  return (
    <div className="dashboard-container">
      <div className="header-bar">
        <div className="header-left">
          <h2>Your Dashboard</h2>
        </div>

        <div className="header-right">
          <Link to="/admin/new-post">Create New Post</Link>
          <Link to="/">Blog</Link>
        </div>
      </div>

      <h2 className="section-title">Published Posts</h2>
      <section className="post-section">
        {publishedPosts.length > 0 ? (
          publishedPosts.map((post) => (
            <div key={post.id} className="post-card">
              <Link
                to={`/posts/${post.id}`}
                state={{ fromAdmin: true }}
                className="post-link"
              >
                {post.imageUrl && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${post.imageUrl}`}
                    alt="Post visual"
                  />
                )}
                <h3 className="post-title">{post.title}</h3>
                <div
                  className="post-preview"
                  dangerouslySetInnerHTML={{
                    __html:
                      (post.excerpt || post.content.slice(0, 100)) + "...",
                  }}
                />
              </Link>

              <p className="post-time">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>

              <div className="button-group">
                <button
                  className="delete-button"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
                <button
                  className="unpublish-button"
                  onClick={() => handleUnpublish(post.id)}
                >
                  Unpublish
                </button>
                <Link to={`/admin/edit-post/${post.id}`}>
                  <button className="edit-button">Edit</button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="no-posts-message">No published posts yet.</p>
        )}
      </section>

      <h2 className="section-title">Drafts</h2>
      <section className="post-section">
        {draftPosts.length > 0 ? (
          draftPosts.map((post) => (
            <div key={post.id} className="post-card">
              <Link
                to={`/posts/${post.id}`}
                state={{ fromAdmin: true }}
                className="post-link"
              >
                {post.imageUrl && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${post.imageUrl}`}
                    alt="Post visual"
                  />
                )}
                <h3 className="post-title">{post.title}</h3>
                <div
                  className="post-preview"
                  dangerouslySetInnerHTML={{
                    __html:
                      (post.excerpt || post.content.slice(0, 100)) + "...",
                  }}
                />
              </Link>

              <div className="button-group">
                <button
                  className="delete-button"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
                <button
                  className="publish-button"
                  onClick={() => handlePublish(post.id)}
                >
                  Publish
                </button>
                <Link to={`/admin/edit-post/${post.id}`}>
                  <button className="read-button">Edit</button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="no-posts-message">No drafts found.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
