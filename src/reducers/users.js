import * as types from '../actions/actionTypes';

const user = (state = {}, action) => {
  switch (action.type) {
    case types.ADD_USER:
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
    case types.ADD_USER:
      return [...state, user(undefined, action)];
    case types.DEL_USER:
      idx = state.findIndex(user => user.key === action.userKey);
      if (idx === -1) return state;
      return [...state.slice(0, idx), ...state.slice(idx + 1)];
    default:
      return state
  }
};

export default users;