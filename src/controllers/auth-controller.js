import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import prisma from '../prisma-client.js';
const register = async (req, res) => {
  const { username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
      },
    });
    //create a default todo for the new user
    const defaultTodo = `Hello, Add your first todo!`;
    await prisma.todo.create({
      data: {
        task: defaultTodo,
        userId: user.id,
      },
    });
    //generate JWT token
    const token = await jwt.sign(
      {
        id: user.id,
        username: username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(StatusCodes.CREATED).json({ token });
  } catch (err) {
    console.error(err.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    //check username
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `user with username ${username} does not exist` });
    }

    //check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Invalid password ' });
    }

    //generate JWT token
    const token = await jwt.sign(
      {
        id: user.id,
        username: username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.status(StatusCodes.OK).json({ token });
  } catch (err) {
    console.log(err.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
};

export { register, login };
