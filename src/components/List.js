import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import * as actions from '../actions';
import ReactionItem from './ReactionItem';
import "./style.css";
import FlipMove from 'react-flip-move';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

class List extends Component {

  state = {
    showForm: false,
    formValue: "",
    clicks: 0
  };

  inputChange = event => {
    this.setState({ formValue: event.target.value });
  };

  formSubmit = event => {
    const { formValue } = this.state;
    const { addGameSession } = this.props;
    event.preventDefault();
    addGameSession({ title: formValue });
    this.setState({ formValue: "" });
  };

  renderForm = () => {
    const { showForm, formValue } = this.state;
    if (showForm) {
      return (
        <div id="game-session-add-form" className="name-form">
          <form onSubmit={this.formSubmit}>
            <div className="input-field">
              <input
                value={formValue}
                onChange={this.inputChange}
                id="gameSessionNext"
                type="text"
              />
              <label htmlFor="gameSessionNext">Name</label>
            </div>
          </form>
        </div>
      );
    }
  };
  loadReactions() {
    const { data } = this.props;
    const gameSessions = _.map(data, (value, key) => {
      return <ReactionItem key={key} gameSessionId={key} gameSession={value} />;
    });
    if (!_.isEmpty(gameSessions)) {
      return gameSessions;
    }
    return (
      <div className="reactor-down">
        <h4>Meltdown.</h4>
      </div>
    );
  }
  componentWillMount() {
    this.props.fetchGameSessions();
  }
  render() {
    const { addGameSession } = this.props;
    return (
      <div>
        <div className="row">
          <div className="col">
            {this.renderForm()}
          </div>
        </div>
        <div className="game-session-list-container">
          <FlipMove
            easing="ease-in-out"
            duration="500"
            staggerDurationBy="300"
            enterAnimation="fade">
            {this.loadReactions()}
          </FlipMove>
        </div>
        <Fab aria-label="Add" className="fab-add-reaction" color="primary" onClick={() => addGameSession({ title: 'Start clicking...' })}>
          <AddIcon />
        </Fab>
      </div>
    );
  }
}

const mapStateToProps = ({ data }) => {
  return {
    data
  }
}

export default connect(mapStateToProps, actions)(List);