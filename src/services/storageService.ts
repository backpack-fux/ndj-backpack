import AsynceStorage from '@react-native-async-storage/async-storage';

export const setItem = (key: string, value: string) => {
  return AsynceStorage.setItem(key, value);
};

export const retrieveItem = (key: string) => {
  return AsynceStorage.getItem(key);
};

export const deleteItem = (key: string) => {
  return AsynceStorage.removeItem(key);
};
