import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser, getPosts, getTags, getUserProfile } from "../../utils/api";
import { formatDistanceToNow } from "date-fns";
import PostDetail from "./PostDetail";
import Login from "./Login";
import Register from "./Register";
import "../components/Index.css";
import { Github, Linkedin, Mail } from "lucide-react";

const Index = () => {
  const [posts, setPosts] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const postRefs = useRef({});
  const topRef = useRef(null);
  const [hoveredTagIndex, setHoveredTagIndex] = useState(null);
  const [visibleForm, setVisibleForm] = useState(null);
  const formSectionRef = useRef(null);
  const footerRef = useRef(null);

  const tagNames = ["All", ...tags.map((tag) => tag.name)];
  const activeIndex = tagNames.findIndex((tag) => tag === selectedTag);

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
      getUserProfile(token)
        .then((profile) => {
          setUser(profile);
          setLoggedIn(true);
          setIsAdmin(profile.isAdmin);
        })
        .catch((err) => {
          console.error("Invalid or expired token:", err);
          localStorage.removeItem("token");
          setLoggedIn(false);
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

  useEffect(() => {
    if (!footerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setVisibleForm(null);
        }
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    observer.observe(footerRef.current);

    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  return (
    <div className="index-container">
      <div ref={topRef}></div>
      <div className="header-bar">
        <div className="header-left">
          {loggedIn && <span>Welcome{user ? `, ${user.username}` : ""}.</span>}
        </div>

        <div className="header-right">
          {loggedIn ? (
            <>
              {isAdmin && <Link to="/admin/dashboard">Dashboard</Link>}
              <Link onClick={handleLogout}>Logout</Link>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setVisibleForm("login");
                  setTimeout(() => {
                    formSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 100);
                }}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setVisibleForm("register");
                  setTimeout(() => {
                    formSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 100);
                }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>

      <h1 className="main-title">Danya’s Digital Diary</h1>

      <div className="main-placeholder">
        <p>This is a placeholder section. Will be replaced later on.</p>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
          />
          {searchTerm && (
            <button className="clear-button" onClick={() => setSearchTerm("")}>
              ×
            </button>
          )}
        </div>
      </div>

      <div className="tag-bar-wrapper">
        <div
          className="tag-bar"
          style={{
            "--tag-count": tagNames.length,
            "--active-index": activeIndex,
            "--hovered-index": hoveredTagIndex ?? activeIndex,
          }}
        >
          {tagNames.map((tagName, index) => (
            <button
              key={tagName}
              className={`tag-button ${
                selectedTag === tagName ? "active" : ""
              }`}
              onClick={() => setSelectedTag(tagName)}
              onMouseEnter={() => setHoveredTagIndex(index)}
              onMouseLeave={() => setHoveredTagIndex(null)}
            >
              {tagName}
            </button>
          ))}
        </div>
      </div>

      <div className="post-card-wrapper">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="post-card"
            ref={(el) => (postRefs.current[post.id] = el)}
            onClick={() => {
              postRefs.current[post.id]?.scrollIntoView({ behavior: "smooth" });
              history.pushState(null, "", `#${post.id}`);
            }}
          >
            {post.imageUrl && (
              <img
                src={`${import.meta.env.VITE_API_URL}${post.imageUrl}`}
                alt="Post visual"
              />
            )}
            <h2>{post.title}</h2>
            <div
              className="post-preview"
              dangerouslySetInnerHTML={{
                __html: (post.excerpt || post.content.slice(0, 100)) + "...",
              }}
            />

            <p className="post-time">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
            <button
              className="read-button"
              onClick={(e) => {
                e.stopPropagation();
                postRefs.current[post.id]?.scrollIntoView({
                  behavior: "smooth",
                });
                history.pushState(null, "", `#${post.id}`);
              }}
            >
              Read
            </button>
          </div>
        ))}
      </div>
      {!loggedIn && visibleForm && (
        <div className="auth-wrapper" ref={formSectionRef}>
          {visibleForm === "login" && (
            <div className="auth-form">
              <Login
                onSuccess={(userData) => {
                  setLoggedIn(true);
                  setUser(userData);
                  setIsAdmin(userData.isAdmin);
                  setVisibleForm(null);
                  topRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>
          )}
          {visibleForm === "register" && (
            <div className="auth-form">
              <Register
                onSuccess={(userData) => {
                  setLoggedIn(true);
                  setUser(userData);
                  setIsAdmin(userData.isAdmin);
                  setVisibleForm(null);
                  topRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="social-icons">
        <a
          href="https://github.com/98danya"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github />
        </a>
        <a
          href="https://www.linkedin.com/in/danya-mohammed/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin />
        </a>
        <a href="mailto:1998.danyamohammed@gmail.com">
          <Mail />
        </a>
      </div>

      <div>
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            ref={(el) => (postRefs.current[post.id] = el)}
            id={post.id}
            style={{ scrollMarginTop: "3rem" }}
          >
            <PostDetail embeddedPost={post} />
          </div>
        ))}
      </div>

      <footer className="footer" ref={footerRef}>
        <button
          className="scroll-to-top"
          onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          ⬆ Return to the beginning
        </button>
      </footer>
    </div>
  );
};

export default Index;
