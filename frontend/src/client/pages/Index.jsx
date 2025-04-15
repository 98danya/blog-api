import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, getPosts, getTags, getUserProfile } from "../../utils/api";

const Index = () => {
  const [posts, setPosts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, tagsData] = await Promise.all([
          getPosts(),
          getTags(),
        ]);
        setPosts(postsData);
        setTags(tagsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();

    const token = localStorage.getItem("token");
    if (token) setLoggedIn(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);

      getUserProfile(token).then((profile) => {
        setIsAdmin(profile.isAdmin);
      });
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setLoggedIn(false);
    navigate("/");
  };

  const filteredPosts = posts.filter((post) => {
    const matchesTag =
      selectedTag === "All" ||
      post.tags?.some((tag) => tag.name === selectedTag);
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div>
      <h1>Latest Posts</h1>

      {loggedIn ? (
        <>
          <button onClick={handleLogout}>Logout</button>
          <h2>Welcome, you are logged in!</h2>
        </>
      ) : (
        <div>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      )}

      {isAdmin && (
        <Link to="/admin/dashboard">
          <button>Dashboard</button>
        </Link>
      )}

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search posts..."
      />

      <div>
        <button onClick={() => setSelectedTag("All")}>All</button>
        {tags.map((tag) => (
          <button key={tag.id} onClick={() => setSelectedTag(tag.name)}>
            {tag.name}
          </button>
        ))}
      </div>

      <div>
        {filteredPosts.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <div className="post-card">
              {post.imageUrl && (
                <img
                  src={`${import.meta.env.VITE_API_URL}${post.imageUrl}`}
                  alt="Post visual"
                  style={{ maxWidth: "10%", margin: "1rem 0" }}
                />
              )}
              <h2>{post.title}</h2>
              <p>{post.excerpt || post.content.slice(0, 100)}...</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;