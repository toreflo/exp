import * as types from '../actions/actionTypes';

const info = (state = {}, action) => {
  switch (action.type) {
    case types.LOGIN:
      return {admin: action.admin, uid: action.uid, name: action.name};
    case types.LOGOUT:
      return {admin: false};
    default:
      return state
  }
};

export default info;