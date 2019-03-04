import * as types from '../actions/actionTypes';

const group = (state = {}, action) => {
  switch (action.type) {
    case types.GROUP_ADDED:
      return {...action.group};
    case types.GROUP_CHANGED:
      return {...action.group, avatar: state.avatar};
    case types.UPDATE_GROUP_AVATAR:
      return {...state, avatar: action.uri};
    default:
      return state;
  }
};

const groups = (state = [], action) => {
  let idx;
  switch (action.type) {
    case types.LOGOUT:
      return [];
    case types.GROUP_ADDED:
      return [...state, group(undefined, action)];
    case types.GROUP_CHANGED:
      idx = state.findIndex(group => group.key === action.group.key);
      if (idx === -1) return [...state, group(undefined, action)];
      return [...state.slice(0, idx), group(state[idx], action), ...state.slice(idx + 1)];
    case types.GROUP_REMOVED:
      idx = state.findIndex(group => group.key === action.groupKey);
      if (idx === -1) return state;
      return [...state.slice(0, idx), ...state.slice(idx + 1)];
    case types.UPDATE_GROUP_AVATAR:
      idx = state.findIndex(group => group.key === action.groupKey);
      if (idx === -1) return state;
      return [...state.slice(0, idx), group(state[idx], action), ...state.slice(idx + 1)];
    default:
      return state
  }
};

export default groups;