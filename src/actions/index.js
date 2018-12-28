import * as types from './actionTypes';

const calcUnreadMessages = (state, groupKey, newMessage, newLastMessageRead) => {
  // console.log('0)', 'state', groupKey, newMessage, newLastMessageRead)
  const { users, groups, groupMessages, info } = state;
  if (info.admin || !users || !groups || !groupMessages) return undefined;

  const user = users.find(u => u.key === info.uid);
  const messages = groupMessages[groupKey];
  if (!user || (!messages && !newMessage)) return undefined;
  const lastMessageRead = ((newLastMessageRead !== undefined) ?
                          newLastMessageRead : 
                          user.groups[groupKey].lastMessageRead);
  // console.log('1)', lastMessageRead, user.groups[groupKey])
  let cnt = 0;

  if (messages) {
    cnt = messages.reduce((count, message) => {
      // console.log('2)', groupKey, message.createdAt, lastMessageRead, message.text)
      if (message.createdAt > lastMessageRead) return count + 1;
      return count;
    }, 0);
  }
  if (newMessage && (newMessage.createdAt > lastMessageRead)) cnt++;
  return cnt;
}

export const userAdded = (user) => ({
  type: types.USER_ADDED,
  user,
});

export const userChanged = (user) => (dispatch, getState) => {
  if (user.groups) {
    Object.keys(user.groups).forEach((groupKey) => {
      /* if (!getState().info.admin) {
        console.log('+++++++++++++++++++++++++++++++++++++++++++')
        console.log(groupKey, user.groups[groupKey].lastMessageRead)  
      } */
      const count = calcUnreadMessages(
        getState(),
        groupKey,
        undefined,
        user.groups[groupKey].lastMessageRead,
      );
      /* if (!getState().info.admin) {
        console.log('-------------------------------------------')
        console.log(count)  
      } */
      if (count !== undefined) {
        dispatch(updateUnreadMessages(
          groupKey,
          count,
        ));
      }
    });
  }
  dispatch(userChangedRaw(user));
}

export const userChangedRaw = (user) => ({
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

export const groupMessageAdded = (groupMessage) => (dispatch, getState) => {
  const count = calcUnreadMessages(
    getState(),
    groupMessage.groupKey,
    groupMessage.message,
  );
  if (count !== undefined) {
    dispatch(updateUnreadMessages(
      groupMessage.groupKey,
      count,
    ));
  }
  dispatch(groupMessageAddedRaw(groupMessage));
};

export const groupMessageAddedRaw = (groupMessage) => ({
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

export const updateUnreadMessages = (groupKey, count) => ({
  type: types.UPDATE_UNREAD_MESSAGES,
  groupKey,
  count,
});
