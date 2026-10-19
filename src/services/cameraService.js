import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Alert, Platform } from 'react-native';

/**
 * Capture photo directly using device camera
 */
export async function capturePhoto() {
  try {
    // 1. Check & request permission
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        const camStatus = await Camera.requestCameraPermissionsAsync();
        if (!camStatus.granted) {
          return await promptCameraFallback('Camera permission is needed to take live photos.');
        }
      }
    } catch (permErr) {
      console.log('Permission check notice:', permErr);
    }

    // 2. Launch system camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
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
          text: 'Use Live Photo Sample 📷',
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
 * Pick image from photo gallery
 */
export async function pickImageFromGallery() {
  try {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    } catch (e) {
      // Ignore
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.warn('Gallery pick error:', error);
    return null;
  }
}

export default {
  capturePhoto,
  pickImageFromGallery,
};
