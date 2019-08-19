import React, { Fragment } from 'react';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';

export default function HUD() {

  const { user } = useAuth();

  return (
    <GameContext.Consumer>
      {context => (
        <Fragment>
          <div>
            <div className="reactionBg"></div>
            <div className="hud-container">
              <h5>OPERATOR: {user ? (user.displayName ? user.displayName : `Anonymous`) : 'N/A'}</h5>
              <h5>SCORE: {context.data.score}</h5>
            </div>
          </div>
        </Fragment>
      )}
    </GameContext.Consumer>
  );
}