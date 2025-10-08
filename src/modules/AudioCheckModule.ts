// src/modules/AudioCheckModule.ts
import { NativeModules } from 'react-native';

interface AudioCheckModuleType {
  isCallActive(): Promise<boolean>;
  isMicrophoneInUse(): Promise<boolean>;
  isScreenMirroring(): Promise<boolean>;
  hasOverlayPermission(): Promise<boolean>;
  isDeviceRooted(): Promise<boolean>;
  isAccessibilityServiceEnabled(): Promise<boolean>;
}

const { AudioCheckModule } = NativeModules;

export default AudioCheckModule as AudioCheckModuleType;
