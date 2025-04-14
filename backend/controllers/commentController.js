const prisma = require("../prisma");

const getAllComments = async (req, res) => {
  const postId = parseInt(req.query.postId);

  if (!postId) {
    return res.status(400).json({ error: "Post ID is required." });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        user: true,
      },
    });

    res.json(comments);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while fetching comments." });
  }
};

const createComment = async (req, res) => {
  const { content, postId, userId } = req.body;

  if (!content || !postId || !userId) {
    return res
      .status(400)
      .json({ error: "Content, post ID, and user ID are required." });
  }

  try {
    const newComment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },
    });
    res.status(201).json(newComment);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong while creating the comment." });
  }
};

const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const { id: userId } = req.user;

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!comment) {
    return res.status(404).json({ error: "Comment not found." });
  }

  if (comment.userId !== userId) {
    return res
      .status(403)
      .json({ error: "You can only update your own comments." });
  }

  try {
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
    });
    res.json(updatedComment);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong while updating the comment." });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!comment) {
    return res.status(404).json({ error: "Comment not found." });
  }

  if (comment.userId !== userId) {
    return res
      .status(403)
      .json({ error: "You can only delete your own comments." });
  }

  try {
    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end();
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong while deleting the comment." });
  }
};

module.exports = {
  getAllComments,
  createComment,
  updateComment,
  deleteComment,
};
