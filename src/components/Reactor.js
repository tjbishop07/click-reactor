import React, { useContext, useEffect } from 'react';
import { useListVals } from 'react-firebase-hooks/database';
import { databaseRef } from '../config/firebase';
import { useAuth } from '../state/auth';
import * as firebase from 'firebase';
import "../styles/reactor.scss";
import GameContext from "../state/context";
import useInterval from '../hooks/useInterval';
import Reaction from './Reaction';

export default function Reactor() {

  const context = useContext(GameContext);
  const { user } = useAuth();
  const [reactors] = useListVals(firebase.database().ref(`userReactors/${user.uid}`).limitToLast(1), { keyField: 'id' });

  useEffect(() => {
    context.updateActivityLog({ body: 'If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.' });
  }, []);

  const saveGame = () => {
    if (!context.data.score) {
      context.updateScore(0);
    }
    reactors.forEach(reactor => {
      if (reactor.id) {
        databaseRef.child(`userReactors/${user.uid}/${reactor.id}`).set(reactor);
      }
    });
    const particleScore = window._particles.length;
    context.updateScore(particleScore);
    context.updateActivityLog({ body: `Game Saved. Score: ${context.data.score ? (context.data.score + particleScore) : 0}` });
  }

  useInterval(saveGame.bind(), 60000);

  return (
    <React.Fragment>
      {reactors.map(r => (
        <Reaction key={r.id} reactionState={context.data} />
      ))}
    </React.Fragment>
  );

}