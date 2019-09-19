import React, { useState, useEffect } from 'react';
import { useAuth } from '../state/auth';
import { useListVals } from 'react-firebase-hooks/database';
import { useSpring, animated } from 'react-spring';
import * as firebase from 'firebase';
import Moment from 'react-moment';
import "../styles/activity-log.scss";

export default function ActivityLog(props) {

  const { isOpen } = props;
  const { user } = useAuth();
  const [activityLog, loadingActivityLog] = useListVals(firebase.database().ref(`gameStates/${user.uid}/activityLog`), { keyField: 'id' });
  const [activityLogSummary, setActivityLogSummary] = useState([]);
  const activityLogAnimation = useSpring({
    bottom: isOpen ? '50px' : '-390px'
  });

  useEffect(() => {
    setActivityLogSummary(activityLog.reverse().splice(0, 10));
  }, [activityLog.length])

  return (
    <animated.div style={activityLogAnimation} className={`augment-container-log`} augmented-ui="tr-clip tl-clip tl-clip-y exe">
      {loadingActivityLog ? <h4>Loading...</h4>
        : <ul className="activity-log-container">
          {
            activityLogSummary.map(item => (
              <li key={item.id}>
                <p>{item.body}<span><Moment fromNow>{item.timestamp}</Moment></span></p>
              </li>
            ))
          }
        </ul>}
    </animated.div>
  )
}