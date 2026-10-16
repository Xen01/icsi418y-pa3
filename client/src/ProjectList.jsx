import { useState, useEffect } from 'react';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(() => setError('Failed to load projects'));
  }, []);

  return (
    <div>
      <h3>Projects</h3>
      {error && <p>{error}</p>}
      {projects.length === 0 && <p>No projects found.</p>}
      
      {projects.map(p => (
        <div key={p._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
          <h4>{p.name} <span style={{ fontSize: '0.8em', color: '#666' }}>({p.status})</span></h4>
          <p>{p.description}</p>
          <p><strong>Lead:</strong> {p.project_lead_id?.f_name} {p.project_lead_id?.l_name} ({p.project_lead_id?.username})</p>
        </div>
      ))}
    </div>
  );
}