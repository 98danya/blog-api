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

module.exports = { likePost, unlikePost, getLikesForPost };