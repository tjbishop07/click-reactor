import React, { useContext } from 'react';
import { useListVals } from 'react-firebase-hooks/database';
import { databaseRef } from '../config/firebase';
import { useAuth } from '../state/auth';
import * as firebase from 'firebase';
import "../styles/reactor.scss";
import GameContext from "../state/context";
import useInterval from '../hooks/useInterval';
import ReactionButton from '../components/ReactionButton';

export default function Reactor() {

  const context = useContext(GameContext);
  const { user } = useAuth();
  const [reactors] = useListVals(firebase.database().ref(`userReactors/${user.uid}`).limitToLast(1), { keyField: 'id' });

  const saveGame = () => {
    if (!context.data.score) {
      context.updateScore(0);
    }
    reactors.forEach(reactor => {
      if (reactor.id) {
        databaseRef.child(`userReactors/${user.uid}/${reactor.id}`).set(reactor);
      }
    });
    context.updateActivityLog({ body: `Game Saved. Score: ${context.data.score}` });
  }

  useInterval(saveGame.bind(), 60000);

  return (
    <React.Fragment>
      {reactors.map(r => (
        <ReactionButton key={r.id} propReaction={r} />
      ))}
    </React.Fragment>
  );

}