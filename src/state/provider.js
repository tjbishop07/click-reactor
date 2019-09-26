import React, { useState, useEffect } from "react";
import GameContext from "./context";
import { databaseRef } from '../config/firebase';
import { useAuth } from './auth';
import * as firebase from 'firebase';

export default function Provider(props) {   

    const { user } = useAuth();
    const [state, setState] = useState({
        activityLog: [],
        fullName: null,
        score: 0
    });

        // useState(() => {
        //     setState({
        //         activityLog: [],
        //         fullName: 'Anonymous',
        //         score: 0
        //     });
        // }, [])

    useEffect(() => {
        let unsubscribe;
        if (user) {
            unsubscribe = databaseRef.child(`gameStates/${user.uid}`)
                .on('value', snapshot => {
                    if (snapshot.val()) {
                        const newState = { 
                            ...state, 
                            score: snapshot.val().score,
                            fullName: snapshot.val().fullName
                        };
                        setState(newState);
                    }
                });
        }
        return () => unsubscribe;
    }, [user]);

    useEffect(() => {
        updateGameStateScore();
    }, [state.score]);

    function updateGameStateScore() {
        if (state.score > 0 && user) {
            databaseRef.child(`gameStates/${user.uid}/score`).set(state.score);
        }
    }

    useEffect(() => {
        updateGameStateFullName();
    }, [state.fullName]);

    function updateGameStateFullName() {
        if (state.fullName && user) {
            databaseRef.child(`gameStates/${user.uid}/fullName`).set(state.fullName);
        }
    }

    if (state.activityLog) {
        useEffect(() => {
            updateGameStateActivityLog();
        }, [state.activityLog.length]);
    }

    function updateGameStateActivityLog() {
        if (state.activityLog && user) {
            databaseRef.child(`gameStates/${user.uid}/activityLog`).set(state.activityLog);
        }
    }

    return (
        <GameContext.Provider
            value={{
                data: state,
                updateFullName: (newName) => {
                    console.log('update full name', newName);
                    setState({ ...state, fullName: newName });
                },
                updateScore: (newScore) => {
                    setState({ ...state, score: ((state.score ? state.score : 0) + newScore) });
                },
                updateActivityLog: (newActivityLogItem) => {
                    newActivityLogItem.timestamp = firebase.database.ServerValue.TIMESTAMP;
                    let tempActivityLog = state.activityLog;
                    if (!tempActivityLog) {
                        tempActivityLog = [];
                    }
                    tempActivityLog.push(newActivityLogItem);
                    setState({ ...state, activityLog: tempActivityLog });
                }
            }}
        >
            {props.children}
        </GameContext.Provider>
    );

};