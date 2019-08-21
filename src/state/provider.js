import React, { useState, useEffect } from "react";
import GameContext from "./context";
import { databaseRef } from '../config/firebase';
import { useAuth } from './auth';

export default function Provider(props) {
    const { user } = useAuth();
    const [state, setState] = useState({
        fullName: '',
        score: -1 // NOTE: Important that -1 is set otherwise state/Firebase will just update each other
    });

    useEffect(() => {
        let unsubscribe;
        if (user) {
            unsubscribe = databaseRef.child(`gameStates/${user.uid}`)
                .on('value', snapshot => {
                    if (snapshot.val()) {
                        setState(snapshot.val());
                    }
                });
        }
        return () => unsubscribe;
    }, [user]);

    useEffect(() => {
        updateGameStateScore();
    }, [state.score]);

    async function updateGameStateScore() {
        if (state.score > 0) {
            await databaseRef.child(`gameStates/${user.uid}/score`).set(state.score);
        }
    }

    useEffect(() => {
        updateGameStateFullName();
    }, [state.fullName]);

    async function updateGameStateFullName() {
        if (state.fullName) {
            await databaseRef.child(`gameStates/${user.uid}/fullName`).set(state.fullName);
        }
    }

    return (
        <GameContext.Provider
            value={{
                data: state,
                updateIsLoggedIn: (status) => {
                    setState({ ...state, isLoggedIn: status });
                },
                updateFullName: (newName) => {
                    setState({ ...state, fullName: newName });
                },
                updateScore: (newScore) => {
                    setState({ ...state, score: (state.score + newScore) });
                }
            }}
        >
            {props.children}
        </GameContext.Provider>
    );
};