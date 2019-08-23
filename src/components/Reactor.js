import React, { useState, useEffect } from 'react';
import { databaseRef } from '../config/firebase';
import ReactionItem from './ReactionItem';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import "./style.scss";
import { useAuth } from '../state/auth';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import * as firebase from 'firebase';
import { useSnackbar } from 'notistack';

export default function Reactor() {

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [reactionItems, setReactionItems] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe;
    if (user) {
      unsubscribe = databaseRef.child(`userReactors/${user.uid}`)
        .on('value', snapshot => {
          const reactions = []
          snapshot.forEach(doc => {
            reactions.push({ id: doc.key, reaction: doc.val() })
          })
          setReactionItems(reactions.reverse());
        });
    }
    return () => unsubscribe;
  }, [user]);

  const showMessage = (message, variant) => {
    enqueueSnackbar(message,
      {
        variant: variant,
        action:
          <Button onClick={() => { closeSnackbar() }}>
            {'Dismiss'}
          </Button>
      });
  }

  function addReactionItem() {
    if (reactionItems.length < 3) {
      databaseRef.child(`userReactors/${user.uid}`).push().set({
        title: 'Start clicking...',
        clicks: 0,
        energy: 0,
        reactionStarted: false,
        reactionStartedAt: null,
        extinguished: false,
        extinguishedAt: null,
        startedAt: firebase.database.ServerValue.TIMESTAMP
      });
    } else {
      showMessage('You cannot create more reactions at this time.', 'error');
    }
  }

  return (
    <div>
      <div className={`reactor-down ${reactionItems.length > 0 ? 'hidden' : ''}`}>
        <h4>"If you want to find the secrets of the universe, think in terms of energy, frequency and vibration." - Nikola Tesla</h4>
      </div>
      <Container maxWidth="md">
        <div className="game-session-list-container">
          {reactionItems.map(r => (
            <ReactionItem key={r.id} id={r.id} propReaction={r.reaction} />
          ))}
        </div>
      </Container>
      <Fab aria-label="Add" className="fab-add-reaction" color="primary" onClick={() => addReactionItem()}>
        <AddIcon />
      </Fab>
    </div>
  );

}