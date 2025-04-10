const prisma = require('../prisma');

const getAllComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong while fetching comments.' });
  }
};

module.exports = { getAllComments };