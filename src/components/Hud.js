import React, { Fragment, useState, useEffect } from 'react';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';
import Grid from '@material-ui/core/Grid';
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import Login from './Login';

export default function HUD() {

  const [showLogin, setShowLogin] = useState(false);
  const { user, initializing } = useAuth();

  useEffect(() => {
    console.log('hud user', user);
    setShowLogin(!user);
    if (user != null) {
      user.providerData.forEach(function (profile) {
        console.log("Sign-in provider: " + profile.providerId);
        console.log("  Provider-specific UID: " + profile.uid);
        console.log("  Name: " + profile.displayName);
        console.log("  Email: " + profile.email);
        console.log("  Photo URL: " + profile.photoURL);
      });
    }
  }, [initializing]);

  return (
    <GameContext.Consumer>
      {context => (
        <Fragment>
          <div>
            <div className="hud-container">
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <h4 className="score">SCORE: {context.data.score < 0 ? '0' : context.data.score}</h4>
                </Grid>
                <Grid item xs={4}>
                  <h1 className="title">Click Reactors</h1>
                </Grid>
                <Grid item xs={4}>
                  <h4 className="username" onClick={() => { setShowLogin(!showLogin); }}>{context.data.fullName ? context.data.fullName : (user ? (user.displayName ? user.displayName : `Anonymous`) : 'Welcome!')}</h4>
                </Grid>
              </Grid>
            </div>
          </div>
          {!user ? <Login /> : ''}
          {/* <Login /> */}
        </Fragment>
      )}
    </GameContext.Consumer>
  );
}