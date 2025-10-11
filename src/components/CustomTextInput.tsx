import React from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';

/**
 * Custom TextInput component that disables font scaling
 * This prevents the input from breaking when users change their device font size
 * Supports ref forwarding for programmatic control
 * 
 * Usage: Replace all <TextInput> with <CustomTextInput> or import this as TextInput
 */
const CustomTextInput = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  return <RNTextInput {...props} ref={ref} allowFontScaling={false} />;
});

CustomTextInput.displayName = 'CustomTextInput';

export default CustomTextInput;
