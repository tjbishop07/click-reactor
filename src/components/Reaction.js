import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useTransition, useSpring, useChain, config, animated } from 'react-spring'
import useInterval from '../hooks/useInterval';
import { databaseRef } from '../config/firebase';
import * as firebase from 'firebase';
import hive from '../img/hive.svg';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
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
  const [state, toggle] = useState(true)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [duration, setDuration] = useState('');
  const [clickBuffer, setClickBuffer] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [reactionState, setReactionState] = useState({});
  const [reactionTimerDelay, setReactionTimerDelay] = useState(1000);
  const [durationTimerDelay, setDurationTimerDelay] = useState(null);
  const [saveGameTimerDelay] = useState(30000);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const context = useContext(GameContext);

  // Spring JS Configs
  const { x } = useSpring({
    from: { x: 0 },
    x: state ? 1 : 0,
    config: { duration: 50 }
  })

  const storeItems = useMemo(() => store, []);
  const transRef = useRef();
  const transitions = useTransition(openDrawer ? storeItems : [], item => item.name, {
    ref: transRef,
    unique: true,
    trail: 400 / store.length,
    from: { opacity: 0, transform: 'scale(0)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0)' }
  })

  const springRef = useRef()
  const { size, opacity, ...rest } = useSpring({
    ref: springRef,
    config: config.gentle,
    from: { size: '0%' },
    to: { size: openDrawer ? '100%' : '0%' }
  })

  useChain(openDrawer ? [springRef, transRef] : [transRef, springRef], [0, openDrawer ? 0.1 : 0.6])

  // Initial load effect
  useEffect(() => {
    setReactionState(propReaction);
    setClickCount(propReaction.clicks);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    setDurationTimerDelay(100);
  }, []);

  const saveGame = () => {
    databaseRef.child(`userReactors/${user.uid}/${reactionState.id}`).set(reactionState);
  }

  const updateDurationLabel = () => {
    if (reactionState
      && reactionState.reactionStartedAt
      && reactionState.reactionStartedAt > 0) {
      var nowDate = new Date();
      var reactionStartedAt = new Date(reactionState.reactionStartedAt);
      var diff = nowDate.getTime() - reactionStartedAt.getTime();

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
      && reactionState.reactionStarted
      && reactionState.reactionStartedAt > 0) {

      const reactionUpdates = {
        ...reactionState
      };

      var nowDate = new Date();
      var reactionStartedAt = new Date(reactionState.reactionStartedAt);
      var duration = nowDate.getTime() - reactionStartedAt.getTime();
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
      extinguished: true,
      title: 'Extinguished',
      extinguishedAt: firebase.database.ServerValue.TIMESTAMP
    };
    setReactionState(reactionUpdates);
  };

  const chargeReaction = () => {
    toggle(!state);
    const reactionUpdates = {
      ...reactionState
    };
    if (!reactionUpdates.reactionStarted) {
      const diff = Math.random() * 2;
      const newCompletedCalulcation = Math.min(reactionUpdates.energy + diff, 100);
      reactionUpdates.clicks = parseFloat((parseFloat(reactionState.clicks) || 0) + 1).toFixed(2);
      reactionUpdates.energy = newCompletedCalulcation;
      setClickCount(reactionUpdates.clicks);
      setReactionState(reactionUpdates);
      context.updateScore(1);
      if (reactionUpdates.energy >= 100) {
        reactionUpdates.energy = 100;
        reactionUpdates.reactionStarted = true;
        reactionUpdates.reactionStartedAt = firebase.database.ServerValue.TIMESTAMP;
        setReactionState(reactionUpdates);
        context.updateScore(reactionState.clicks * 10);
        setDurationTimerDelay(100);
        showMessage('Reaction started! Now keep it going...', 'success');
      }
    } else {
      if (!reactionUpdates.extinguished) {
        const diff = Math.random() * 2;
        const newCompletedCalulcation = Math.min(reactionUpdates.energy + diff, 100);
        reactionUpdates.energy = newCompletedCalulcation;
        setReactionState(reactionUpdates);
        calculateClicks();
      }
    }
  };

  const calculateClicks = () => {
    const reactionUpdates = {
      ...reactionState
    };
    let totalClickCount = Math.min((reactionUpdates.cps / 10) + 1, 100);
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
      showMessage('You do not have enough cash for this item', 'error');
      return;
    }
    const reactionUpdates = {
      ...reactionState,
      cps: reactionState.cps + energySource.cps,
      clicks: parseFloat(clickCount - cost).toFixed(2)
    };
    if (!reactionUpdates.energySources) {
      reactionUpdates.energySources = [];
    }
    reactionUpdates.energySources.push(energySource);
    setReactionState(reactionUpdates);
    setClickCount(reactionUpdates.clicks);
    showMessage('Purchase complete!', 'success');
    setOpenDrawer(false);
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

  const deleteReaction = () => {
    const reactionUpdates = {
      ...reactionState,
      deleted: true
    };
    setReactionState(reactionUpdates);
    saveGame();
  }

  useInterval(burnEnergy.bind(), reactionTimerDelay);
  useInterval(updateDurationLabel.bind(), durationTimerDelay);
  useInterval(saveGame.bind(), saveGameTimerDelay);

  return (
    <GameContext.Consumer>
      {context => (
        <React.Fragment>
          {(isLoading) ? <CircularProgress color="secondary" /> :
            <div className="augment-container" augmented-ui="tr-clip bl-clip br-clip-y exe">
              <div id="reaction" className={`reaction-container ${reactionState.extinguished ? 'extinguished' : ''}`} >
                <span className="totalcps">CPS: {parseFloat(reactionState.cps).toFixed(2)}</span>
                <span className="duration">{duration}</span>
                <span className="clicks">${parseFloat(clickCount).toFixed(2)}</span>
                <span className="energy">{reactionState.energy ? reactionState.energy.toFixed(2) : 0}%</span>
                <LinearProgress className="progress-bar" color="primary" variant="determinate" value={reactionState.energy ? reactionState.energy : 0} />
                <animated.div style={{
                  opacity: x.interpolate({ range: [0, 1], output: [0.7, 1] }),
                  transform: x
                    .interpolate({
                      range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
                      output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1]
                    })
                    .interpolate(x => `scale(${x})`)
                }} className={`reaction-graphic ${reactionState.reactionStarted ? 'charged' : ''}`}>
                  {reactionState.extinguished ?
                    <React.Fragment>
                      <h4 className="game-over">GAME OVER</h4>
                      <span className={reactionState.extinguished ? 'skully' : 'hidden'} onClick={() => deleteReaction()}>☠</span>
                    </React.Fragment>
                    : ''}
                  <img src={hive} className="hive" alt="hive" onClick={() => chargeReaction()} />
                </animated.div>
                <Container style={{ ...rest, width: size, height: size }} className="reaction-store">
                  {transitions.map(({ item, key, props }) => (
                    <Item onClick={() => purchaseItem({ id: item.id, cps: item.baseCPS, basePrice: item.basePrice })} key={key} style={{ ...props, background: item.css }}>
                      <h4>{item.name}</h4>
                      <p>Price: ${calculateCost(item.id, item.basePrice)}</p>
                      <p>Purchased: {(reactionState.energySources ? reactionState.energySources : []).filter(s => s.id === item.id).length}</p>
                      {item.icon ? <svg viewBox="0 0 23 23" width="100px" height="100px" className="store-icon" xmlns="http://www.w3.org/2000/svg"><path d={item.icon} /></svg>
                        : ''}
                    </Item>
                  ))}
                </Container>
              </div>
              <Fab aria-label="Energy" className={`fab-reaction ${reactionState.extinguished ? 'hidden' : ''}`} color="secondary" onClick={() => setOpenDrawer(!openDrawer)}>
                <BatteryChargingFullIcon />
              </Fab>
            </div>
          }
        </React.Fragment>
      )
      }
    </GameContext.Consumer >

  );

}