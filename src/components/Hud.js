import React, { useState, useEffect } from 'react';
export default function useHeadsUpDisplay() {

    const [score, setScore] = useState(0);

    useEffect(() => {
      setScore(0);
    }, []);

    return (
      <div>
        <div className="reactionBg"></div>
        <div className="hud-container">
          <h4>SCORE: {score}</h4>
        </div>
      </div>
    );
}