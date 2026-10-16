import { useState } from 'react';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm';
import ProjectForm from './ProjectForm';
import ProjectList from './ProjectList';
import MembershipManager from './MembershipManager';

export default function App() {
  const [tab, setTab] = useState('auth');

  return (
    <div style={{ padding: 20, maxWidth: '800px', margin: '0 auto' }}>
      <h1>ICSI 418Y - Project Management</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => setTab('auth')}>Login / Signup</button>
        <button onClick={() => setTab('create')}>Create Project</button>
        <button onClick={() => setTab('list')}>View Projects</button>
        <button onClick={() => setTab('members')}>Manage Members</button>
      </div>

      <hr />

      {tab === 'auth' && <><SignupForm /><hr /><LoginForm /></>}
      {tab === 'create' && <ProjectForm />}
      {tab === 'list' && <ProjectList />}
      {tab === 'members' && <MembershipManager />}
    </div>
  );
}