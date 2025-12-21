import { StatusCodes } from 'http-status-codes';
import prisma from '../prisma-client.js';
export const getAllTodos = async (req, res) => {
  const userId = req.userId;

  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(StatusCodes.OK).json(todos);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

export const createTodo = async (req, res) => {
  const { task } = req.body;
  const userId = req.userId;
  try {
    const todo = await prisma.todo.create({
      data: {
        task: task,
        userId: userId,
      },
    });
    res.status(StatusCodes.CREATED).json(todo);
  } catch (error) {
    console.error('Error creating task:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

export const updateTodo = async (req, res) => {
  const taskId = req.params.id;
  const { completed } = req.body;

  try {
    const updateTodo = await prisma.todo.update({
      data: {
        completed: !!completed,
      },
      where: {
        id: parseInt(taskId),
        userId: req.userId,
      },
    });
    res.status(StatusCodes.OK).json(updateTodo);
  } catch (error) {
    console.error('Error updating task:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

export const deleteTodo = async (req, res) => {
  const taskId = req.params.id;

  try {
    await prisma.todo.deleteUnique({
      where: {
        id: parseInt(taskId),
        userId: req.userId,
      },
    });
    res.status(StatusCodes.OK).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};
