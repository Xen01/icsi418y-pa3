import { useState, useEffect } from 'react';

export default function MembershipManager() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [message, setMessage] = useState('');

  // Fetch projects and users on load
  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(setProjects);
    fetch('/api/users').then(res => res.json()).then(setUsers);
  }, []);

  const fetchMembers = async (projectId) => {
    if (!projectId) return;
    const res = await fetch(`/api/projects/${projectId}/members`);
    const data = await res.json();
    setMembers(data);
  };

  const handleProjectChange = (e) => {
    const id = e.target.value;
    setSelectedProject(id);
    setMessage('');
    fetchMembers(id);
  };

  const handleAddMember = async () => {
    setMessage('');
    if (!selectedUser || !selectedProject) return setMessage('Please select a project and user');
    
    const res = await fetch(`/api/projects/${selectedProject}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: selectedUser })
    });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) {
      fetchMembers(selectedProject);
      setSelectedUser('');
    }
  };

  const handleRemoveMember = async (userId) => {
    setMessage('');
    const res = await fetch(`/api/projects/${selectedProject}/members/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    setMessage(data.message);
    if (res.ok) fetchMembers(selectedProject);
  };

  return (
    <div>
      <h3>Manage Project Members</h3>
      
      <label>Select a Project: </label>
      <select value={selectedProject} onChange={handleProjectChange}>
        <option value="">-- Choose --</option>
        {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
      </select>

      {selectedProject && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '15px' }}>
          <h4>Current Members</h4>
          {members.length === 0 && <p>No members yet.</p>}
          
          {members.map(m => (
            <div key={m._id} style={{ display: 'flex', gap: '15px', alignItems: 'center', margin: '5px 0' }}>
              <span>{m.user_id?.f_name} {m.user_id?.l_name} ({m.user_id?.username})</span>
              <button onClick={() => handleRemoveMember(m.user_id._id)} style={{ backgroundColor: '#dc3545' }}>
                Remove
              </button>
            </div>
          ))}

          <hr />
          <h4>Add Member</h4>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">Select a User</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.f_name} {u.l_name} ({u.username})</option>)}
          </select>
          <button onClick={handleAddMember} style={{ marginLeft: '10px' }}>Add to Project</button>
        </div>
      )}
      
      <p><strong>{message}</strong></p>
    </div>
  );
}