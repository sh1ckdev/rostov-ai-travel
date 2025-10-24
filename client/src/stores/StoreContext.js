import React from 'react';
import RootStore from './RootStore';

const rootStore = new RootStore();
export const StoreContext = React.createContext(rootStore);

export const useStore = () => {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error('useStore должен использоваться внутри StoreProvider');
  }
  return store;
};

export const StoreProvider = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};
