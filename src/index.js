const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find(user => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Already has an user using this username'})
  }

  const user = {
    name, username,
    id: v4(),
    todos: []
  }

  users.push(user)

  return response.json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const todo = {
    id: v4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  request.user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params

  const foundTodo = request.user.todos.find(todo => todo.id === id)

  if (!foundTodo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  Object.assign(foundTodo, { ...foundTodo, title, deadline })

  return response.json(foundTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const foundTodo = request.user.todos.find(todo => todo.id === id)

  if (!foundTodo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  Object.assign(foundTodo, { ...foundTodo, done: true })

  return response.json(foundTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const foundTodo = request.user.todos.find(todo => todo.id === id)

  if (!foundTodo) {
    return response.status(404).json({ error: "Todo not found" })
  }

  request.user.todos.splice(foundTodo, 1)
  return response.status(204).json({})
});

module.exports = app;