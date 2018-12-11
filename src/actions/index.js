import * as types from './actionTypes';

export const userAdded = (user) => ({
  type: types.USER_ADDED,
  user,
});

export const userChanged = (user) => ({
  type: types.USER_CHANGED,
  user,
});

export const userRemoved = (userKey) => ({
  type: types.USER_REMOVED,
  userKey,
});

export const groupAdded = (group) => ({
  type: types.GROUP_ADDED,
  group,
});

export const groupChanged = (group) => ({
  type: types.GROUP_CHANGED,
  group,
});

export const groupRemoved = (groupKey) => ({
  type: types.GROUP_REMOVED,
  groupKey,
});

export const boardMessageAdded = (boardMessage) => ({
  type: types.BOARD_MESSAGE_ADDED,
  boardMessage,
});

export const boardMessageChanged = (boardMessage) => ({
  type: types.BOARD_MESSAGE_CHANGED,
  boardMessage,
});

export const boardMessageRemoved = (boardMessageKey) => ({
  type: types.BOARD_MESSAGE_REMOVED,
  boardMessageKey,
});


export const logout = () => ({
  type: types.LOGOUT,
});
