import React, { useState, useEffect } from 'react';
import { reactionRef } from '../config/firebase';
import { useList } from 'react-firebase-hooks/database';
import { connect } from 'react-redux';
import _ from 'lodash';
import * as actions from '../actions';
import ReactionItem from './ReactionItem';
import "./style.css";
import FlipMove from 'react-flip-move';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

export default function List(props) {

  const [snapshots, loading, error] = useList(reactionRef);
  const [reactionItems, setReactionItems] = useState([]);

  function loadReactionItems(reactions) {
    console.log('load reaction items', reactions);
    const reactionItems = _.map(reactions, (value, key) => {
      return <ReactionItem key={key} reactionId={key} reaction={value} />
    });
    if (!_.isEmpty(reactionItems)) {
      console.log('reaction items', reactionItems);
      setReactionItems(reactionItems);
    }
    return (
      <div className="reactor-down">
        <h4>Meltdown.</h4>
      </div>
    );
  }

  function addReactionItem(reactionItem) {
    console.log('add reaction item', reactionItem);
    reactionRef.push().set({
      title: 'Start clicking...',
      clicks: 0,
      completed: 0
    });
  }

  useEffect(() => {
    loadReactionItems(props);
  });

  return (
    <div>
      <div className="game-session-list-container">
        <FlipMove
          easing="ease-in-out"
          duration="500"
          staggerDurationBy="300"
          enterAnimation="fade">
          {/* {this.loadReactions(props)} */}
          {snapshots.map(v => (
            <ReactionItem key={v.key} reaction={v.val()} />
          ))}
        </FlipMove>
      </div>
      <Fab aria-label="Add" className="fab-add-reaction" color="primary" onClick={() => addReactionItem()}>
        <AddIcon />
      </Fab>
    </div>
  );

}

// const mapStateToProps = ({ data }) => {
//   return {
//     data
//   }
// }

// export default connect(mapStateToProps, actions)(List);