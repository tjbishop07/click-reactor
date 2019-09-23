import React, { useContext } from 'react';
import { useListVals } from 'react-firebase-hooks/database';
import { databaseRef } from '../config/firebase';
import Reaction from './Reaction';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { useAuth } from '../state/auth';
import Button from '@material-ui/core/Button';
import * as firebase from 'firebase';
import { useSnackbar } from 'notistack';
import "../styles/reactor.scss";
import GameContext from "../state/context";
import useInterval from '../hooks/useInterval';

export default function Reactor() {

  const context = useContext(GameContext);
  const { user } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [reactors, loadingReactors] = useListVals(firebase.database().ref(`userReactors/${user.uid}`), { keyField: 'id' });

  const showMessage = (message, variant) => {
    enqueueSnackbar(message,
      {
        variant: variant,
        action:
          <Button onClick={() => { closeSnackbar() }}>
            {'OK'}
          </Button>
      });
  }

  const saveGame = () => {
    if (!context.data.score) {
      context.updateScore(0);
    }
    // TODO: This is saving the ID right?
    console.log('save game reactors', reactors);
    reactors.forEach(reactor => {
      if (reactor.id) {
        databaseRef.child(`userReactors/${user.uid}/${reactor.id}`).set(reactor);
      }
    });
    context.updateActivityLog({ body: `Game Saved. Your score is ${context.data.score}` });
  }

  useInterval(saveGame.bind(), 60000);

  return (
    <React.Fragment>
      <div className="game-session-list-container">
        {reactors.reverse().map(r => (
          <Reaction key={`reactor-${r.id}`} propReaction={r} />
        ))}
      </div>
    </React.Fragment>
  );

}