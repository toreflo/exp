import * as types from '../actions/actionTypes';

const user = (state = {}, action) => {
  switch (action.type) {
    case types.USER_ADDED:
    case types.USER_CHANGED:
      return {...action.user};
    default:
      return state
  }
};

const users = (state = [], action) => {
  let idx;
  switch (action.type) {
    case types.LOGOUT:
      return [];
    case types.USER_ADDED:
      return [...state, user(undefined, action)];
    case types.USER_CHANGED:
      idx = state.findIndex(user => user.key === action.user.key);
      if (idx === -1) return [...state, user(undefined, action)];
      return [...state.slice(0, idx), user(undefined, action), ...state.slice(idx + 1)];
    case types.USER_REMOVED:
      idx = state.findIndex(user => user.key === action.userKey);
      if (idx === -1) return state;
      return [...state.slice(0, idx), ...state.slice(idx + 1)];
    default:
      return state
  }
};

export default users;