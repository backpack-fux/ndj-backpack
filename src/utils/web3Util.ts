import * as _ from 'lodash';
//@ts-ignore
import bip39 from 'react-native-bip39';

export const generateMnemonicPhrase = async (): Promise<string> => {
  const mnemonicString: string = await bip39.generateMnemonic(128);
  const words = mnemonicString.split(' ');
  if (words.length !== _.uniq(words).length) {
    return generateMnemonicPhrase();
  }

  return mnemonicString;
};
