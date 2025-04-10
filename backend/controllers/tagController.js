const prisma = require("../prisma");

const getAllTags = async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tags." });
  }
};

const createTag = async (req, res) => {
  const { name } = req.body;
  try {
    const tag = await prisma.tag.create({ data: { name } });
    res.status(201).json(tag);
  } catch (err) {
    res.status(500).json({ error: "Failed to create tag." });
  }
};

module.exports = { getAllTags, createTag };
