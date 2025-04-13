import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  registerUser,
  loginUser,
  logoutUser,
  getPosts,
  getTags,
} from "../utils/api";

const Index = () => {
  const [posts, setPosts] = useState([]);

  const [loginEmail, setLoginEmail] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");

  const [loginPassword, setLoginPassword] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    const fetchTags = async () => {
      try {
        const data = await getTags();
        setTags(data);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };

    fetchPosts();
    fetchTags();

    const token = localStorage.getItem("token");
    if (token) setLoggedIn(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(loginEmail, loginPassword);

      localStorage.setItem("token", data.token);
      setLoggedIn(true);
      setAuthError(null);
    } catch (err) {
      console.error("Login failed:", err);
      setAuthError("Something went wrong. Please try again.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser(registerEmail, username, registerPassword);

      const data = await loginUser(registerEmail, registerPassword);

      localStorage.setItem("token", data.token);
      setLoggedIn(true);
      setAuthError(null);
    } catch (err) {
      console.error("Registration failed:", err);
      setAuthError("Something went wrong. Please try again.");
    }
  };

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
          <h2>Login</h2>
          {authError && <p style={{ color: "red" }}>{authError}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
          </form>

          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            <input
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button type="submit">Register</button>
          </form>
        </div>
      )}

      <div>
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
      </div>

      <div>
        {filteredPosts.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`}>
            <div className="post-card">
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