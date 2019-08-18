import React, { useState, useEffect, Fragment } from 'react';
import { databaseRef } from '../config/firebase';
import hive from '../img/hive.svg';
import dna from '../img/dna.svg';
import LinearProgress from '@material-ui/core/LinearProgress';
import Fab from '@material-ui/core/Fab';
import BatteryChargingFullIcon from '@material-ui/icons/BatteryChargingFull';
import ReactCardFlip from 'react-card-flip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import SettingsBackupRestore from '@material-ui/icons/SettingsBackupRestore';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';

export default function ReactionItem(props) {

  let reactionTimer = null;
  const { id, propReaction } = props;
  const [isFlipped, setIsFlipped] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!reactionTimer) {
      reactionTimer = setInterval(triggerReaction.bind(this), 2000);
    }
  }, []);

  async function triggerReaction() {
    if (propReaction.reactionStarted) {
      const diff = Math.random() * 2;
      const newEnergyCalculation = Math.min(propReaction.energy - diff, 100);
      if (newEnergyCalculation < 0) {
        killReaction(id);
      } else {
        propReaction.energy = newEnergyCalculation;
        propReaction.reactionStarted = true;
        propReaction.reactionStartedAt = new Date();
        await databaseRef.child(`userReactors/${user.uid}/${id}`).set(propReaction);
      }
    }
  }

  async function killReaction() {
    reactionTimer = null;
    propReaction.energy = 0;
    propReaction.extinguished = true;
    propReaction.title = 'Extinguished';
    propReaction.extinguishedAt = new Date();
    await databaseRef.child(`userReactors/${user.uid}/${id}`).set(propReaction);
  };

  function chargeReaction(context) {
    if (!propReaction.reactionStarted) {
      const diff = Math.random() * 2;
      const newCompletedCalulcation = Math.min(propReaction.energy + diff, 100);
      propReaction.clicks = (propReaction.clicks || 0) + 1;
      propReaction.energy = newCompletedCalulcation;
      context.updateScore(1);

      if (propReaction.energy >= 100) {
        propReaction.energy = 100;
        propReaction.reactionStarted = true;
        context.updateScore(10);
        if (!reactionTimer) {
          reactionTimer = setInterval(triggerReaction.bind(this), 2000);
        }
      } else {
      }
      databaseRef.child(`userReactors/${user.uid}/${id}`).set(propReaction);
    }
  };

  return (


    <GameContext.Consumer>
      {context => (
        <Fragment>


          <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
            <div
              key="front"
              className={`game-session-list-item ${propReaction.reactionStarted ? 'charged' : ''} ${propReaction.extinguished ? 'extinguished' : ''}`}
              onClick={() => {
                chargeReaction(context);
              }}>
              <img src={propReaction.reactionStarted ? dna : hive} className="hive" alt="hive" />
              <span className="clicks">{propReaction.clicks}</span>
              <span className="energy">{propReaction.energy ? propReaction.energy.toFixed(2) : 0}%</span>
              <span className="status-text">
                {(propReaction.reactionStarted && !propReaction.extinguished) ? 'Reaction started!' : propReaction.title}
              </span>
              <LinearProgress className="progress-bar" color="secondary" variant="determinate" value={propReaction.energy} />
              <Fab aria-label="Energy" className={`fab-reaction ${propReaction.extinguished ? 'hidden' : ''}`} color="secondary" onClick={() => setIsFlipped(true)}>
                <BatteryChargingFullIcon />
              </Fab>
            </div>
            <div
              key="back"
              className={`game-session-list-item card-back ${propReaction.reactionStarted ? 'charged' : ''}`}>
              <img src={propReaction.reactionStarted ? dna : hive} className="hive" alt="hive" />
              <span className="clicks">Energy Sources</span>
              <List aria-label="Energy Sources" className="energySourcesList">
                <ListItem button>
                  <ListItemText>0</ListItemText>
                  <ListItemText>Rub Sticks Together</ListItemText>
                </ListItem>
                <ListItem button>
                  <ListItemText>0</ListItemText>
                  <ListItemText>Matches</ListItemText>
                </ListItem>
                <ListItem button>
                  <ListItemText>0</ListItemText>
                  <ListItemText primary="Firecracker" />
                </ListItem>
                <ListItem button>
                  <ListItemText>0</ListItemText>
                  <ListItemText primary="M80" />
                </ListItem>
                <ListItem button>
                  <ListItemText>0</ListItemText>
                  <ListItemText primary="Dynomite" />
                </ListItem>
                <ListItem button>
                  <ListItemText>0</ListItemText>
                  <ListItemText primary="C4" />
                </ListItem>
              </List>
              <Fab aria-label="Back" className="fab-reaction" color="primary" onClick={() => setIsFlipped(false)}>
                <SettingsBackupRestore />
              </Fab>
            </div>
          </ReactCardFlip >


        </Fragment>
      )}
    </GameContext.Consumer>

  );

}