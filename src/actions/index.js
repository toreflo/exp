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

export const imageAdded = (groupKey, imageKey, imageUri) => ({
  type: types.IMAGE_ADDED,
  groupKey,
  imageKey,
  imageUri,
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

export const groupMessageAdded = (groupMessage) => ({
  type: types.GROUP_MESSAGE_ADDED,
  groupKey: groupMessage.groupKey,
  message: groupMessage.message,
});

export const groupMessageRemoved = (groupMessage) => ({
  type: types.GROUP_MESSAGE_REMOVED,
  groupKey: groupMessage.groupKey,
  messageKey: groupMessage.messageKey,
});

export const groupMessageUnsubscribed = (groupKey) => ({
  type: types.GROUP_UNSUBSCRIBED,
  groupKey,
});


export const logout = () => ({
  type: types.LOGOUT,
});

export const login = (admin, uid, name) => ({
  type: types.LOGIN,
  uid,
  admin,
  name,
});

export const updateAvatar = (uid, uri) => ({
  type: types.UPDATE_AVATAR,
  uid,
  uri,
});

export const updateGroupAvatar = (groupKey, uri) => ({
  type: types.UPDATE_GROUP_AVATAR,
  groupKey,
  uri,
});

export const updateUnreadMessages = (groupKey, count) => ({
  type: types.UPDATE_UNREAD_MESSAGES,
  groupKey,
  count,
});

export const changeNavigatorTab = (screen) => ({
  type: types.CHANGE_NAVIGATOR_TAB,
  screen,
});
