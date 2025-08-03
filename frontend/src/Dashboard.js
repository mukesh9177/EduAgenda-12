import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [stats, setStats] = useState({
    todos: { total: 0, completed: 0, pending: 0 },
    events: { total: 0, completed: 0, upcoming: 0 },
    achievements: { total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view dashboard');
        setLoading(false);
        return;
      }

      // Fetch todos
      const todosRes = await fetch('/api/todos', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const todosData = await todosRes.json();

      // Fetch events
      const eventsRes = await fetch('/api/events', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const eventsData = await eventsRes.json();

      // Fetch achievements
      const achievementsRes = await fetch('/api/achievements', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const achievementsData = await achievementsRes.json();

      if (todosData.success && eventsData.success && achievementsData.success) {
        const todos = todosData.data || [];
        const events = eventsData.data || [];
        const achievements = achievementsData.data || [];

        setStats({
          todos: {
            total: todos.length,
            completed: todos.filter(t => t.done).length,
            pending: todos.filter(t => !t.done).length
          },
          events: {
            total: events.length,
            completed: events.filter(e => e.isCompleted).length,
            upcoming: events.filter(e => !e.isCompleted).length
          },
          achievements: {
            total: achievements.length
          }
        });
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Dashboard</h2>
        <p style={{color: 'red'}}>{error}</p>
        <button onClick={() => window.location.href = '/login'}>Go to Login</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px'}}>
        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f0f8ff'
        }}>
          <h3>📝 Todos</h3>
          <p><strong>Total:</strong> {stats.todos.total}</p>
          <p><strong>Completed:</strong> {stats.todos.completed}</p>
          <p><strong>Pending:</strong> {stats.todos.pending}</p>
        </div>

        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f0fff0'
        }}>
          <h3>📅 Events</h3>
          <p><strong>Total:</strong> {stats.events.total}</p>
          <p><strong>Completed:</strong> {stats.events.completed}</p>
          <p><strong>Upcoming:</strong> {stats.events.upcoming}</p>
        </div>

        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#fff8f0'
        }}>
          <h3>🏆 Achievements</h3>
          <p><strong>Total:</strong> {stats.achievements.total}</p>
        </div>
      </div>

      <div style={{marginTop: '30px'}}>
        <h3>Quick Actions</h3>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <button onClick={() => window.location.href = '/todos'}>Add Todo</button>
          <button onClick={() => window.location.href = '/events'}>Add Event</button>
          <button onClick={() => window.location.href = '/achievements'}>Add Achievement</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 