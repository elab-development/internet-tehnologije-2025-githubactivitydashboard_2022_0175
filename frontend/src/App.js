import React from 'react';
import './App.css';
import Registration from './Registration';

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{ minHeight: '50vh', backgroundColor: '#282c34', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1>GitHub Tracker 🚀</h1>
        <p>Projekat: Anja & Una</p>
      </header>
      <main>
        <Registration />
      </main>
    </div>
  );
}

export default App;