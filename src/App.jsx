import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import UserForm from './UserForm';
import GameApp from './GameApp';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function App() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return 'loading ...';
  }

  if (error) {
    return 'There was an error';
  }

  if (!user) {
    return <UserForm />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:id" element={<GameApp />} />
        </Routes>
      </Router>
    </DndProvider>
  );
}