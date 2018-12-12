import * as types from '../actions/actionTypes';

const info = (state = {}, action) => {
  switch (action.type) {
    case types.LOGIN:
      return {...state, admin: action.admin};
    case types.LOGOUT:
      return {...state, admin: false};
    default:
      return state
  }
};

export default info;