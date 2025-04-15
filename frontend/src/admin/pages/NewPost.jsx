import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPost, createTag, getTags } from "../../utils/api";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Underline } from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

import TurndownService from "turndown";

const NewPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing your content...",
      }),
      CharacterCount.configure({
        limit: 5000,
      }),
      Bold,
      Italic,
      Underline,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error("Failed to load tags:", err);
      }
    };
    fetchTags();
  }, []);

  const handleTagToggle = (tagName) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleCreateTag = async () => {
    const token = localStorage.getItem("token");
    if (!newTag.trim()) return;

    try {
      const res = await createTag(newTag, token);
      setAvailableTags((prev) => [...prev, res]);
      setSelectedTags((prev) => [...prev, res.name]);
      setNewTag("");
    } catch (err) {
      console.error("Failed to create tag:", err);
      alert("Failed to create tag.");
    }
  };

  const handleSubmit = async (e, intent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }

    if (!intent) {
      alert("Please click either Publish or Save as Draft.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await createPost(
        {
          title,
          content,
          published: intent === "publish",
          tagNames: selectedTags,
        },
        image,
        token
      );

      setTitle("");
      editor?.commands.setContent("");
      setImage(null);
      setSelectedTags([]);

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  const turndownService = new TurndownService();
  const markdownPreview = turndownService.turndown(content);

  return (
    <form>
      <h2>Create New Post</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
      />

      <div style={{ marginTop: "1rem" }}>
        <div>
          <button type="button" onClick={() => editor?.commands.toggleBold()}>
            Bold
          </button>
          <button type="button" onClick={() => editor?.commands.toggleItalic()}>
            Italic
          </button>
          <button
            type="button"
            onClick={() => editor?.commands.toggleUnderline()}
          >
            Underline
          </button>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginTop: "1rem",
          }}
        >
          {editor && <EditorContent editor={editor} />}
        </div>

        <div style={{ marginTop: "1rem" }}>
          <strong>Character Count: </strong>
          {editor ? editor.storage.characterCount.characters() : 0} / 5000
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <h4>Markdown Preview</h4>
        <pre>{markdownPreview}</pre>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <div>
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
        <div style={{ marginTop: "1rem" }}>
          <input
            type="text"
            value={newTag}
            placeholder="New tag name"
            onChange={(e) => setNewTag(e.target.value)}
          />
          <button type="button" onClick={handleCreateTag}>
            Add Tag
          </button>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, "publish")}
          style={{ marginRight: "10px" }}
        >
          Publish
        </button>

        <button type="button" onClick={(e) => handleSubmit(e, "draft")}>
          Save as Draft
        </button>
      </div>
    </form>
  );
};

export default NewPost;