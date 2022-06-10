import {useEffect, useState} from 'react';
import {Linking} from 'react-native';

export function useDeepLinkURL() {
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      setDeepLinkUrl(initialUrl);
    };
    getUrlAsync().then(_ => {});
  }, []);

  useEffect(() => {
    const callback = ({url}: {url: string}) => setDeepLinkUrl(url);
    Linking.addEventListener('url', callback);
    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  const resetURL = () => setDeepLinkUrl(null);
  return {linkedURL: deepLinkUrl, resetURL};
}
