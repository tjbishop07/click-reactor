import React, { useState, useEffect } from 'react';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';
import Grid from '@material-ui/core/Grid';
import Avatar from 'react-avatar';
import '../styles/hud.scss';
import logo from '../img/logo-transparent.png';

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
              <img src={logo} alt="Click Reactors" className="logo" />
            </Grid>
            <Grid item>
              <Avatar size="35" className="avatar" name={context.data.fullName ? context.data.fullName : (user ? (user.displayName ? user.displayName : `Anonymous`) : 'N/A')} />
            </Grid>
            <Grid item>
              <h4 className="username" onClick={() => { setShowLogin(!showLogin); }}>PLAYER: {context.data.fullName ? context.data.fullName : (user ? (user.displayName ? user.displayName : `Anonymous`) : 'N/A')}</h4>
              <h4 className="score">SCORE: {context.data.score < 0 ? '0' : context.data.score}</h4>
            </Grid>
            <Grid item>
              {(showLogin && !user) ? '' :
                <React.Fragment>
                  <h4 className="username">REACTORS: 0</h4>
                  <h4 className="score">AVG. HALFLIFE: --:--:--:--:--</h4>
                </React.Fragment>
              }
            </Grid>
            <Grid>
            </Grid>
          </Grid>
        </div>
      )}
    </GameContext.Consumer >
  );
}