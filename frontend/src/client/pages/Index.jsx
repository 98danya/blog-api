import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  logoutUser,
  getPosts,
  getTags,
  getUserProfile,
} from "../../utils/api";
import PostDetail from "./PostDetail";

const Index = () => {
  const [posts, setPosts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const postRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, tagsData] = await Promise.all([
          getPosts(),
          getTags(),
        ]);
        postsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(postsData);
        setTags(tagsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();

    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
      getUserProfile(token).then((profile) => {
        setIsAdmin(profile.isAdmin);
      });
    }
  }, []);

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash && postRefs.current[hash]) {
      postRefs.current[hash].scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let currentId = null;

      for (const post of filteredPosts) {
        const ref = postRefs.current[post.id];
        if (ref) {
          const offsetTop = ref.offsetTop;
          if (scrollY >= offsetTop - 100) {
            currentId = post.id;
          }
        }
      }

      if (currentId) {
        history.replaceState(null, "", `#${currentId}`);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredPosts]);

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
          <Link to="/login"><button>Login</button></Link>
          <Link to="/register"><button>Register</button></Link>
        </div>
      )}

      {isAdmin && (
        <Link to="/admin/dashboard"><button>Dashboard</button></Link>
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
          <div
            key={post.id}
            className="post-card"
            style={{ cursor: "pointer" }}
            onClick={() => {
              const targetRef = postRefs.current[post.id];
              if (targetRef) {
                targetRef.scrollIntoView({ behavior: "smooth" });
                history.pushState(null, "", `#${post.id}`);
              }
            }}
          >
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
        ))}
      </div>

      <hr />

      <div>
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            ref={(el) => (postRefs.current[post.id] = el)}
            id={post.id}
            style={{ paddingTop: "3rem", scrollMarginTop: "3rem" }}
          >
            <PostDetail embeddedPost={post} />
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;