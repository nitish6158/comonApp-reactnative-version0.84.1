import { createThumbnail } from "react-native-create-thumbnail";

export const generateThumbnail = async (_file: string) => {
  try {
    const { path } = await createThumbnail({
      url: _file,
      timeStamp: 1000,
    });
    let url = path.includes("file://") ? path : `file://${path}`;
    console.log('generateThumbnail',url)
    return url;
  } catch (e) {
    console.warn(e);
  }
};
