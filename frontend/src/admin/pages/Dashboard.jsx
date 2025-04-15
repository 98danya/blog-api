import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllPosts,
  deletePost,
  publishPost,
  unpublishPost,
  getUserProfile,
} from "../../utils/api";

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
    <div>
      <h1>Admin Dashboard</h1>

      <Link to="/">
        <button>Back to Blog</button>
      </Link>

      <Link to="/admin/new-post">
        <button>Create New Post</button>
      </Link>

      <h2>Published Posts</h2>
      {publishedPosts.length > 0 ? (
        publishedPosts.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
            <button onClick={() => handleUnpublish(post.id)}>Unpublish</button>
            <Link to={`/admin/edit-post/${post.id}`}>
              <button>Edit</button>
            </Link>
          </div>
        ))
      ) : (
        <p>No published posts yet.</p>
      )}

      <h2>Drafts</h2>
      {draftPosts.length > 0 ? (
        draftPosts.map((post) => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <button onClick={() => handleDelete(post.id)}>Delete</button>
            <button onClick={() => handlePublish(post.id)}>Publish</button>
            <Link to={`/admin/edit-post/${post.id}`}>
              <button>Edit</button>
            </Link>
          </div>
        ))
      ) : (
        <p>No drafts found.</p>
      )}
    </div>
  );
};

export default Dashboard;
