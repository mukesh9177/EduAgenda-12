import React, { useEffect, useState } from 'react';

function Events() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/events', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        setError(data.message || 'Failed to fetch events');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setEvents([...events, data.data]);
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          location: ''
        });
      } else {
        setError(data.message || 'Failed to add event');
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
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(events.filter(event => event._id !== id));
      } else {
        setError(data.message || 'Failed to delete event');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleToggleComplete = async (id, isCompleted) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ isCompleted: !isCompleted })
      });
      const data = await res.json();
      if (data.success) {
        setEvents(events.map(event => 
          event._id === id ? { ...event, isCompleted: !isCompleted } : event
        ));
      } else {
        setError(data.message || 'Failed to update event');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Events</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input 
            type="text" 
            id="title" 
            name="title"
            value={formData.title} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea 
            id="description" 
            name="description"
            value={formData.description} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label htmlFor="date">Date:</label>
          <input 
            type="date" 
            id="date" 
            name="date"
            value={formData.date} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label htmlFor="time">Time:</label>
          <input 
            type="time" 
            id="time" 
            name="time"
            value={formData.time} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input 
            type="text" 
            id="location" 
            name="location"
            value={formData.location} 
            onChange={handleChange} 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding Event...' : 'Add Event'}
        </button>
      </form>
      
      {error && <p style={{color: 'red'}}>{error}</p>}
      {loading && <p>Loading...</p>}
      
      <div>
        <h3>Your Events</h3>
        {events.length === 0 ? (
          <p>No events yet. Create your first event!</p>
        ) : (
          <ul>
            {events.map(event => (
              <li key={event._id} style={{
                textDecoration: event.isCompleted ? 'line-through' : 'none',
                opacity: event.isCompleted ? 0.6 : 1
              }}>
                <strong>{event.title}</strong>
                <br />
                {event.description}
                <br />
                Date: {event.date ? new Date(event.date).toLocaleDateString() : ''} 
                Time: {event.time || ''}
                {event.location && <span> | Location: {event.location}</span>}
                <br />
                <button 
                  onClick={() => handleToggleComplete(event._id, event.isCompleted)}
                  disabled={loading}
                >
                  {event.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button 
                  onClick={() => handleDelete(event._id)}
                  disabled={loading}
                  style={{marginLeft: '10px'}}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Events; 