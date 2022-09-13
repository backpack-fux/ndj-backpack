import {BaseScreen} from '@app/components';
import {useWalletConnect} from '@app/context/walletconnect';
import {StackParams} from '@app/models';
import {getDeepLink} from '@app/utils';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {t} from 'react-native-tailwindcss';
import WebView from 'react-native-webview';

export const WebviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<StackParams, 'Webwiew'>>();
  const {onOpenDeepLink} = useWalletConnect();

  const {url, title} = route.params;

  const setTitle = useCallback(() => {
    let siteTitle = title;
    if (!siteTitle) {
      try {
        const domain = new URL(url);
        siteTitle = domain.hostname;
      } catch (err) {
        //
      }
    }

    if (!siteTitle) {
      return;
    }

    navigation.setOptions({
      title,
      headerTitle: title,
    });
  }, [url, title, navigation]);

  useEffect(() => {
    setTitle();
  }, [setTitle]);

  const openExternalLink = (event: any) => {
    const deepLink = getDeepLink(event.url);

    if (deepLink) {
      onOpenDeepLink(event.url);
      return false;
    }

    return true;
  };

  return (
    <BaseScreen noBottom noPadding>
      <WebView
        source={{uri: url}}
        style={[t.bgTransparent]}
        onShouldStartLoadWithRequest={openExternalLink}
      />
    </BaseScreen>
  );
};
