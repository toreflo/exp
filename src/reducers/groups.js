import * as types from '../actions/actionTypes';

const group = (state = {}, action) => {
  let newState;
  switch (action.type) {
    case types.GROUP_ADDED:
      return {...action.group, unread: 0};
    case types.GROUP_CHANGED:
      newState = {
        ...state,
        ...action.group,
      };
      if (newState.unread === undefined) newState.unread = 0;
      return newState;
    case types.UPDATE_UNREAD_MESSAGES:
      return {...state, unread: action.count}
    default:
      return state
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
    case types.UPDATE_UNREAD_MESSAGES:
      idx = state.findIndex(group => group.key === action.groupKey);
      if (idx === -1) return state;
      return [...state.slice(0, idx), group(state[idx], action), ...state.slice(idx + 1)];
    default:
      return state
  }
};

export default groups;