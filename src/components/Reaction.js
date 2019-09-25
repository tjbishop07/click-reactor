import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useTransition, useSpring, useChain, config } from 'react-spring'
import useInterval from '../hooks/useInterval';
import { databaseRef } from '../config/firebase';
import * as firebase from 'firebase';
import hive from '../img/hive.svg';
import LinearProgress from '@material-ui/core/LinearProgress';
import Fab from '@material-ui/core/Fab';
import BatteryChargingFullIcon from '@material-ui/icons/BatteryChargingFull';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';
import { useSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';
import '../styles/reaction.scss';
import store from '../data/store';
import { Item, Container } from '../styles/styles'

// TODO: This component is too big? Need to see if we car break it down
export default function ReactionItem(props) {

  const { propReaction } = props;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { user } = useAuth();
  const context = useContext(GameContext);
  const [state, toggle] = useState(true)
  const [openDrawer, setOpenDrawer] = useState(false);
  const [duration, setDuration] = useState('');
  const [clickBuffer, setClickBuffer] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [reactionState, setReactionState] = useState(null);
  const [reactionTimerDelay, setReactionTimerDelay] = useState(1000);
  const [durationTimerDelay, setDurationTimerDelay] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [reactionStartDateTime, setReactionStartDateTime] = useState(null);

  const storeItems = useMemo(() => store, []);
  const transRef = useRef();
  const transitions = useTransition(openDrawer ? storeItems : [], item => item.name, {
    ref: transRef,
    unique: true,
    trail: 400 / store.length,
    from: { opacity: 0, marginTop: '-250px' },
    enter: { opacity: 1, marginTop: '0' },
    leave: { opacity: 0, marginTop: '0' }
  })

  const springRef = useRef()
  const { size, opacity, ...rest } = useSpring({
    ref: springRef,
    config: config.gentle,
    from: { marginTop: '-250px' },
    to: { marginTop: openDrawer ? '0' : '-250px' }
  })

  useChain(openDrawer ? [springRef, transRef] : [transRef, springRef], [0, openDrawer ? 0.1 : 0.6])

  useEffect(() => {
    setReactionState(propReaction);
    setClickCount(propReaction.clicks);
    setIsLoading(false);
    if (propReaction.extinguished) {
      setReactionTimerDelay(null);
      setDurationTimerDelay(null);
    }
  }, []);

  useEffect(() => {
    if (reactionState) {
      updateDurationLabel();
      if (propReaction.clicks > reactionState.clicks) {
        setClickCount(propReaction.clicks);
        calculateClicks();
      }
    }
  }, [reactionState]);

  // Hook into props
  useEffect(() => {
    if (propReaction) {
      setReactionState(propReaction);
      setClickCount(propReaction.clicks);
      return () => (propReaction);
    }
  }, [propReaction.energy]);

  const getReactionStartTimestamp = () => {
    // NOTE: This check is required since we use the ServerValue. TIMESTAMP for Firebase. 
    //       When initially set, it's and object so we need this to work around that.
    return (typeof reactionState.reactionStartedAt === 'object' ?
      reactionStartDateTime :
      new Date(reactionState.reactionStartedAt));
  }

  const saveGame = () => {
    if (reactionState.id) {
      databaseRef.child(`userReactors/${user.uid}/${reactionState.id}`).set(reactionState);
    }
  }

  const updateDurationLabel = () => {

    if (reactionState) {

      if (!reactionState.reactionStarted && !reactionState.extinguished) {
        setDuration('--:--:--:--:--');
        return;
      }

      var nowDate = new Date();
      if (reactionState.extinguished) {
        nowDate = new Date(reactionState.extinguishedAt);
      }

      var diff = nowDate.getTime() - getReactionStartTimestamp().getTime();

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
    if (reactionState
      && reactionState.reactionStarted) {

      const reactionUpdates = {
        ...reactionState
      };

      var nowDate = new Date();
      var duration = nowDate.getTime() - getReactionStartTimestamp();
      var durationMinutes = Math.floor(duration / (1000 * 60));

      const diff = Math.random() * durationMinutes;
      let newEnergyCalculation = Math.min(reactionState.energy - diff, 100);
      newEnergyCalculation = Math.min(newEnergyCalculation + (reactionState.cps * 2), 100);

      if (reactionState.cps > 0) {
        calculateClicks();
      }

      if (newEnergyCalculation <= 0) {
        killReaction();
        return;
      } else {
        reactionUpdates.energy = newEnergyCalculation;
        reactionUpdates.reactionStarted = true;
        setReactionState(reactionUpdates);
      }
    }
  }

  const killReaction = () => {
    setReactionTimerDelay(null);
    setDurationTimerDelay(null);
    const reactionUpdates = {
      ...reactionState,
      energy: 0,
      cps: 0,
      reactionStarted: false,
      extinguished: true,
      title: 'Extinguished',
      extinguishedAt: firebase.database.ServerValue.TIMESTAMP
    };
    setReactionState(reactionUpdates);
    context.updateActivityLog({ body: `Reaction extinguised. Sad day.` });
  };

  const chargeReaction = () => {
    toggle(!state);
    let reactionUpdates = { ...reactionState };
    if (!reactionUpdates.reactionStarted) {
      const diff = Math.random() * 2;
      const newCompletedCalulcation = Math.min(reactionState.energy + diff, 100);
      reactionUpdates.clicks = parseFloat((parseFloat(reactionUpdates.clicks) || 0) + 1).toFixed(2);
      reactionUpdates.energy = newCompletedCalulcation;
      setClickCount(reactionUpdates.clicks);
      context.updateScore(1);
      if (reactionUpdates.energy >= 100) {
        reactionUpdates.energy = 100;
        reactionUpdates.reactionStarted = true;
        reactionUpdates.reactionStartedAt = firebase.database.ServerValue.TIMESTAMP;
        setReactionStartDateTime(new Date());
        context.updateScore(reactionState.clicks * 10);
        context.updateActivityLog({ body: `Oh sweet! You started a reaction. It will slowly burn out unless you keep it going. Try exploring energy sources to throw into the reactor.` });
        setDurationTimerDelay(100);
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
    let totalClickCount = Math.min((reactionUpdates.cps), 100);
    context.updateScore(1);
    setClickBuffer(totalClickCount + parseFloat(clickBuffer));
    totalClickCount = totalClickCount + parseFloat(clickCount);
    if (clickBuffer > 2) {
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
            {'OK'}
          </Button>
      });
  }

  const purchaseItem = (energySource) => {
    const cost = calculateCost(energySource.id, energySource.basePrice);
    if (parseFloat(cost) > parseFloat(clickCount)) {
      showMessage('You do not have enough cash for this item.', 'error');
      return;
    }
    const reactionUpdates = {
      ...reactionState,
      cps: reactionState.cps + energySource.baseCPS,
      clicks: parseFloat(clickCount - cost).toFixed(2)
    };
    if (!reactionUpdates.energySources) {
      reactionUpdates.energySources = [];
    }
    reactionUpdates.energySources.push(energySource);
    setReactionState(reactionUpdates);
    setClickCount(reactionUpdates.clicks);
    context.updateActivityLog({ body: `${energySource.name} purchased for $${cost}` })
  }

  const calculateCost = (id, basePrice) => {
    if (reactionState && reactionState.energySources) {
      const purchasedItemResults = reactionState.energySources.filter(source => source.id === id);
      if (purchasedItemResults.length === 0) {
        return parseFloat(basePrice).toFixed(2);
      } else {
        return parseFloat(basePrice * (purchasedItemResults.length + 1)).toFixed(2);
      }
    }
    return 0;
  }

  useInterval(burnEnergy.bind(), reactionTimerDelay);
  useInterval(updateDurationLabel.bind(), durationTimerDelay);
  useInterval(saveGame.bind(), 1000);

  return (

    <React.Fragment>
      {(isLoading) ? <span>...</span> :
        <div className={`augment-container ${reactionState.extinguished ? 'extinguished' : ''}`} augmented-ui="tr-clip bl-clip br-clip-y exe">
          <div id="reaction" className={`reaction-container`} >
            {!reactionState.extinguished ? <span className="totalcps">CPS: {parseFloat(reactionState.cps).toFixed(2)}</span> : ''}
            <span className="duration">{duration}</span>
            {!reactionState.extinguished ? <span className="clicks">${parseFloat(clickCount).toFixed(2)}</span> : ''}
            {!reactionState.extinguished ? <span className="energy">{reactionState.energy ? reactionState.energy.toFixed(2) : 0}%</span> : ''}
            <LinearProgress className="progress-bar" color="primary" variant="determinate" value={reactionState.energy ? reactionState.energy : 0} />
            <div className={`reaction-graphic ${reactionState.reactionStarted ? 'charged' : ''}`}>
              {reactionState.extinguished ?
                <React.Fragment>
                  <span className={reactionState.extinguished ? 'skully' : 'hidden'} onClick={() => console.log('boo')}>☠</span>
                </React.Fragment>
                : ''}
              <img src={hive} className="hive" alt="hive" onClick={() => chargeReaction()} />
            </div>
            <Container style={{ ...rest, width: size, height: size }} className="reaction-store">
              {transitions.map(({ item, key, props }) => (
                <Item onClick={() => purchaseItem(item)} key={key} style={{ ...props, background: item.css }}>
                  <h4>{item.name}</h4>
                  <p>Price: ${calculateCost(item.id, item.basePrice)}</p>
                  <p>Purchased: {(reactionState.energySources ? reactionState.energySources : []).filter(s => s.id === item.id).length}</p>
                  {item.icon ? <svg viewBox="0 0 23 23" width="100px" height="100px" className="store-icon" xmlns="http://www.w3.org/2000/svg"><path d={item.icon} /></svg>
                    : ''}
                </Item>
              ))}
            </Container>
          </div>
          <Fab aria-label="Energy" className={`fab-reaction ${reactionState.extinguished ? 'hidden' : ''} ${!reactionState.reactionStarted ? 'hidden' : ''}`} color="secondary" onClick={() => setOpenDrawer(!openDrawer)}>
            <BatteryChargingFullIcon />
          </Fab>
        </div>
      }
    </React.Fragment>


  );

}