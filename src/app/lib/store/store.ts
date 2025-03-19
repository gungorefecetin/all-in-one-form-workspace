import { configureStore, combineReducers } from '@reduxjs/toolkit';
import fileManagerReducer from '@/app/features/fileManager/fileManagerSlice';

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('jotflowState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('jotflowState', serializedState);
  } catch (err) {
    // Handle errors here
  }
};

const rootReducer = combineReducers({
  fileManager: fileManagerReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 