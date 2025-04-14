const prisma = require("../prisma");

const likePost = async (req, res) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.postId);

  try {
    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      return res.status(400).json({ message: "Already liked this post." });
    }

    const like = await prisma.like.create({
      data: { userId, postId },
    });

    res.status(201).json(like);
  } catch (err) {
    res.status(500).json({ error: "Failed to like post." });
  }
};

const unlikePost = async (req, res) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.postId);

  try {
    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to unlike post." });
  }
};

const getLikesForPost = async (req, res) => {
  const postId = parseInt(req.params.postId);

  try {
    const likes = await prisma.like.findMany({
      where: { postId },
      include: { user: true },
    });

    res.json(likes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch likes." });
  }
};

const likeComment = async (req, res) => {
  const userId = req.user.id;
  const commentId = parseInt(req.params.commentId);

  try {
    const existingLike = await prisma.like.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existingLike) {
      return res.status(400).json({ message: "Already liked this comment." });
    }

    const like = await prisma.like.create({
      data: { userId, commentId },
    });

    res.status(201).json(like);
  } catch (err) {
    res.status(500).json({ error: "Failed to like comment." });
  }
};

const unlikeComment = async (req, res) => {
  const userId = req.user.id;
  const commentId = parseInt(req.params.commentId);

  try {
    await prisma.like.delete({
      where: { userId_commentId: { userId, commentId } },
    });

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to unlike comment." });
  }
};

const getLikesForComment = async (req, res) => {
  const commentId = parseInt(req.params.commentId);

  try {
    const likes = await prisma.like.findMany({
      where: { commentId },
      include: { user: true },
    });

    res.json(likes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch likes." });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getLikesForPost,
  likeComment,
  unlikeComment,
  getLikesForComment,
};
