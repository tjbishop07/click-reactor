import React, { useState, useEffect, useContext } from 'react';
import useInterval from '../hooks/useInterval';
import ReactTooltip from 'react-tooltip'
import { databaseRef } from '../config/firebase';
import * as firebase from 'firebase';
import hive from '../img/hive.svg';
import dna from '../img/dna.svg';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
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
import lime from '@material-ui/core/colors/lime';
import '../styles/reaction.scss';

export default function ReactionItem(props) {

  const { id, propReaction } = props;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isFlipped, setIsFlipped] = useState(false);
  const [duration, setDuration] = useState('');
  const [clickBuffer, setClickBuffer] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [reactionState, setReactionState] = useState({});
  const [toolTipText, setToolTipText] = useState('Start clicking!');
  const [reactionTimerDelay, setReactionTimerDelay] = useState(1000);
  const [durationTimerDelay, setDurationTimerDelay] = useState(100);
  const [saveGameTimerDelay, setSaveGameTimerDelay] = useState(10000);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const context = useContext(GameContext);
  const progressColor = lime.A700;

  useEffect(() => {
    setReactionState(propReaction);
    setClickCount(propReaction.clicks);
    if (reactionState.energy > 0) {
      setToolTipText('Sweet! Now keep clicking...');
    } else {
      setToolTipText('Start clicking!');
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const saveGame = () => {
    databaseRef.child(`userReactors/${user.uid}/${id}`).set(reactionState);
  }

  const updateDurationLabel = () => {
    if (propReaction && propReaction.startedAt) {
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
  }

  const burnEnergy = () => {
    if (reactionState && reactionState.reactionStarted) {

      const reactionUpdates = {
        ...reactionState
      };

      var nowDate = new Date();
      var startedAt = new Date(reactionState.startedAt);
      var duration = nowDate.getTime() - startedAt.getTime();
      var durationMinutes = Math.floor(duration / (1000 * 60));

      const diff = Math.random() * durationMinutes;
      let newEnergyCalculation = Math.min(reactionState.energy - diff, 100);
      newEnergyCalculation = Math.min(newEnergyCalculation + (reactionState.cps * 2), 100);

      if (reactionState.cps > 0) {
        calculateClicks();
      }

      if (newEnergyCalculation < 0) {
        killReaction();
        return;
      } else {
        reactionUpdates.energy = newEnergyCalculation;
        reactionUpdates.reactionStarted = true;
      }

      setReactionState(reactionUpdates);

    }
  }

  const killReaction = () => {
    setReactionTimerDelay(null);
    setDurationTimerDelay(null);
    setSaveGameTimerDelay(null);
    const reactionUpdates = {
      ...reactionState,
      energy: 0,
      cps: 0,
      extinguished: true,
      title: 'Extinguished',
      extinguishedAt: firebase.database.ServerValue.TIMESTAMP
    };
    setReactionState(reactionUpdates);
    saveGame();
  };

  const chargeReaction = () => {
    const reactionUpdates = {
      ...reactionState
    };
    if (!reactionState.reactionStarted) {
      const diff = Math.random() * 2;
      const newCompletedCalulcation = Math.min(reactionState.energy + diff, 100);
      reactionUpdates.clicks = parseFloat((reactionState.clicks || 0) + 1).toFixed(2);
      reactionUpdates.energy = newCompletedCalulcation;
      setClickCount(reactionState.clicks);
      context.updateScore(1);
      if (reactionState.energy >= 100) {
        reactionUpdates.energy = 100;
        reactionUpdates.reactionStarted = true;
        context.updateScore(reactionState.clicks * 10);
        showMessage('Reaction started! Now keep it going...', 'success');
      }
    } else {
      if (!reactionUpdates.extinguished) {
        const diff = Math.random() * 2;
        const newCompletedCalulcation = Math.min(reactionUpdates.energy + diff, 100);
        reactionUpdates.energy = newCompletedCalulcation;
        calculateClicks();
      }
    }
    setReactionState(reactionUpdates);
  };

  const calculateClicks = () => {
    const reactionUpdates = {
      ...reactionState
    };
    let totalClickCount = Math.min((reactionState.cps / 10) + 1, 100);
    context.updateScore(1);
    setClickBuffer(totalClickCount + parseFloat(clickBuffer));
    totalClickCount = totalClickCount + parseFloat(clickCount);
    if (clickBuffer > 10) {
      setClickBuffer(0);
      setClickCount(totalClickCount.toFixed(2));
      reactionUpdates.clicks = parseFloat(totalClickCount.toFixed(2));
      setReactionState(reactionUpdates);
    }
  }

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

  const purchaseItem = (energySource) => {
    const cost = calculateCost(energySource.type, energySource.basePrice);
    if (cost === 0) {
      showMessage('Purchase failed.', 'error');
      return;
    }
    if (parseFloat(cost) > parseFloat(clickCount)) {
      showMessage('You do not have enough cash for this item', 'error');
      return;
    }
    const reactionUpdates = {
      ...reactionState,
      cps: reactionState.cps + energySource.cps,
      clicks: parseFloat(clickCount - cost).toFixed(2)
    };
    reactionUpdates.energySources.push(energySource);
    setReactionState(reactionUpdates);
    setClickCount(reactionUpdates.clicks);
    showMessage('Purchase complete!', 'success');
  }

  const calculateCost = (type, basePrice) => {
    if (reactionState && reactionState.energySources) {
      let purchasedItemResults = reactionState.energySources.filter(source => source.type === type);
      if (!purchasedItemResults) {
        return parseFloat(basePrice).toFixed(2);
      } else {
        return parseFloat(basePrice * purchasedItemResults.length).toFixed(2);
      }
    }
    return 0;
  }

  const getCount = (type) => {
    if (reactionState && reactionState.energySources) {
      let purchasedItemResults = reactionState.energySources.filter(source => source.type === type);
      if (!purchasedItemResults) {
        return 0;
      } else {
        return purchasedItemResults.length;
      }
    }
    return 0;
  }

  useInterval(burnEnergy.bind(this), reactionTimerDelay);
  useInterval(updateDurationLabel.bind(this), durationTimerDelay);
  useInterval(saveGame.bind(this), saveGameTimerDelay);

  return (
    <GameContext.Consumer>
      {context => (
        <div>
          {(isLoading) ? <CircularProgress color="secondary" /> :

            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
              <div
                key="front"
                onClick={() => chargeReaction()}
                className={`reaction-container ${reactionState.reactionStarted ? 'charged' : ''} ${reactionState.extinguished ? 'extinguished' : ''}`}>
                <span className={reactionState.extinguished ? 'skully' : 'hidden'}>☠</span>
                <img src={reactionState.reactionStarted ? dna : hive} className="hive" alt="hive" data-for={`reactionTip${id}`} data-tip="Hi" />
                <span className="totalcps">CPS: {parseFloat(reactionState.cps).toFixed(2)}</span>
                <span className="duration">{duration}</span>
                <span className="clicks">${parseFloat(clickCount).toFixed(2)}</span>
                <span className="energy">{reactionState.energy ? reactionState.energy.toFixed(2) : 0}%</span>
                <LinearProgress className="progress-bar" color="primary" variant="buffer" valueBuffer={reactionState.energy} value={reactionState.energy ? reactionState.energy : 0} />
                <Fab aria-label="Energy" className={`fab-reaction ${reactionState.extinguished ? 'hidden' : ''}`} color="secondary" onClick={() => setIsFlipped(true)}>
                  <BatteryChargingFullIcon />
                </Fab>
              </div>
              <div
                key="back"
                className={`reaction-container card-back ${reactionState.reactionStarted ? 'charged' : ''}`}>
                <img src={reactionState.reactionStarted ? dna : hive} className="hive" alt="hive" />
                <span className="clicks">Energy Sources</span>
                <List aria-label="Energy Sources" className="energySourcesList">
                  <ListItem button onClick={() => purchaseItem({ type: 'sticks', cps: 0.2, basePrice: 10 })}>
                    <ListItemText>{getCount('sticks')}</ListItemText>
                    <ListItemText>Rub Sticks Together (${calculateCost('sticks', 10)})</ListItemText>
                  </ListItem>
                  <ListItem button onClick={() => purchaseItem({ type: 'matches', cps: 0.4, basePrice: 20 })}>
                    <ListItemText>{getCount('matches')}</ListItemText>
                    <ListItemText>Matches (${calculateCost('matches', 20)})</ListItemText>
                  </ListItem>
                  <ListItem button onClick={() => purchaseItem({ type: 'firecracker', cps: 0.6, basePrice: 30 })}>
                    <ListItemText>{getCount('firecracker', 30)}</ListItemText>
                    <ListItemText>Firecrackers (${calculateCost('firecracker', 30)})</ListItemText>
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

          }
          <ReactTooltip id={`reactionTip${id}`} className="reactionTip" delayUpdate={1000} border={true} type="light" getContent={() => toolTipText} effect="solid" />
        </div>
      )}
    </GameContext.Consumer>

  );

}