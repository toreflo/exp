import * as types from './actionTypes';

export const addUser = (user) => ({
  type: types.ADD_USER,
  user,
});

export const delUser = (userKey) => ({
  type: types.DEL_USER,
  userKey,
});

export const logout = () => ({
  type: types.LOGOUT,
});
