import * as ImagePicker from 'expo-image-picker';
import { getCameraPermissionsAsync, requestCameraPermissionsAsync } from 'expo-camera';
import { Alert, Platform, Linking } from 'react-native';

/**
 * Check Camera Permission Status
 */
export async function checkCameraPermission() {
  try {
    const camStatus = await getCameraPermissionsAsync();
    if (camStatus?.granted) return true;

    const pickerStatus = await ImagePicker.getCameraPermissionsAsync();
    return !!pickerStatus?.granted;
  } catch (error) {
    console.warn('Error checking camera permission:', error);
    return false;
  }
}

/**
 * Request Camera Permission
 */
export async function requestCameraPermission() {
  try {
    const camRes = await requestCameraPermissionsAsync();
    if (camRes?.granted) return true;

    const pickerRes = await ImagePicker.requestCameraPermissionsAsync();
    if (pickerRes?.granted) return true;

    if (!camRes?.canAskAgain && !pickerRes?.canAskAgain && Platform.OS !== 'web') {
      promptOpenSettings('Camera Access Required', 'PulseChat requires camera permission to capture photos and make video calls. Please enable it in device settings.');
    }
    return false;
  } catch (error) {
    console.warn('Error requesting camera permission:', error);
    return false;
  }
}

/**
 * Check Media Library (Photo Gallery) Permission Status
 */
export async function checkMediaPermission() {
  try {
    const status = await ImagePicker.getMediaLibraryPermissionsAsync();
    return !!status.granted;
  } catch (error) {
    console.warn('Error checking media library permission:', error);
    return false;
  }
}

/**
 * Request Media Library Permission
 */
export async function requestMediaPermission() {
  try {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (res.granted) return true;

    if (!res.canAskAgain && Platform.OS !== 'web') {
      promptOpenSettings('Photo Library Access Required', 'PulseChat needs access to your photo library to send photos and update your profile picture. Please enable it in device settings.');
    }
    return false;
  } catch (error) {
    console.warn('Error requesting media library permission:', error);
    return false;
  }
}

/**
 * Open Device Settings Helper
 */
function promptOpenSettings(title, message) {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings().catch((e) => console.warn('Could not open settings:', e));
        },
      },
    ]
  );
}

/**
 * Capture photo using device camera with graceful permission checks and options
 */
export async function capturePhoto(options = {}) {
  const {
    allowsEditing = false,
    quality = 0.85,
    cameraType = 'front', // 'front' | 'back'
  } = options;

  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return await promptCameraFallback('Camera permission is required to capture photos.');
    }

    const cameraDirection =
      cameraType === 'front'
        ? ImagePicker.CameraType?.front ?? 'front'
        : ImagePicker.CameraType?.back ?? 'back';

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing,
      quality,
      cameraType: cameraDirection,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.warn('Camera capture error:', error);
    return await promptCameraFallback(error?.message || 'Device camera could not be opened directly.');
  }
}

/**
 * Prompt user when native camera is unavailable
 */
function promptCameraFallback(reason) {
  return new Promise((resolve) => {
    Alert.alert(
      'Camera Option 📸',
      `${reason}\n\nChoose an alternative to attach your photo:`,
      [
        {
          text: 'Choose from Gallery 🖼️',
          onPress: async () => {
            const uri = await pickImageFromGallery();
            resolve(uri);
          },
        },
        {
          text: 'Use Sample Photo 📷',
          onPress: () => {
            resolve('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ]
    );
  });
}

/**
 * Pick image from photo gallery with options
 */
export async function pickImageFromGallery(options = {}) {
  const {
    allowsEditing = false,
    quality = 0.85,
    allowsMultipleSelection = false,
  } = options;

  try {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing,
      quality,
      allowsMultipleSelection,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (allowsMultipleSelection) {
        return result.assets.map((asset) => asset.uri);
      }
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.warn('Gallery pick error:', error);
    return null;
  }
}

export default {
  checkCameraPermission,
  requestCameraPermission,
  checkMediaPermission,
  requestMediaPermission,
  capturePhoto,
  pickImageFromGallery,
};
