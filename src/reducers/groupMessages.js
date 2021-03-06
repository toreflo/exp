import * as types from '../actions/actionTypes';

const sortMessages = (a, b) => {
  return (a.createdAt - b.createdAt);
}

const message = (state = {}, action) => {
  switch (action.type) {
    case types.GROUP_MESSAGE_ADDED:
      return {...action.message};
    default:
      return state
  }
};

const messages = (state = [], action) => {
  let idx;
  switch (action.type) {
    case types.LOGOUT:
      return [];
    case types.GROUP_MESSAGE_ADDED:
      idx = state.findIndex(message => message.key === action.message.key);
      if (idx === -1) return [...state, message(undefined, action)].sort(sortMessages);
      return [...state.slice(0, idx), message(undefined, action), ...state.slice(idx + 1)].sort(sortMessages);
    case types.GROUP_MESSAGE_REMOVED:
      idx = state.findIndex(message => message.key === action.messageKey);
      if (idx === -1) return state;
      return [...state.slice(0, idx), ...state.slice(idx + 1)];
    default:
      return state
  }
};

const groupMessages = (state = {}, action) => {
  let newState;
  switch (action.type) {
    case types.LOGOUT:
      return {};
    case types.GROUP_MESSAGE_ADDED:
    case types.GROUP_MESSAGE_REMOVED:
      return {...state, [action.groupKey]: messages(state[action.groupKey], action)};
    case types.GROUP_UNSUBSCRIBED:
      if (!state[action.groupKey]) return state;
      
      newState = {...state};
      delete newState[action.groupKey];
      return newState;
    default:
      return state
  }
};

export default groupMessages;