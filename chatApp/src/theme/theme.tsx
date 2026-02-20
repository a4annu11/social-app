import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const theme = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      Primary_Color: '#C42AF5',
      Secondary_Color: '#549BF5',
      Text_Primary_Color: '#fff',
      Text_Secondary_Color: '#ddd',
      Card_Color: '#202c44',
      Input_Bg: '#141828',
      Linear_Gradient_1: '#0D4ABF',
      Linear_Gradient_2: '#6231bd',
      Border_Color: '#FFFFFF80',
      Black_Color: '#000000',
      Colored_Text: '#7b8cff',
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DefaultTheme.colors,
      Primary_Color: '#C42AF5',
      Secondary_Color: '#549BF5',
      Text_Primary_Color: '#fff',
      Text_Secondary_Color: '#ddd',
      Card_Color: '#202c44',
      Input_Bg: '#141828',
      Linear_Gradient_1: '#5698F2',
      Linear_Gradient_2: '#B434EF',
      Border_Color: '#FFFFFF80',
      Black_Color: '#000000',
      Colored_Text: '#7b8cff',
    },
  },
};
