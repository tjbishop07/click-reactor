import React from 'react';
import ReactGA from 'react-ga';
import { useAuth } from './state/auth';

import Provider from "./state/provider";
import Reactor from './components/Reactor';
import Welcome from './components/Welcome';
import HUD from "./components/Hud";

export default function App() {

  const trackingId = 'UA-207735600';
  ReactGA.initialize(trackingId);
  // ReactGA.set({
  //   userId: auth.currentUserId(),
  //   // any data that is relevant to the user session
  //   // that you would like to track with google analytics
  // })

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