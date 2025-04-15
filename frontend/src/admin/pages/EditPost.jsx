import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, updatePost, getTags } from "../../utils/api";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Underline } from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

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
    <form onSubmit={handleSubmit}>
      <h2>Edit Post</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
      />

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

      <div style={{ marginTop: "1rem" }}>
        <h4>Markdown Preview</h4>
        <pre>{markdownPreview}</pre>
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

      <button type="submit" style={{ marginTop: "1rem" }}>
        Update Post
      </button>
    </form>
  );
};

export default EditPost;