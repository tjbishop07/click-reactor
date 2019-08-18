import React, { useState, useEffect } from 'react';
import { databaseRef } from '../config/firebase';
import ReactionItem from './ReactionItem';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import "./style.css";
import { useAuth } from '../state/auth';

export default function Reactor() {

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
          setReactionItems(reactions)
        });
    }
    return () => unsubscribe;
  }, [user]);

  function addReactionItem(reactionItem) {
    databaseRef.child(`userReactors/${user.uid}`).push().set({
      title: 'Start clicking...',
      clicks: 0,
      energy: 0,
      reactionStarted: false,
      reactionStartedAt: null,
      extinguished: false,
      extinguishedAt: null
    });
  }

  return (
    <div>
      <div className={`reactor-down ${reactionItems.length > 0 ? 'hidden' : ''}`}>
        <h4><span role="img" aria-label="Battery">🔋</span></h4>
      </div>
      <div className="game-session-list-container">
        {reactionItems.map(r => (
          <ReactionItem key={r.id} id={r.id} propReaction={r.reaction} />
        ))}
      </div>
      <Fab aria-label="Add" className="fab-add-reaction" color="primary" onClick={() => addReactionItem()}>
        <AddIcon />
      </Fab>
    </div>
  );

}