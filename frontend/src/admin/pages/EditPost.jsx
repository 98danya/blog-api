import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostById, updatePost, getTags } from "../../utils/api";
import "../components/NewPost.css";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Underline } from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import ReactMarkdown from "react-markdown";

import TurndownService from "turndown";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [initialContent, setInitialContent] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Placeholder.configure({
        placeholder: "Edit your content...",
      }),
      CharacterCount.configure({
        limit: 5000,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setInitialContent(editor.getHTML());
    },
  });

  useEffect(() => {
    const fetchPostAndTags = async () => {
      try {
        const post = await getPostById(id);
        const tags = await getTags();

        setTitle(post.title);
        setInitialContent(post.content);
        editor?.commands.setContent(post.content);
        setSelectedTags(post.tags.map((tag) => tag.name));
        setPublished(post.published);
        setAvailableTags(tags);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Unable to load post.");
      }
    };

    if (editor) {
      fetchPostAndTags();
    }
  }, [editor, id]);

  const handleTagToggle = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((name) => name !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!title.trim() || !initialContent.trim()) {
      alert("Title and content are required.");
      return;
    }

    try {
      await updatePost(
        id,
        {
          title,
          content: initialContent,
          published,
          tagNames: selectedTags,
        },
        image,
        token
      );

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update the post.");
    }
  };

  const turndownService = new TurndownService();
  const markdownPreview = turndownService.turndown(initialContent);

  if (error) return <p>{error}</p>;

  return (
    <div className="newpost-container">
      <div className="header-bar">
        <div className="header-left">
          <h2>Edit Post</h2>
        </div>

        <div className="header-right">
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/">Blog</Link>

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

      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />

        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={editor?.isActive("bold") ? "active" : ""}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={editor?.isActive("italic") ? "active" : ""}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={editor?.isActive("underline") ? "active" : ""}
              title="Underline"
            >
              <u>U</u>
            </button>
          </div>
          <div className="toolbar-group">
            <button onClick={() => editor?.commands.undo()} title="Undo">
              ↺
            </button>
            <button onClick={() => editor?.commands.redo()} title="Redo">
              ↻
            </button>
          </div>

          <div className="toolbar-group color-picker">
            <label className="color-picker-label" title="Text Color">
              🎨
              <input
                type="color"
                onChange={(e) => editor?.commands.setColor(e.target.value)}
                aria-label="Choose text color"
              />
            </label>
          </div>

          <div className="editor-box">
            {editor && <EditorContent editor={editor} />}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <strong>Character Count: </strong>
            {editor ? editor.storage.characterCount.characters() : 0} / 5000
          </div>
        </div>

        <div className="markdown-preview">
          <ReactMarkdown>{markdownPreview}</ReactMarkdown>
        </div>

        <label style={{ display: "block", marginTop: "1rem" }}>
          Replace image (optional):
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>

        <div style={{ marginTop: "1rem" }}>
          <h4>Tags:</h4>
          {availableTags.map((tag) => (
            <label key={tag.id} style={{ marginRight: "10px" }}>
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.name)}
                onChange={() => handleTagToggle(tag.name)}
              />
              {tag.name}
            </label>
          ))}
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published
          </label>
        </div>

        <div className="submit-buttons">
          <button type="submit" className="createPost-submit">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
