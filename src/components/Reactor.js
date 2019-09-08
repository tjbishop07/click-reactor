import React from 'react';
import { useListVals } from 'react-firebase-hooks/database';
import { databaseRef } from '../config/firebase';
import Reaction from './Reaction';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { useAuth } from '../state/auth';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import * as firebase from 'firebase';
import { useSnackbar } from 'notistack';
import "../styles/reactor.scss";

export default function Reactor() {

  const { user } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [values, loading] = useListVals(firebase.database().ref(`userReactors/${user.uid}`), { keyField: 'id' });

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

  const addReactionItem = () => {
    if (values.filter(r => !r.deleted).length < 1) {
      databaseRef.child(`userReactors/${user.uid}`).push().set({
        title: 'Start clicking...',
        clicks: 0,
        energy: 0,
        reactionStarted: false,
        reactionStartedAt: 0,
        extinguished: false,
        extinguishedAt: 0,
        gameStartedAt: firebase.database.ServerValue.TIMESTAMP,
        cps: 0,
        energySources: [{ type: 'init', cps: 0, basePrice: 0 }],
        deleted: false
      });
    } else {
      showMessage('You cannot create more reactions at this time.', 'error');
    }
  }

  const fab = <Fab aria-label="Add" className="fab-add-reaction" color="primary" onClick={() => addReactionItem()}>
    <AddIcon />
  </Fab>;

  if (values) {
    return (
      <React.Fragment>
        <Container maxWidth="lg">
          <div className={`reactor-down ${values.filter(r => !r.deleted).length > 0 ? 'hidden' : ''}`}>
            <h4>"If you want to find the secrets of the universe, think in terms of energy, frequency and vibration."</h4>
            <h5> - Nikola Tesla</h5>
          </div>
          {loading ?
            <React.Fragment>
              <h4>Loading...</h4>
            </React.Fragment> :
            <div className="game-session-list-container">
              {values.filter(r => !r.deleted).map(r => (
                <Reaction key={r.id} propReaction={r} />
              ))}
            </div>
          }
        </Container>
        {user ? fab : ''}
      </React.Fragment>
    );
  } else {
    return (<React.Fragment>Loading...{user ? fab : ''}</React.Fragment>)
  }
}