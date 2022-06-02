import React from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Text,
  View,
} from 'react-native';
import {t} from 'react-native-tailwindcss';
import {Paragraph} from './text';
const logo = require('@app/assets/images/logo.png');
const background = require('@app/assets/images/bg.png');

const {width} = Dimensions.get('screen');

export const SnapshotModal = ({show}: {show: boolean}) => {
  return (
    <Modal visible={show} animationType="fade">
      <ImageBackground source={background} style={[t.flex1, t.bgPurple500]}>
        <Paragraph
          marginTop={30}
          marginBottom={20}
          text="NDJ Backpack"
          font="Montserrat"
          align="center"
          type="bold"
        />
        <View style={[t.flex1, t.itemsCenter, t.justifyCenter]}>
          <Image
            source={logo}
            style={[{width: width * 0.8, height: width * 0.8}]}
            resizeMode="contain"
          />
          <Text style={[t.text4xl, t.mT4, t.textWhite, t.fontMono]}>
            New Dao Jones
          </Text>
        </View>
      </ImageBackground>
    </Modal>
  );
};
