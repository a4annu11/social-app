import { Dimensions, Platform } from 'react-native';

import { PixelRatio } from 'react-native';
const { width, height } = Dimensions.get('window');

const mobileW = Dimensions.get('window').width;
const mobileH = Dimensions.get('window').height;
const screenHeight = Dimensions.get('screen').height;

export const isLandscape = width > height;

export { mobileH, mobileW, screenHeight };
