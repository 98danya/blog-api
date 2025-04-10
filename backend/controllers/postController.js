const prisma = require('../prisma');

const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: { author: true, comments: true, tags: true }
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { getAllPosts };