
import { Platform, Alert } from 'react-native';
import * as RNFS from 'react-native-fs';
import { CORE_STORAGE } from './mmkv';

export const saveDataToFile = async () => {
  try {
    const data = CORE_STORAGE.getString("root")

    const filePath = `${RNFS.DocumentDirectoryPath}/mmkv_backup.json`;
    await RNFS.writeFile(filePath, JSON.stringify(data), 'utf8');

    // Optionally, show an alert or log success
    console.log('Data saved to file:', filePath);
    Alert.alert('Backup Complete', 'Data has been saved to file.');
  } catch (error) {
    console.error('Error saving data to file:', error);
    Alert.alert('Backup Failed', 'Failed to save data to file.');
  }
};

export const restoreDataFromFile = async () => {
  try {
    const filePath = `${RNFS.DownloadDirectoryPath}/mmkv_backup.json`;

    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error('Backup file does not exist.');
    }

    const fileContent = await RNFS.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    // Clear existing MMKV data
    CORE_STORAGE.clearAll();

    // Restore data to MMKV
    Object.keys(data).forEach((key) => {
      CORE_STORAGE.set(key, data[key]);
    });

    // Optionally, show an alert or log success
    console.log('Data restored from file:', filePath);
    Alert.alert('Restore Complete', 'Data has been restored from file.');
  } catch (error) {
    console.error('Error restoring data from file:', error);
    Alert.alert('Restore Failed', 'Failed to restore data from file.');
  }
};

export const saveDataToDownload = async () => {
  try {
    const data = CORE_STORAGE.getString("persist:root") // Get all data from MMKV

    let filePath = '';
    if (Platform.OS === 'ios') {
      filePath = `${RNFS.DocumentDirectoryPath}/mmkv_backup.json`;
    } else if (Platform.OS === 'android') {
      filePath = `${RNFS.DownloadDirectoryPath}/mmkv_backup.json`;
    }

    // Create the directory if it doesn't exist
    const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));
    await RNFS.mkdir(directoryPath, { NSURLIsExcludedFromBackupKey: true });

    await RNFS.writeFile(filePath, JSON.stringify(data), 'utf8');

    // Optionally, show an alert or log success
    console.log('Data saved to file:', filePath);
    Alert.alert('Backup Complete', 'Data has been saved to file.');
  } catch (error) {
    console.error('Error saving data to file:', error);
    Alert.alert('Backup Failed', 'Failed to save data to file.');
  }
};