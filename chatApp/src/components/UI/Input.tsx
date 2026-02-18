import { useTheme } from '@react-navigation/native';
import { Controller, useController, useFormContext } from 'react-hook-form';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {mobileW, mobileH} from '../../utils/Utils';

// import { CodeField, Cursor } from 'react-native-confirmation-code-field';

export const TextField = ({
  name,
  rules,
  defaultValue,
  LeftIcon,
  returnKeyType,
  RightIcon,
  label,
  placeholder,
  handleRightIconPress,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength = 100,
  refName,
  height = 50,
  inputRefs,
  iconColor,
  isSupport,
  readOnly = false,
  multiline = false,
  numberOfLines = 1,
  onChange = null,
  showCharCount = false,
  backgroundColor,
}: any) => {
  const { colors }: any = useTheme();
  const formContext = useFormContext();
  const {
    formState: { errors, isSubmitted },
  }: any = formContext;

  const { field } = useController({ name, rules, defaultValue });
  const hasError = !!errors[name];

  const handleKeyPress = () => {
    if (refName) {
      inputRefs?.current[refName]?.focus();
    }
  };

  const Styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    label: {
     fontSize: 16,
      color: colors.Text_Primary_Color,
      marginBottom: 6,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: colors.Border_Color,
      borderWidth: 1,
      borderRadius: 15,
      paddingHorizontal: mobileW * 0.04,
      paddingVertical: 2,
      backgroundColor: backgroundColor ? backgroundColor : 'transparent',
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.Text_Primary_Color || '#000',
      height: height,
      paddingVertical: multiline ? 12 : 0,
      textAlignVertical: multiline ? 'top' : 'center',
    },
    iconContainer: {
      marginRight: 8,
    },
    errorText: {
      color: 'red',
      marginLeft: 4,
      paddingBottom: 10,
 fontSize: 12,
    },
    counterText: {
      position: 'absolute',
      bottom: -18,
      right: 6,
      color: colors.Text_Secondary_Color,
      fontSize: 12,
    },
  });

  return (
    <View style={Styles.container}>
      {label && <Text style={Styles.label}>{label}</Text>}

      <View style={Styles.inputContainer}>
        {LeftIcon && (
          <TouchableOpacity activeOpacity={1} style={Styles.iconContainer}>
            <LeftIcon color={colors.Text_Color} />
          </TouchableOpacity>
        )}

        <TextInput
        importantForAutofill='no'
         style={[
    Styles.input,
    secureTextEntry && { color: '#000' },
  ]}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          readOnly={readOnly}
          onSubmitEditing={handleKeyPress}
          ref={ref => {
            field.ref(ref);
            if (inputRefs?.current && name) {
              inputRefs.current[name] = ref;
            }

            // inputRefs.current[name] = ref;
          }}
          returnKeyType={returnKeyType}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          onChangeText={value => {
            field.onChange(value);
            if (onChange) onChange(value);
          }}
          onBlur={field.onBlur}
          value={field.value}
          placeholderTextColor={
            isSupport
              ? colors.Text_Primary_Color
              : colors.Text_Secondary_Color || '#999'
          }
        />

        {RightIcon && (
          <TouchableOpacity
            activeOpacity={1}
            style={Styles.iconContainer}
            onPress={handleRightIconPress}
          >
            <RightIcon color={iconColor || colors.Text_Primary_Color} />
          </TouchableOpacity>
        )}
      </View>

      {/* Show error only after submit */}
      <View style={{ position: 'absolute', bottom: -28, minHeight: 16 }}>
        {isSubmitted && hasError && (
          <Text style={Styles.errorText}>{errors[name]?.message}</Text>
        )}
      </View>

      {/* Character Counter */}
      {showCharCount && (
        <Text style={Styles.counterText}>
          {field.value?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

// for otp
// export const OtpInput = ({
//   digits,
//   control,
//   name,
//   rules,
//   color,
//   borderColor,
//   focusedBorderColor,
//   placeholderTextColor,
//   showError,
// }: any) => {
//   console.log(mobileH * 0.045);
//   const colors: any = useTheme().colors;
//   const styles = StyleSheet.create({
//     cell: {
//       width: mobileH * 0.059,
//       height: mobileH * 0.059,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: borderColor ? borderColor : colors.White_Color,
//       justifyContent: 'center',
//       alignItems: 'center',
//       // marginHorizontal: 5,
//     },
//     focusCell: {
//       borderColor: focusedBorderColor,
//     },
//     cellText: {
//       fontSize: 24,
//       color: color,
//     },
//     errorText: {
//       color: 'red',
//       textAlign: 'center',
//       marginTop: 6,
//     },
//   });

//   return (
//     <Controller
//       control={control}
//       name={name}
//       rules={rules}
//       render={({ field: { onChange, value }, fieldState: { error } }) => (
//         <>
//           <CodeField
//             value={value}
//             onChangeText={onChange}
//             cellCount={digits}
//             keyboardType="number-pad"
//             textContentType="oneTimeCode"
//             renderCell={({ index, symbol, isFocused }) => (
//               <View
//                 key={index}
//                 style={[
//                   styles.cell,
//                   symbol !== '' && {
//                     backgroundColor: 'trasparent',
//                     borderColor: '#39B54F',
//                   },
//                   isFocused && styles.focusCell,
//                   showError && error && { borderColor: 'red' },
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.cellText,
//                     { color: symbol !== '' ? 'Black' : placeholderTextColor },
//                   ]}
//                 >
//                   {symbol !== '' ? symbol : isFocused ? <Cursor /> : ''}
//                 </Text>
//               </View>
//             )}
//           />
//           {showError && error && (
//             <Text style={styles.errorText}>{error.message}</Text>
//           )}
//         </>
//       )}
//     />
//   );
// };
