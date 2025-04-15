const prisma = require("../prisma");
const fs = require("fs");
const path = require("path");

const getAllPosts = async (req, res) => {
  const { tag, published } = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        ...(published ? { published: published === "true" } : {}),
        ...(tag
          ? {
              tags: {
                some: {
                  name: {
                    equals: tag,
                    mode: "insensitive",
                  },
                },
              },
            }
          : {}),
      },
      include: { author: true, comments: true, tags: true },
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts." });
  }
};

const getPosts = async (req, res) => {
  const { tag } = req.query;
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        tags: tag
          ? {
              some: {
                name: {
                  equals: tag,
                  mode: "insensitive",
                },
              },
            }
          : undefined,
      },
      include: { author: true, comments: true, tags: true },
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts." });
  }
};

const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: { author: true, comments: true, tags: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    res.json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ error: "Failed to fetch post." });
  }
};

const createPost = async (req, res) => {
  let { title, content, published, tagNames } = req.body;
  const authorId = req.user.id;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !content || !authorId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  published = published === "true";

  if (typeof tagNames === "string") {
    try {
      tagNames = JSON.parse(tagNames);
    } catch {
      tagNames = [tagNames];
    }
  }

  try {
    let tags = [];
    if (Array.isArray(tagNames)) {
      tags = await Promise.all(
        tagNames.map(async (name) => {
          const tagName = name.trim().toLowerCase();
          let tag = await prisma.tag.findFirst({
            where: { name: { equals: tagName, mode: "insensitive" } },
          });
          if (!tag) {
            tag = await prisma.tag.create({ data: { name: tagName } });
          }
          return tag;
        })
      );
    }

    const postData = {
      title,
      content,
      published,
      imageUrl,
      author: { connect: { id: authorId } },
      tags: { connect: tags.map((tag) => ({ id: tag.id })) },
    };

    if (published) postData.publishedAt = new Date();

    const post = await prisma.post.create({
      data: postData,
      include: { tags: true },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Failed to create post." });
  }
};

const publishPost = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        published: true,
        publishedAt: new Date(),
      },
    });

    res.json(updatedPost);
  } catch (err) {
    console.error("Error publishing post:", err);
    res.status(500).json({ error: "Failed to publish post." });
  }
};

const unpublishPost = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        published: false,
        publishedAt: null,
      },
    });

    res.json(updatedPost);
  } catch (err) {
    console.error("Error unpublishing post:", err);
    res.status(500).json({ error: "Failed to unpublish post." });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  let { title, content, published, tagNames } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  published = published === "true";

  if (typeof tagNames === "string") {
    try {
      tagNames = JSON.parse(tagNames);
    } catch {
      tagNames = [tagNames];
    }
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: { tags: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    let tags = [];
    if (tagNames && tagNames.length > 0) {
      tags = await Promise.all(
        tagNames.map(async (name) => {
          const tagName = name.trim().toLowerCase();

          let tag = await prisma.tag.findFirst({
            where: { name: { equals: tagName, mode: "insensitive" } },
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: name.trim() },
            });
          }

          return tag;
        })
      );
    }

    const postData = {
      title,
      content,
      published,
      tags: {
        connect: tags.map((tag) => ({ id: tag.id })),
      },
    };

    if (imageUrl) postData.imageUrl = imageUrl;

    if (published) {
      postData.publishedAt = new Date();
    } else {
      postData.publishedAt = null;
      postData.published = false;
    }

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: postData,
      include: { tags: true },
    });

    res.json(updatedPost);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Failed to update post." });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (post.imageUrl) {
      const imagePath = path.join(__dirname, "..", post.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Failed to delete image file:", err);
        } else {
          console.log("Image file deleted:", post.imageUrl);
        }
      });
    }

    await prisma.post.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end();
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong while deleting the post." });
  }
};

module.exports = {
  getAllPosts,
  getPosts,
  getPostById,
  createPost,
  publishPost,
  unpublishPost,
  updatePost,
  deletePost,
};