const prisma = require("../prisma");
const bcrypt = require("bcryptjs");

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while fetching users." });
  }
};

const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

const createUser = async (req, res) => {
  const { email, username, password, isAdmin = false } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: "Email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        isAdmin: isAdmin || false,
      },
    });
    res.status(201).json(newUser);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong while creating the user." });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, username, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });
  if (!existingUser) {
    return res.status(404).json({ error: "User not found." });
  }

  let hashedPassword = password;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { email, username, password: hashedPassword },
    });
    res.json(updatedUser);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong while updating the user." });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found." });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end();
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong while deleting the user." });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
