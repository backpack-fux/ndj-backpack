import {SnapshotModal} from '@app/components';
import {appReadySelector} from '@app/store/wallets/walletsSelector';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {AppState, AppStateStatus, Dimensions} from 'react-native';
import {useSelector} from 'react-redux';
export interface SnapshotContextProps {}

export const SnapshotContext = createContext<SnapshotContextProps>({});

export const useSnapshot = () => {
  const context = useContext(SnapshotContext);

  return context;
};

const showSecurityScreenFromAppState = (appState: AppStateStatus) =>
  ['background', 'inactive'].includes(appState);

export const SnapshotProvider = (props: {
  children: React.ReactChild[] | React.ReactChild;
}) => {
  const [showSecurityScreen, setShowSecurityScreen] = useState(true);
  const appReady = useSelector(appReadySelector);

  const onChangeAppStatus = (appState: AppStateStatus) => {
    const state = showSecurityScreenFromAppState(appState);

    setShowSecurityScreen(state);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', onChangeAppStatus);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (appReady) {
      setTimeout(() => {
        setShowSecurityScreen(false);
      }, 2000);
    }
  }, [appReady]);

  return (
    <SnapshotContext.Provider value={{}}>
      {props.children}
      <SnapshotModal show={showSecurityScreen} />
    </SnapshotContext.Provider>
  );
};
