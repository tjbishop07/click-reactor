import React, { useState, useEffect, useContext } from 'react';
import { useSpring, animated } from 'react-spring'
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
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';
import { useSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';
import PointTarget from 'react-point';
import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import '../styles/reaction.scss';

export default function ReactionItem(props) {

  const { propReaction } = props;
  const [state, toggle] = useState(true)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [duration, setDuration] = useState('');
  const [clickBuffer, setClickBuffer] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [reactionState, setReactionState] = useState({});
  const [toolTipText, setToolTipText] = useState('Start clicking!');
  const [reactionTimerDelay, setReactionTimerDelay] = useState(1000);
  const [durationTimerDelay, setDurationTimerDelay] = useState(null);
  const [saveGameTimerDelay, setSaveGameTimerDelay] = useState(10000);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const context = useContext(GameContext);

  const [stickCount, setStickCount] = useState(0);

  const { x } = useSpring({
    from: { x: 0 },
    x: state ? 1 : 0,
    config: { duration: 50 }
  })

  useEffect(() => {
    setReactionState(propReaction);
    setClickCount(propReaction.clicks);
    if (propReaction && propReaction.energy) {
      if (propReaction.energy > 0) {
        setToolTipText('Sweet! Now keep clicking...');
      } else {
        setToolTipText('Start clicking!');
      }
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    setDurationTimerDelay(100);
  }, []);

  useEffect(() => {
    if (reactionState && reactionState.energySources) {
      let purchasedItemResults = reactionState.energySources.filter(source => source.type === 'sticks');
      if (!purchasedItemResults) {
        setStickCount(0);
      } else {
        setStickCount(purchasedItemResults.length);
      }
    }
  }, [reactionState]);

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
    toggle(!state);
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
      if (reactionUpdates.energy >= 100) {
        reactionUpdates.energy = 100;
        reactionUpdates.reactionStarted = true;
        reactionUpdates.reactionStartedAt = firebase.database.ServerValue.TIMESTAMP;
        context.updateScore(reactionState.clicks * 10);

        setTimeout(() => {
          setDurationTimerDelay(100);
        }, 1000);

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
    saveGame();
    showMessage('Purchase complete!', 'success');
    setOpenDrawer(false);
  }

  const calculateCost = (type, basePrice) => {
    if (reactionState && reactionState.energySources) {
      let purchasedItemResults = reactionState.energySources.filter(source => source.type === type);
      if (purchasedItemResults.length === 0) {
        return parseFloat(basePrice).toFixed(2);
      } else {
        return parseFloat(basePrice * (purchasedItemResults.length + 1)).toFixed(2);
      }
    }
    return 0;
  }

  useInterval(burnEnergy.bind(this), reactionTimerDelay);
  useInterval(updateDurationLabel.bind(this), durationTimerDelay);
  useInterval(saveGame.bind(this), saveGameTimerDelay);

  const useStyles = makeStyles({
    root: {
      flexGrow: 1,
      paddingTop: 40
    },
    card: {
      maxWidth: 345,
      height: 350
    },
    media: {
      height: 140,
    },
  });
  const classes = useStyles();

  return (
    <GameContext.Consumer>
      {context => (
        <div>
          {(isLoading) ? <CircularProgress color="secondary" /> :
            <div className="augment-container" augmented-ui="tr-clip bl-clip br-clip-y exe">
              <div className="reaction-container">
                <Fab aria-label="Energy" className={`fab-reaction ${reactionState.extinguished ? 'hidden' : ''}`} color="secondary" onClick={() => setOpenDrawer(true)}>
                  <BatteryChargingFullIcon />
                </Fab>
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
                }} className={`reaction-graphic ${reactionState.reactionStarted ? 'charged' : ''} ${reactionState.extinguished ? 'extinguished' : ''}`}>
                  <PointTarget onPoint={() => chargeReaction()}>
                    <div>
                      <span className={reactionState.extinguished ? 'skully' : 'hidden'}>☠</span>
                      <img src={reactionState.reactionStarted ? dna : hive} className="hive" alt="hive" data-for={`reactionTip${propReaction.id}`} data-tip="Hive" />
                    </div>
                  </PointTarget>
                </animated.div>
              </div>
            </div>
          }
          <ReactTooltip id={`reactionTip${propReaction.id}`} className="reactionTip" delayUpdate={1000} border={true} type="light" getContent={() => toolTipText} effect="solid" />
          <Drawer anchor="bottom" open={openDrawer} className="reactionDrawer" onClose={() => setOpenDrawer(false)}>

            <div className={classes.root}>
              <Grid container spacing={5}>
                <Grid item sm={6}>

                  <Card className={classes.card} augmented-ui="tr-clip bl-clip br-clip-y exe" onClick={() => purchaseItem({ type: 'sticks', cps: 0.2, basePrice: 10 })}>
                    <CardActionArea>
                      <CardMedia
                        className={classes.media}
                        image="https://images.pexels.com/photos/1174461/pexels-photo-1174461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                        title="Rub Sticks"
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                          Rub Sticks Together
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          You heard right! Nothing better than good old fashioned elbow grease.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions>
                      <Button size="small" color="primary" onClick={() => purchaseItem({ type: 'sticks', cps: 0.2, basePrice: 10 })}>Buy ${calculateCost('sticks', 10)}</Button>
                      <Typography>
                        Purchased: {stickCount}
                      </Typography>
                    </CardActions>
                  </Card>

                </Grid>
                <Grid item sm={6}>

                  <Card className={classes.card} augmented-ui="tr-clip bl-clip br-clip-y exe">
                    <CardActionArea>
                      <CardMedia
                        className={classes.media}
                        image="https://images.pexels.com/photos/21462/pexels-photo.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                        title="Matches"
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                          Matches
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          Finally! Give you arms a rest and start flicking those matches.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions>
                      <Button size="small" color="primary" onClick={() => purchaseItem({ type: 'matches', cps: 0.4, basePrice: 20 })}>Buy ${calculateCost('matches', 20)}</Button>
                    </CardActions>
                  </Card>

                </Grid>
                <Grid item sm={6}>

                  <Card className={classes.card} augmented-ui="tr-clip bl-clip br-clip-y exe">
                    <CardActionArea>
                      <CardMedia
                        className={classes.media}
                        image="https://images.pexels.com/photos/167080/pexels-photo-167080.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                        title="Firecracker"
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                          Firecrackers
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          Now it's time to start moving on to some more serious stuff.
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions>
                      <Button size="small" color="primary" onClick={() => purchaseItem({ type: 'firecracker', cps: 0.6, basePrice: 30 })}>Buy ${calculateCost('firecracker', 30)}</Button>
                    </CardActions>
                  </Card>

                </Grid>
              </Grid>
            </div>

          </Drawer>
        </div>
      )
      }
    </GameContext.Consumer >

  );

}