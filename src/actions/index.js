import { gameSessionRef } from '../config/firebase';
import { FETCH_GAME_SESSIONS } from './types';

export const addGameSession = newGameSession => async dispatch => {
    newGameSession.clicks = 0;
    newGameSession.completed = 0;
    gameSessionRef.push().set(newGameSession);
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