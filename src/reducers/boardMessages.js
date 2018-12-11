import * as types from '../actions/actionTypes';

const boardMessage = (state = {}, action) => {
  switch (action.type) {
    case types.BOARD_MESSAGE_ADDED:
    case types.BOARD_MESSAGE_CHANGED:
      return {...action.boardMessage};
    default:
      return state
  }
};

const boardMessages = (state = [], action) => {
  let idx;
  switch (action.type) {
    case types.LOGOUT:
      return [];
    case types.BOARD_MESSAGE_ADDED:
      return [...state, boardMessage(undefined, action)];
    case types.BOARD_MESSAGE_CHANGED:
      idx = state.findIndex(boardMessage => boardMessage.key === action.boardMessage.key);
      if (idx === -1) return state;
      return [...state.slice(0, idx), boardMessage(undefined, action), ...state.slice(idx + 1)];
    case types.BOARD_MESSAGE_REMOVED:
      idx = state.findIndex(boardMessage => boardMessage.key === action.boardMessageKey);
      if (idx === -1) return state;
      return [...state.slice(0, idx), ...state.slice(idx + 1)];
    default:
      return state
  }
};

export default boardMessages;