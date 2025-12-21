import db from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

const register = async (req, res) => {
  const { username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const query = `
        INSERT INTO users (username , password) VALUES (?, ?)
      `;
    const insertedUser = db.prepare(query);
    const userResult = insertedUser.run(username, hashedPassword);

    //create a default todo for the new user
    const defaultTodo = `Hello, Add your first todo!`;
    const todoQuery = `
        INSERT INTO todos (user_id , task) VALUES (?, ?)
        `;
    const insertedTodo = db.prepare(todoQuery);
    insertedTodo.run(userResult.lastInsertRowid, defaultTodo);

    //generate JWT token
    const token = await jwt.sign(
      {
        id: userResult.lastInsertRowid,
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
    const getUserQuery = `
      SELECT * FROM users 
      WHERE username = ?
    `;
    const getUser = db.prepare(getUserQuery);
    const user = getUser.get(username);

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
