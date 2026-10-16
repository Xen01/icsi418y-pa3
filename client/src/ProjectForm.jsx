import { useState, useEffect } from 'react';

export default function ProjectForm() {
  const [form, setForm] = useState({ name: '', description: '', status: 'Planning', project_lead_id: '' });
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch users on load for the Project Lead dropdown
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setMessage('Failed to load users'));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) setForm({ name: '', description: '', status: 'Planning', project_lead_id: '' });
    } catch (err) { 
      setMessage('Server error'); 
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create Project</h3>
      <input name="name" placeholder="Project Name" value={form.name} onChange={handleChange} />
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      
      <label>Status:</label>
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="Planning">Planning</option>
        <option value="Active">Active</option>
        <option value="Completed">Completed</option>
      </select>

      <label>Project Lead:</label>
      <select name="project_lead_id" value={form.project_lead_id} onChange={handleChange}>
        <option value="">Select Project Lead</option>
        {users.map(u => (
          <option key={u._id} value={u._id}>{u.f_name} {u.l_name} ({u.username})</option>
        ))}
      </select>

      <button type="submit">Create Project</button>
      <p>{message}</p>
    </form>
  );
}