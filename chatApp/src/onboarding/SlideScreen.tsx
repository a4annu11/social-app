// import React, { useRef, useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   ImageBackground,
//   Text,
//   StatusBar,
//   Animated,
//   Image,
// } from 'react-native';
// import AppIntroSlider from 'react-native-app-intro-slider';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useTheme } from '@react-navigation/native';
// import { useAppDispatch } from '../redux/hooks';
// import { setFirstLaunch } from '../redux/slice/authSlice';
// import { typography } from '../theme/typography';
// import { mobileH, mobileW } from '../utils/Utils';
// import { constant } from '../../assets/local';
// import { LocalMedia } from '../utils/LocalMedia';
// import { LogoIcon } from '../utils/Icons';
// import { Button } from '../components/UI/Button';

// const AUTO_PLAY_DURATION = 6000;

// const SlideScreen = ({ navigation }: any) => {
//   const sliderRef = useRef<any>(null);
//   const colors: any = useTheme()?.colors;
//   const dispatch = useAppDispatch();
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(
//     null,
//   );

//   const slides = [
//     {
//       key: 1,
//       title: constant.SPLASH.SLIDER_TITLE_1,
//       text: constant.SPLASH.DESCRIPTION1,
//     },
//     {
//       key: 2,
//       title: constant.SPLASH.SLIDER_TITLE_2,
//       text: constant.SPLASH.DESCRIPTION2,
//     },
//     {
//       key: 3,
//       title: constant.SPLASH.SLIDER_TITLE_3,
//       text: constant.SPLASH.DESCRIPTION3,
//     },
//   ];

//   // Animated progress per slide
//   const progressAnimations = useRef(
//     slides.map(() => new Animated.Value(0)),
//   ).current;

//   const animateProgress = useCallback(
//     (index: number) => {
//       Animated.timing(progressAnimations[index], {
//         toValue: 1,
//         duration: AUTO_PLAY_DURATION,
//         useNativeDriver: false,
//       }).start();
//     },
//     [progressAnimations],
//   );

//   const resetProgress = useCallback(
//     (index: number) => {
//       progressAnimations[index]?.setValue(0);
//     },
//     [progressAnimations],
//   );

//   const clearAutoPlay = useCallback(() => {
//     if (autoPlayTimer) {
//       clearInterval(autoPlayTimer);
//       setAutoPlayTimer(null);
//     }
//   }, [autoPlayTimer]);

//   const startAutoPlay = useCallback(
//     (startIndex: number) => {
//       clearAutoPlay();
//       animateProgress(startIndex);
//       const timer = setInterval(() => {
//         setCurrentSlide(prev => {
//           const next = prev + 1;
//           if (next < slides.length) {
//             sliderRef.current?.goToSlide(next, true);
//             resetProgress(next);
//             animateProgress(next);
//             return next;
//           } else {
//             clearAutoPlay();
//             return prev;
//           }
//         });
//       }, AUTO_PLAY_DURATION);
//       setAutoPlayTimer(timer);
//     },
//     [slides.length, animateProgress, resetProgress, clearAutoPlay],
//   );

//   useEffect(() => {
//     startAutoPlay(0);
//     return () => clearAutoPlay();
//   }, []);

//   const onDone = async () => {
//     try {
//       await AsyncStorage.setItem('appLaunched', 'true');
//       dispatch(setFirstLaunch(false));
//     } catch (err) {
//       console.error('AsyncStorage error:', err);
//     }
//   };

//   const onPrivacy = () => navigation.navigate('PrivacyPolicy');

//   const _renderPagination = (activeIndex: number) => {
//     return (
//       <>
//         {/* Dots */}
//         <View
//           style={{
//             position: 'absolute',
//             bottom: mobileH * 0.15,
//             left: 0,
//             right: 0,
//             flexDirection: 'row',
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}
//         >
//           {slides.map((_, i) => {
//             const isActive = i === activeIndex;
//             return (
//               <View
//                 key={i}
//                 style={{
//                   height: 8,
//                   width: 8,
//                   borderRadius: 4,
//                   marginHorizontal: 4,
//                   backgroundColor: isActive
//                     ? colors.Secondary_Color
//                     : colors.White_Color,
//                 }}
//               />
//             );
//           })}
//         </View>

//         {/* Button */}
//         <View
//           style={{
//             position: 'absolute',
//             bottom: mobileH * 0.065,
//             left: 0,
//             right: 0,
//             alignItems: 'center',
//             justifyContent: 'center',
//             paddingHorizontal: mobileW * 0.0389,
//           }}
//         >
//           <Button title={'Get Started'} onPress={onDone} />
//         </View>
//       </>
//     );
//   };

//   const _renderItem = ({ item, index }: any) => {
//     const header = (
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginTop: mobileH * 0.01,
//         }}
//       >
//         <LogoIcon />
//         <View style={{ flexDirection: 'row', gap: 12 }}>
//           <Text
//             style={{
//               color: colors.White_Color,
//               ...typography.Arial_Bold12,
//             }}
//             onPress={onPrivacy}
//           >
//             PRIVACY
//           </Text>
//           <Text
//             style={{
//               color: colors.White_Color,
//               ...typography.Arial_Bold12,
//             }}
//             onPress={onDone}
//           >
//             SIGN IN
//           </Text>
//         </View>
//       </View>
//     );

//     return (
//       <View style={{ backgroundColor: colors.Background_Color, flex: 1 }}>
//         {index === 0 ? (
//           <ImageBackground
//             resizeMode="cover"
//             source={LocalMedia.slide1}
//             style={{ flex: 1 }}
//           >
//             <SafeAreaView
//               style={{ flex: 1, marginHorizontal: mobileW * 0.045 }}
//             >
//               {header}
//               <View
//                 style={{
//                   position: 'absolute',
//                   bottom: mobileH * 0.3,
//                   left: 0,
//                   right: 0,
//                   alignItems: 'center',
//                 }}
//               >
//                 <Text
//                   style={{
//                     ...typography.Arial_Bold36,
//                     color: colors.White_Color,
//                     textAlign: 'center',
//                     marginBottom: 11,
//                     width: '80%',
//                   }}
//                 >
//                   {item?.title}
//                 </Text>
//                 <Text
//                   style={{
//                     ...typography.Arial_Regular18,
//                     color: colors.White_Color,
//                     textAlign: 'center',
//                     lineHeight: 24,
//                   }}
//                 >
//                   {item?.text}
//                 </Text>
//               </View>
//             </SafeAreaView>
//           </ImageBackground>
//         ) : (
//           <SafeAreaView style={{ flex: 1, marginHorizontal: mobileW * 0.045 }}>
//             {header}
//             <View
//               style={{
//                 flex: 1,
//                 alignItems: 'center',
//                 marginBottom: 20,
//               }}
//             >
//               <View
//                 style={{
//                   borderRadius: 20,
//                   height: '40%',
//                   width: '80%',
//                   marginVertical: 30,
//                 }}
//               >
//                 <Image
//                   source={index === 1 ? LocalMedia.slide2 : LocalMedia.slide3}
//                   style={{ height: '100%', width: '100%' }}
//                 />
//               </View>

//               <View style={{ width: '80%', alignItems: 'center' }}>
//                 <Text
//                   style={{
//                     ...typography.Arial_Bold36,
//                     color: colors.White_Color,
//                     textAlign: 'center',
//                     marginBottom: 11,
//                     width: '90%',
//                   }}
//                 >
//                   {item?.title}
//                 </Text>
//                 <Text
//                   style={{
//                     ...typography.Arial_Regular18,
//                     color: colors.White_Color,
//                     textAlign: 'center',
//                     lineHeight: 24,
//                   }}
//                 >
//                   {item?.text}
//                 </Text>
//               </View>
//             </View>
//           </SafeAreaView>
//         )}
//       </View>
//     );
//   };

//   return (
//     <>
//       <StatusBar
//         translucent
//         barStyle="light-content"
//         backgroundColor="transparent"
//       />
//       <AppIntroSlider
//         ref={sliderRef}
//         data={slides}
//         renderItem={_renderItem}
//         renderPagination={_renderPagination}
//         showDoneButton={false}
//         showNextButton={false}
//         onSlideChange={(index: number) => {
//           setCurrentSlide(index);
//           resetProgress(index);
//           animateProgress(index);
//         }}
//       />
//     </>
//   );
// };

// export default SlideScreen;
