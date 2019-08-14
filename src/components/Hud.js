import React, { useState, useEffect } from 'react';

export default function useHeadsUpDisplay() {

    const [score, updateScore] = useState(0);

    useEffect(() => {
      function handleScoreChange(score) {
        updateScore(score);
      }
    });

    return (
      <div>
        {/* {this.loadReactions()} */}
        <div className="reactionBg"></div>
        <div className="hud-container">
          {/* <h4>SCORE: {this.scores.reduce( function(count, reaction_score){ return count + reaction_score; }, 0)}</h4> */}
          <h4>SCORE: {score}</h4>
          {/* <h4>REACTIONS: {props ? _.map(props).length : '0'}/3</h4> */}
        </div>
      </div>
    );

  // function loadReactions() {
  //   const { data } = this.props;
  //   const x = _.map(data);
  //   this.scores = _.map(x, 'clicks');
  // }

}

// const mapStateToProps = ({ data }) => {
//   return {
//     data
//   }
// }

// export default connect(mapStateToProps, actions)(Hud);