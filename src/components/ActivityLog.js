import React, { useState, useEffect } from 'react';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';
import '../styles/activity-log.scss';

export default function ActivityLog() {

  const { user, initializing } = useAuth();

  useEffect(() => {
    setShowLogin(!user);
  }, [initializing]);

  return (
    <GameContext.Consumer>
      {context => (
        <Fragment>

        </Fragment>
      )}
    </GameContext.Consumer>
  );
}