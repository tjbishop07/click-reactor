import { FETCH_GAME_SESSIONS } from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_GAME_SESSIONS:
      return action.payload;
    default:
      return state;
  }
};