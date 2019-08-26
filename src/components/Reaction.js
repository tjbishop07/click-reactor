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
import { useSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';
import PointTarget from 'react-point';
import '../styles/reaction.scss';

export default function ReactionItem(props) {

  let reactionTimer = null;
  let durationTimer = null;
  let gameSaveTimer = null;
  const { id, propReaction } = props;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isFlipped, setIsFlipped] = useState(false);
  const [duration, setDuration] = useState('');
  const [clickBuffer, setClickBuffer] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    setClickCount(propReaction.clicks);
    if (!reactionTimer) {
      reactionTimer = setInterval(triggerReaction.bind(this), 5000);
    }
    if (!durationTimer) {
      durationTimer = setInterval(updateDurationLabel.bind(this), 100);
    }
    // if (!gameSaveTimer) {
    //   gameSaveTimer = setInterval(saveGame.bind(this), 10000);
    // }
  }, []);

  function saveGame() {
    databaseRef.child(`userReactors/${user.uid}/${id}`).set(propReaction);
  }

  function updateDurationLabel() {
    var nowDate = new Date();
    var startedAt = new Date(propReaction.startedAt);
    var diff = nowDate.getTime() - startedAt.getTime();

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    var hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    var mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);

    var seconds = Math.floor(diff / (1000));
    diff -= seconds * (1000);

    var milliSeconds = Math.floor(diff / (1000000));
    diff -= milliSeconds * (1000000);

    setDuration((days < 10 ? `0${days}` : days) + ":" +
      (hours < 10 ? `0${hours}` : hours) + ":" +
      (mins < 10 ? `0${mins}` : mins) + ":" +
      (seconds < 10 ? `0${seconds}` : seconds) + ":" +
      diff.toString().substr(0, 2));
  }

  function triggerReaction() {
    if (propReaction.reactionStarted) {
      const diff = Math.random() * 2;
      const newEnergyCalculation = Math.min(propReaction.energy - diff, 100);
      if (newEnergyCalculation < 0) {
        killReaction(id);
      } else {
        propReaction.energy = newEnergyCalculation;
        propReaction.reactionStarted = true;
        propReaction.reactionStartedAt = new Date();
        propReaction.clicks = clickCount;
        databaseRef.child(`userReactors/${user.uid}/${id}`).set(propReaction);
      }
    }
  }

  function killReaction() {
    clearTimeout(reactionTimer);
    clearTimeout(durationTimer);
    propReaction.energy = 0;
    propReaction.extinguished = true;
    propReaction.title = 'Extinguished';
    propReaction.extinguishedAt = new Date();
    databaseRef.child(`userReactors/${user.uid}/${id}`).set(propReaction);
  };

  function chargeReaction(context) {
    if (!propReaction.reactionStarted) {
      const diff = Math.random() * 2;
      const newCompletedCalulcation = Math.min(propReaction.energy + diff, 100);
      propReaction.clicks = (propReaction.clicks || 0) + 1;
      setClickCount(propReaction.clicks);
      propReaction.energy = newCompletedCalulcation;
      context.updateScore(1);
      if (propReaction.energy >= 100) {
        propReaction.energy = 100;
        propReaction.reactionStarted = true;
        context.updateScore(propReaction.clicks * 10);
        showMessage('Reaction started! Now keep it going...', 'success');
        if (!reactionTimer) {
          reactionTimer = setInterval(triggerReaction.bind(this), 2000);
        }
      }
      databaseRef.child(`userReactors/${user.uid}/${id}`).set(propReaction);
    } else {
      const diff = Math.random() * 2;
      const newCompletedCalulcation = Math.min(propReaction.energy + diff, 100);
      propReaction.energy = newCompletedCalulcation;
      context.updateScore(1);
      setClickBuffer(clickBuffer + 1);
      if (clickBuffer === 10) {
        setClickBuffer(0);
        setClickCount(clickCount + 1);
        propReaction.clicks = clickCount;
        databaseRef.child(`userReactors/${user.uid}/${id}/clicks`).set(clickCount + 1);
      }
    }
  };

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

  return (

    <GameContext.Consumer>
      {context => (
        <Fragment>
          <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
            <PointTarget key="front" onPoint={() => { chargeReaction(context); }}>
              <div
                key="front"
                className={`reaction-container ${propReaction.reactionStarted ? 'charged' : ''} ${propReaction.extinguished ? 'extinguished' : ''}`}>
                <img src={propReaction.reactionStarted ? dna : hive} className="hive" alt="hive" />
                <span className="duration">{duration}</span>
                <span className="clicks">{clickCount}</span>
                <span className="energy">{propReaction.energy ? propReaction.energy.toFixed(2) : 0}%</span>
                <span className="status-text">
                  {(propReaction.reactionStarted && !propReaction.extinguished) ? 'Reaction started!' : propReaction.title}
                </span>
                <LinearProgress className="progress-bar" color="primary" variant="determinate" value={propReaction.energy} />
                <Fab aria-label="Energy" className={`fab-reaction ${propReaction.extinguished ? 'hidden' : ''}`} color="secondary" onClick={() => setIsFlipped(true)}>
                  <BatteryChargingFullIcon />
                </Fab>
              </div>
            </PointTarget>
            <div
              key="back"
              className={`reaction-container card-back ${propReaction.reactionStarted ? 'charged' : ''}`}>
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