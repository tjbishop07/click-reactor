import { gameSessionRef } from '../config/firebase';
import { FETCH_GAME_SESSIONS } from './types';

export const addReaction = newReaction => async dispatch => {
    newReaction.clicks = 0;
    newReaction.completed = 0;
    gameSessionRef.push().set(newReaction);
};

export const updateGameSession = (gameSession, gameSessionId) => async dispatch => {
    gameSessionRef.child(`/${gameSessionId}`).set(gameSession);
};

export const completeGameSession = (gameSessionId) => async dispatch => {
    gameSessionRef.child(gameSessionId).remove();
};

export const fetchGameSessions = () => async dispatch => {
    gameSessionRef.on("value", snapshot => {
        dispatch({
            type: FETCH_GAME_SESSIONS,
            payload: snapshot.val()
        });
    });
};