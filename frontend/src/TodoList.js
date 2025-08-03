import React, { useEffect, useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/todos', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success) {
        setTodos(data.data);
      } else {
        setError(data.message || 'Failed to fetch todos');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ text, date, time })
      });
      const data = await res.json();
      if (data.success) {
        setTodos([...todos, data.data]);
        setText('');
        setDate('');
        setTime('');
      } else {
        setError(data.message || 'Failed to add todo');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success) {
        setTodos(todos.filter(todo => todo._id !== id));
      } else {
        setError(data.message || 'Failed to delete todo');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Todo List</h2>
      <form onSubmit={handleAddTodo}>
        <input type="text" placeholder="Todo text" value={text} onChange={e => setText(e.target.value)} required />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
        <button type="submit" disabled={loading}>Add Todo</button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {loading && <p>Loading...</p>}
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>
            {todo.text} ({todo.date ? new Date(todo.date).toLocaleDateString() : ''} {todo.time || ''})
            <button onClick={() => handleDelete(todo._id)} disabled={loading}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList; 