import React, { Component } from 'react';
import { connect } from 'react-redux';
import { completeGameSession, updateGameSession } from '../actions';
import hive from '../img/hive.svg';
import dna from '../img/dna.svg';
import LinearProgress from '@material-ui/core/LinearProgress';
import Fab from '@material-ui/core/Fab';
import BatteryChargingFullIcon from '@material-ui/icons/BatteryChargingFull';

class ListItem extends Component {

  state = {
    completed: 0,
    reactionStarted: false
  };
  reactionTimer;

  componentDidMount() {
    this.initState();
  }

  componentWillUnmount() {
    clearInterval(this.reactionTimer);
  }

  initState = () => {
    const { gameSession } = this.props;
    setTimeout(() => {
      this.reactionTimer = setInterval(this.triggerReaction.bind(this), 2000);
      this.setState({
        energy: gameSession.energy,
        reactionStarted: gameSession.reactionStarted,
        completed: gameSession.completed
      });
    }, 1000);
  }

  killReaction = gameSessionId => {
    const { completeGameSession } = this.props;
    completeGameSession(gameSessionId);
  };

  updateGameSessionFromTimer = (gameSession, gameSessionId) => {
    const { updateGameSession } = this.props;
    updateGameSession(gameSession, gameSessionId);
  }

  triggerReaction = () => {
    const { gameSessionId, gameSession } = this.props;
    const { energy, reactionStarted } = this.state;
    if (reactionStarted) {
      const diff = Math.random() * 2;
      const newEnergyCalculation = Math.min(energy - diff, 100);

      if (newEnergyCalculation < 0) {
        // NOTE: Oh no! We ran out of juice
        this.killReaction(gameSessionId);
      } else {
        gameSession.energy = newEnergyCalculation;
        gameSession.reactionStarted = true;
        gameSession.completed = newEnergyCalculation;
        this.updateGameSessionFromTimer(gameSession, gameSessionId);
        this.setState({ energy: newEnergyCalculation, completed: newEnergyCalculation });
      }
    }
  }

  chargeAtoms = (gameSessionId, gameSession) => {
    const { completed, reactionStarted } = this.state;
    const { updateGameSession } = this.props;
    if (!reactionStarted) {
      const diff = Math.random() * 2;
      const newCompletedCalulcation = Math.min(this.state.completed + diff, 100);
      gameSession.clicks = (gameSession.clicks || 0) + 1;
      gameSession.completed = newCompletedCalulcation;
      if (completed >= 100) {
        this.setState({ energy: 100, reactionStarted: true });
        gameSession.reactionStarted = true;
      } else {
        this.setState({ completed: newCompletedCalulcation });
      }
      updateGameSession(gameSession, gameSessionId);
    }
  };

  render() {
    const { gameSessionId, gameSession } = this.props;
    return (
      <div
        key={gameSessionId.replace('$-', '')}
        className={`game-session-list-item ${this.state.reactionStarted ? 'charged' : ''}`}
        onClick={() => this.chargeAtoms(gameSessionId, gameSession)}>
        <img src={this.state.reactionStarted ? dna : hive} className="hive" alt="hive" />
        <span className="clicks">{gameSession.clicks}</span>
        <span className="energy">{gameSession.energy ? gameSession.energy.toFixed(2) : 0}%</span>
        <span className="status-text">
          {this.state.reactionStarted ? 'Reaction started!' : gameSession.title}
        </span>
        <LinearProgress className="progress-bar" color="secondary" variant="determinate" value={this.state.completed} />
        <Fab aria-label="Add" className="fab-reaction" color="primary">
          <BatteryChargingFullIcon />
        </Fab>
      </div>
    );
  }
}

export default connect(null, { completeGameSession, updateGameSession })(ListItem);