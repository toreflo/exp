import * as types from '../actions/actionTypes';

const info = (state = {
  avatars: {},
  admin: false,
}, action) => {
  switch (action.type) {
    case types.LOGIN:
      return {
        ...state,
        admin: action.admin,
        uid: action.uid,
        name: action.name,
        currentTab: 'BoardNavigator',
      };
    case types.UPDATE_AVATAR:
      return {
        ...state,
        avatars: {
          ...state.avatars,
          [action.uid]: action.uri,
        },
      };
    case types.LOGOUT:
      return {admin: false};
    case types.CHANGE_NAVIGATOR_TAB:
      return {...state, currentTab: action.screen };
    default:
      return state
  }
};

export default info;