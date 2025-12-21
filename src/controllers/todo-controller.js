import { StatusCodes } from 'http-status-codes';
import db from '../db.js';
export const getAllTodos = async (req, res) => {
  const userId = req.userId;
  console.log(` User ID from middleware: ${userId} `);
  const getTasksQuery = `
    SELECT * FROM todos 
    WHERE user_id = ?
        `;
  try {
    const getTasks = db.prepare(getTasksQuery);
    const todos = getTasks.all(userId);
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
  const insertTaskQuery = `
    INSERT INTO todos (user_id, task) VALUES (?, ?)
  `;
  try {
    const insertedTask = db.prepare(insertTaskQuery);
    const result = insertedTask.run(userId, task);
    res
      .status(StatusCodes.CREATED)
      .json({ id: result.lastInsertRowid, task, completed: 0 });
  } catch (error) {
    console.error('Error creating task:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

export const updateTodo = async (req, res) => {
  const taskId = req.params.id;
  const { task, completed } = req.body;
  const updateTaskQuery = `
    UPDATE todos
    SET task = ?, completed = ?
    WHERE id = ?
  `;
  try {
    const updateTask = db.prepare(updateTaskQuery);
    updateTask.run(task, completed, taskId);
    res.status(StatusCodes.OK).json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

export const deleteTodo = async (req, res) => {
  const taskId = req.params.id;
  const deleteTaskQuery = `
  DELETE FROM todos
  WHERE id = ?
  `;
  try {
    const deleteTask = db.prepare(deleteTaskQuery);
    deleteTask.run(taskId);
    res.status(StatusCodes.OK).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};
