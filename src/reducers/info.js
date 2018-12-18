import * as types from '../actions/actionTypes';

const info = (state = {}, action) => {
  switch (action.type) {
    case types.LOGIN:
      return {...state, admin: action.admin, uid: action.uid, name: action.name};
    case types.SET_AVATAR:
      return {...state, avatarUrl: action.url};
    case types.LOGOUT:
      return {admin: false};
    default:
      return state
  }
};

export default info;