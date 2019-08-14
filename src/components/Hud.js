import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import _ from 'lodash';

class Hud extends Component {

  render() { 
    const { data } = this.props;
    return (
      <div>
        {this.loadReactions()}
        <div className="reactionBg"></div>
        <div className="hud-container">
          <h4>SCORE: {this.scores.reduce( function(count, reaction_score){ return count + reaction_score; }, 0)}</h4>
          <h4>REACTIONS: {data ? _.map(data).length : '0'}/3</h4>
        </div>
      </div>
    );
  }

  loadReactions = () => {
    const { data } = this.props;
    const x = _.map(data);
    this.scores = _.map(x, 'clicks');
  }

}

const mapStateToProps = ({ data }) => {
  return {
    data
  }
}

export default connect(mapStateToProps, actions)(Hud);