import React, { useState, useEffect } from 'react';
import { useAuth } from '../state/auth';
import { useListVals } from 'react-firebase-hooks/database';
import { useSpring, animated, useTrail } from 'react-spring';
import * as firebase from 'firebase';
import Moment from 'react-moment';
import "../styles/activity-log.scss";

export default function ActivityLog(props) {

  const { isOpen } = props;
  const { user } = useAuth();
  const [activityLog, loadingActivityLog] = useListVals(firebase.database().ref(`gameStates/${user.uid}/activityLog`), { keyField: 'id' });
  const [activityLogSummary, setActivityLogSummary] = useState([]);
  const activityLogAnimation = useSpring({
    bottom: isOpen ? '50px' : '-600px'
  });
  const trailAnimation = useTrail(activityLogSummary.length, {
    from: {
      opacity: 0
    },
    to: {
      opacity: isOpen ? 1 : 0
    }
  })
  useEffect(() => {
    setActivityLogSummary(activityLog.reverse().splice(0, 10));
  }, [activityLog.length])

  return (
    <animated.div style={activityLogAnimation} className={`augment-container-log`} augmented-ui="tr-clip tl-clip tl-clip-y exe">
      {loadingActivityLog ? <h4>Loading...</h4>
        : <ul className="activity-log-container">
          {
            trailAnimation.map(({ opacity }, index) => (
              <animated.li style={{ opacity }}
                key={activityLogSummary[index].timestamp}>
                {activityLogSummary[index].body}<span><Moment fromNow>{activityLogSummary[index].timestamp}</Moment></span>
              </animated.li>
            ))
          }
        </ul>}
    </animated.div>
  )
}