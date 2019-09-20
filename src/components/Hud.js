import React, { useState, useEffect } from 'react';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';
import Login from './Login';
import Grid from '@material-ui/core/Grid';
import '../styles/hud.scss';

export default function HUD() {

  const [showLogin, setShowLogin] = useState(false);
  const { user, initializing } = useAuth();

  useEffect(() => {
    setShowLogin(!user);
  }, [initializing]);

  return (
    <GameContext.Consumer>
      {context => (
        <div className="hud-container">
          <Grid container spacing={3}>
            <Grid item>
              
            </Grid>
            <Grid item>
              <h4 className="username" onClick={() => { setShowLogin(!showLogin); }}>PLAYER: {context.data.fullName ? context.data.fullName : (user ? (user.displayName ? user.displayName : `Anonymous`) : 'N/A')}</h4>
              <h4 className="score">SCORE: {context.data.score < 0 ? '0' : context.data.score}</h4>
            </Grid>
            <Grid item>
              {(showLogin && !user) ? <Login /> :
                <React.Fragment>
                  <h4 className="score">REACTORS: 0</h4>
                  <h4 className="score">AVG. HALFLIFE: --:--:--:--:--</h4>
                </React.Fragment>
              }
            </Grid>
          </Grid>
        </div>
      )}
    </GameContext.Consumer >
  );
}