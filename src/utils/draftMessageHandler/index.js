import AsyncStorage from "@react-native-async-storage/async-storage";

const StoreDraft = async (data) => {
  try {
    await AsyncStorage.setItem("@DraftData", data);
    //console.log("Data saved");
  } catch (error) {
    //console.log(error,'error saved');
  }
};
const FetchDraft = async () => {
  try {
    const value = await AsyncStorage.getItem("@DraftData");
    if (value !== null) {
      //console.log("Data retrieved");
      return value;
    }
  } catch (error) {
    //console.log(error,'fetchFailed');
  }
};

export { StoreDraft, FetchDraft };
