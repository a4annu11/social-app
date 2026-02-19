import { useTheme } from '@react-navigation/native';
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { typography } from '../../theme';

export const GradientButton = ({
  title,
  onPress,
  width = '100%',
  height = 50,
  borderRadius = 40,
  style,
  textStyle,
  disabled = false,
  LeftIcon,
  iconColor = '#fff',
  smallButton = false,
  loading = false,
  isSubmitting = false,
}: any) => {
  const colors: any = useTheme().colors;
  const gradientColors = [colors.Linear_Gradient_2, colors.Linear_Gradient_1];

  const styles = StyleSheet.create({
    buttonContainer: {
      width,
      height,
      borderRadius,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading || isSubmitting}
      style={[styles.buttonContainer, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius }]}
      >
        {loading || isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <View style={styles.content}>
            {LeftIcon && <LeftIcon color={iconColor} size={22} />}
            <Text
              style={[
                smallButton
                  ? typography.Montserrat_Bold14
                  : typography.Montserrat_Bold18,
                { color: colors.Text_Primary_Color },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export const OutLineButton = ({
  title,
  onPress,
  width = '100%',
  height = 50,
  borderRadius = 40,
  style,
  textStyle,
  disabled = false,
  LeftIcon,
  iconColor = '#fff',
  smallButton = false,
  loading = false,
}: any) => {
  const colors: any = useTheme().colors;

  const styles = StyleSheet.create({
    buttonContainer: {
      width,
      height,
      borderRadius,
      overflow: 'hidden',
      borderWidth: 1,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: colors.Text_Primary_Color,
    },
    gradient: {
      flex: 1,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={[styles.buttonContainer, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <View style={styles.content}>
          {LeftIcon && <LeftIcon color={iconColor} size={22} />}
          <Text
            style={[
              smallButton
                ? typography.Montserrat_Bold14
                : typography.Montserrat_Bold18,
              { color: colors.Text_Primary_Color },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const SocialButton = ({
  title,
  onPress,
  width = '100%',
  height = 50,
  borderRadius = 40,
  style,
  textStyle,
  disabled = false,
  LeftIcon,
  iconColor = '#fff',
}: any) => {
  const colors: any = useTheme().colors;

  const styles = StyleSheet.create({
    buttonContainer: {
      width,
      height,
      borderRadius,
      overflow: 'hidden',
      backgroundColor: colors.Text_Primary_Color,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: colors.Text_Primary_Color,
    },
    gradient: {
      flex: 1,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
      style={[styles.buttonContainer, style]}
    >
      <View style={styles.content}>
        {LeftIcon && <LeftIcon color={iconColor} size={22} />}
        <Text
          style={[
            typography.Montserrat_Medium14,
            { color: colors.Black_Color },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// export const GradientCircularButton = ({
//   onPress,
//   width = 55,
//   height = 55,
//   borderRadius = 55 / 2,
//   style,
//   iconColor = '#fff',
// }: any) => {
//   const colors: any = useTheme().colors;
//   const gradientColors = [colors.Linear_Gradient_2, colors.Linear_Gradient_1];

//   const styles = StyleSheet.create({
//     buttonContainer: {
//       width,
//       height,
//       borderRadius,
//       overflow: 'hidden',
//       ...Platform.select({
//         ios: {
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 6 },
//           shadowOpacity: 0.25,
//           shadowRadius: 8,
//         },
//         android: {
//           elevation: 8,
//         },
//       }),
//     },
//     gradient: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     content: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       gap: 8,
//     },
//   });

//   return (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       onPress={onPress}
//       style={[styles.buttonContainer, style]}
//     >
//       <LinearGradient
//         colors={gradientColors}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={[styles.gradient, { borderRadius }]}
//       >
//         <View style={styles.content}>
//           <PlusIcon height={20} width={20} />
//         </View>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// };
