import React, { useState, useEffect } from 'react';
import { reactionRef } from '../config/firebase';
import ReactionItem from './ReactionItem';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import "./style.css";

export default function List(props) {

  const [reactionItems, setReactionItems] = useState([]);

  useEffect(() => {
    reactionRef
      .on('value', snapshot => {
        const reactions = []
        snapshot.forEach(doc => {
          reactions.push({ id: doc.key, reaction: doc.val() })
        })
        setReactionItems(reactions)
      });
  }, [props]);

  function addReactionItem(reactionItem) {
    reactionRef.push().set({
      title: 'Start clicking...',
      clicks: 0,
      completed: 0,
      energy: 0,
      reactionStarted: false
    });
  }

  return (
    <div>
      <div className={`reactor-down ${reactionItems.length > 0 ? 'hidden' : ''}`}>
        <h4>Meltdown.</h4>
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