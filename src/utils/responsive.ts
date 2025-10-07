import { Dimensions, PixelRatio } from 'react-native';

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Width percentage to pixel
 * Usage: wp('50%') returns 50% of screen width in pixels
 */
export const wp = (widthPercent: string | number): number => {
  const percent = typeof widthPercent === 'string' 
    ? parseFloat(widthPercent.replace('%', '')) 
    : widthPercent;
  const elemWidth = (percent * SCREEN_WIDTH) / 100;
  return Math.round(elemWidth);
};

/**
 * Height percentage to pixel
 * Usage: hp('50%') returns 50% of screen height in pixels
 */
export const hp = (heightPercent: string | number): number => {
  const percent = typeof heightPercent === 'string' 
    ? parseFloat(heightPercent.replace('%', '')) 
    : heightPercent;
  const elemHeight = (percent * SCREEN_HEIGHT) / 100;
  return Math.round(elemHeight);
};

/**
 * Scale size based on width
 * Best for width/margin/padding
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / guidelineBaseWidth) * size;
};

/**
 * Scale size based on height
 * Best for height/line-height
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / guidelineBaseHeight) * size;
};

/**
 * Moderate scale - balances between scale and verticalScale
 * Best for font sizes
 * @param size - base size
 * @param factor - scaling factor (default: 0.5)
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Font size scaler - ensures readable text on all devices
 */
export const fontSize = (size: number): number => {
  return moderateScale(size, 0.3);
};

/**
 * Spacing scaler - for consistent margins and paddings
 */
export const spacing = (size: number): number => {
  return moderateScale(size, 0.4);
};

/**
 * Get device type based on screen size
 */
export const getDeviceType = (): 'small' | 'medium' | 'large' => {
  if (SCREEN_WIDTH < 375) return 'small';
  if (SCREEN_WIDTH < 414) return 'medium';
  return 'large';
};

/**
 * Normalize size based on pixel density
 */
export const normalize = (size: number): number => {
  const pixelRatio = PixelRatio.get();
  const deviceType = getDeviceType();
  
  if (deviceType === 'small') {
    return size * 0.9;
  } else if (deviceType === 'large') {
    return size * 1.1;
  }
  return size;
};

// Export screen dimensions for convenience
export const DEVICE = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
};

// Helper for inline calculations
const getModerateScale = (size: number, factor: number = 0.5): number => {
  const scaleValue = (SCREEN_WIDTH / guidelineBaseWidth) * size;
  return size + (scaleValue - size) * factor;
};

// Common spacing values - calculated directly
export const SPACING = {
  xs: getModerateScale(4, 0.4),
  sm: getModerateScale(8, 0.4),
  md: getModerateScale(12, 0.4),
  lg: getModerateScale(16, 0.4),
  xl: getModerateScale(20, 0.4),
  xxl: getModerateScale(24, 0.4),
  xxxl: getModerateScale(32, 0.4),
};

// Common font sizes - calculated directly
export const FONT_SIZES = {
  xs: getModerateScale(10, 0.3),
  sm: getModerateScale(12, 0.3),
  md: getModerateScale(14, 0.3),
  lg: getModerateScale(16, 0.3),
  xl: getModerateScale(18, 0.3),
  xxl: getModerateScale(20, 0.3),
  xxxl: getModerateScale(24, 0.3),
  heading: getModerateScale(28, 0.3),
  title: getModerateScale(32, 0.3),
  display: getModerateScale(42, 0.3),
};
