import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

/**
 * Custom Text component that disables font scaling
 * This prevents the UI from breaking when users change their device font size
 * 
 * Usage: Replace all <Text> with <CustomText> or import this as Text
 */
const CustomText: React.FC<TextProps> = (props) => {
  return <RNText {...props} allowFontScaling={false} />;
};

export default CustomText;
