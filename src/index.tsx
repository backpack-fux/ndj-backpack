import '../shim'; // force import

import React from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {StatusBar, LogBox, ImageBackground} from 'react-native';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import 'text-encoding';
import 'react-native-url-polyfill/auto';

import store, {persistor} from '@app/store';
import {NavigationService} from '@app/services';
import {colors} from './assets/colors.config';
import {WalletConnectProvider} from './context/walletconnect';
import {KeychainProvider} from './context/keychain';
import {t} from 'react-native-tailwindcss';
import {RootStackNavigator} from './navigation/RootStackNavigator';
const background = require('@app/assets/images/bg.png');

LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const App = () => {
  const routeNameRef = React.useRef<string>();
  React.useEffect(() => {
    return () => {
      NavigationService.isReadyRef.current = false;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <GestureHandlerRootView style={[t.wFull, t.hFull]}>
            <ImageBackground
              source={background}
              style={[t.flex1, t.bgPurple500]}>
              <NavigationContainer
                ref={NavigationService.navigationRef}
                onReady={() => {
                  NavigationService.isReadyRef.current = true;
                }}
                theme={{
                  ...DefaultTheme,
                  colors: {
                    ...DefaultTheme.colors,
                    background: colors.transparent,
                  },
                }}
                onStateChange={async () => {
                  const previousRouteName = routeNameRef.current;
                  const currentRouteName =
                    NavigationService.navigationRef?.current?.getCurrentRoute()
                      ?.name;
                  if (previousRouteName !== currentRouteName) {
                  }
                  routeNameRef.current = currentRouteName;
                }}>
                <WalletConnectProvider>
                  <KeychainProvider>
                    <RootStackNavigator />
                  </KeychainProvider>
                </WalletConnectProvider>
              </NavigationContainer>
            </ImageBackground>
          </GestureHandlerRootView>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
