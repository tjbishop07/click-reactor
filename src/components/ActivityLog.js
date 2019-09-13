import React, { useState, useEffect } from 'react';
import { useAuth } from '../state/auth';
import { useListVals } from 'react-firebase-hooks/database';
import * as firebase from 'firebase';
import Moment from 'react-moment';
import "../styles/activity-log.scss";

export default function ActivityLog() {

  const { user } = useAuth();
  const [activityLog, loadingActivityLog] = useListVals(firebase.database().ref(`gameStates/${user.uid}/activityLog`), { keyField: 'id' });
  const [activityLogSummary, setActivityLogSummary] = useState([]);

  useEffect(() => {
    setActivityLogSummary(activityLog.reverse().splice(0, 10));
  }, [activityLog.length])

  if (loadingActivityLog) {
    return (
      <React.Fragment>
        <h4>Loading...</h4>
      </React.Fragment>)
  } else {
    return (
      <div className={`augment-container-log ${activityLogSummary.length === 0 ? 'hidden' : ''}`} augmented-ui="tr-clip bl-clip br-clip-y exe">
        <ul className="activity-log-container">
          {
            activityLogSummary.map(item => (
              <li key={item.id}>
                <p>{item.body}<span><Moment fromNow>{item.timestamp}</Moment></span></p>
              </li>
            ))
          }
        </ul>
      </div>
    )
  }
}