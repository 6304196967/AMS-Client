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
  // For very small devices (< 365px), use reduced scaling
  if (SCREEN_WIDTH < 365) {
    const ratio = SCREEN_WIDTH / 390; // Scale relative to 390px baseline
    const minScale = size * ratio;
    return Math.max(minScale, size * 0.85); // Limit downscaling to 85% of base
  }
  // For devices 365-375px, use slightly reduced size
  if (SCREEN_WIDTH < 375) {
    return size * 0.95; // 95% of base size
  }
  return size + (scale(size) - size) * factor;
};

/**
 * Font size scaler - ensures readable text on all devices
 */
export const fontSize = (size: number): number => {
  // For very small devices (< 365px), scale down to fit
  if (SCREEN_WIDTH < 365) {
    const ratio = SCREEN_WIDTH / 390; // Scale relative to 390px
    const scaled = size * Math.max(ratio, 0.80); // Max 20% reduction
    return scaled;
  }
  // For devices 365-375px, use slightly reduced size
  if (SCREEN_WIDTH < 375) {
    const scaled = size * 0.88; // 12% reduction (increased from 8%)
    return scaled;
  }
  const result = moderateScale(size, 0.3);
  return result;
};

/**
 * Spacing scaler - for consistent margins and paddings
 */
export const spacing = (size: number): number => {
  // For very small devices (< 365px), scale down more aggressively
  if (SCREEN_WIDTH < 365) {
    const ratio = SCREEN_WIDTH / 390;
    const scaled = size * Math.max(ratio, 0.78); // Max 22% reduction for spacing
    return scaled;
  }
  // For devices 365-375px, use reduced size
  if (SCREEN_WIDTH < 375) {
    const scaled = size * 0.82; // 18% reduction (increased from 12%)
    return scaled;
  }
  const result = moderateScale(size, 0.4);
  return result;
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
  // For very small devices (< 365px), use reduced scaling
  if (SCREEN_WIDTH < 365) {
    const ratio = SCREEN_WIDTH / 390;
    const scaled = size * Math.max(ratio, 0.82); // Max 18% reduction
    return scaled;
  }
  // For devices 365-375px, use slightly reduced size
  if (SCREEN_WIDTH < 375) {
    const scaled = size * 0.85; // 15% reduction (increased from 10%)
    return scaled;
  }
  const result = size + (scaleValue - size) * factor;
  return result;
};

// Common spacing values - calculated directly with optimized spacing
export const SPACING = {
  xs: getModerateScale(3, 0.4),   // Reduced from 4
  sm: getModerateScale(6, 0.4),   // Reduced from 8
  md: getModerateScale(10, 0.4),  // Reduced from 12
  lg: getModerateScale(14, 0.4),  // Reduced from 16
  xl: getModerateScale(18, 0.4),  // Reduced from 20
  xxl: getModerateScale(22, 0.4), // Reduced from 24
  xxxl: getModerateScale(28, 0.4), // Reduced from 32
};


// Common font sizes - calculated directly with reduced base sizes for better UI
export const FONT_SIZES = {
  xs: getModerateScale(9, 0.3),    // Reduced from 10
  sm: getModerateScale(11, 0.3),   // Reduced from 12
  md: getModerateScale(13, 0.3),   // Reduced from 14
  lg: getModerateScale(15, 0.3),   // Reduced from 16
  xl: getModerateScale(17, 0.3),   // Reduced from 18
  xxl: getModerateScale(19, 0.3),  // Reduced from 20
  xxxl: getModerateScale(22, 0.3), // Reduced from 24
  heading: getModerateScale(26, 0.3), // Reduced from 28
  title: getModerateScale(28, 0.3),   // Reduced from 32
  display: getModerateScale(36, 0.3), // Reduced from 42
};

/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 * @param time24 - Time string in 24-hour format (e.g., "13:40", "09:30")
 * @returns Time string in 12-hour format (e.g., "1:40 PM", "9:30 AM")
 */
export const convertTo12Hour = (time24: string): string => {
  if (!time24) return '';
  
  const [hours24, minutes] = time24.split(':');
  const hours = parseInt(hours24, 10);
  
  if (isNaN(hours) || hours < 0 || hours > 23) {
    return time24; // Return original if invalid
  }
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hours12}:${minutes} ${period}`;
};

/**
 * Convert time range from 24-hour to 12-hour format
 * @param startTime - Start time in 24-hour format (e.g., "13:40")
 * @param endTime - End time in 24-hour format (e.g., "14:40")
 * @returns Formatted time range (e.g., "01:40 PM - 02:40 PM")
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return '';
  return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
};
