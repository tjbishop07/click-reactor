import React, { useState, useEffect } from 'react';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Login from './Login';
import '../styles/hud.scss';

export default function HUD() {

  const [showLogin, setShowLogin] = useState(false);
  const { user, initializing } = useAuth();

  useEffect(() => {
    setShowLogin(!user);
  }, [initializing]);

  // return (
  //   <GameContext.Consumer>
  //     {context => (<h4 className="score">SCORE: {context.data.score < 0 ? '0' : context.data.score}</h4>)}
  //   </GameContext.Consumer >
  // );

  return (
    <GameContext.Consumer>
      {context => (
        <React.Fragment>
          <div className="hud-container">
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <h4 className="score">SCORE: {context.data.score < 0 ? '0' : context.data.score}</h4>
              </Grid>
              <Grid item xs={4}>
                <Typography className="title" variant="h1">
                  C/R
                  </Typography>
              </Grid>
              <Grid item xs={4}>
                <h4 className="username" onClick={() => { setShowLogin(!showLogin); }}>PLAYER: {context.data.fullName ? context.data.fullName : (user ? (user.displayName ? user.displayName : `Anonymous`) : 'N/A')}</h4>
              </Grid>
            </Grid>
          </div>
          {!user ? <Login /> : ''}
        </React.Fragment>
      )}
    </GameContext.Consumer>
  );
}