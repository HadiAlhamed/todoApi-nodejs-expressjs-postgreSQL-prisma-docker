import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'No token provided' });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log(err.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Unauthorized, Invalid token' });
  }
};

export default authMiddleware;
