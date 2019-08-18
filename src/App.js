import React from 'react';
import { useAuth } from './state/auth';

import Provider from "./state/provider";
import Reactor from './components/Reactor';
import Welcome from './components/Welcome';
import HUD from "./components/Hud";

export default function App() {
  const { initializing, user } = useAuth();
  if (initializing) {
    return <div>Loading</div>
  }
  let welcomeComponent = <Welcome />;
  return (
    <Provider>
      <div className="App">
        <h1 className="title">Click Reactor</h1>
        <HUD />
        {!user ? welcomeComponent : ''}
        <Reactor />
      </div>
    </Provider>
  )
}