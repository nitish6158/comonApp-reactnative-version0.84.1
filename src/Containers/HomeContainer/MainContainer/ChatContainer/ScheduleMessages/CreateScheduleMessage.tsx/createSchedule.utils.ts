import { SessionKeys } from "@Util/session";
import { PUBLIC_API_HOST } from "@Service/provider/endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { backgroundUpload, createVideoThumbnail } from "react-native-compressor";
import RNFS from "react-native-fs";

async function createThumbnail(localVideoPath: string) {
  const thumbnail = await createVideoThumbnail(localVideoPath);
  return thumbnail.path;
}

export async function getUploadUrl(bucketPath: string, mimeType: string) {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  const GetUploadLink = `
    query getUploadSignedUrl($input: GetSignedURLInput!) {
      getUploadSignedUrl(input: $input) {
        url
        expires
      }
    }
  `;
  try {
    let response = await fetch(PUBLIC_API_HOST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GetUploadLink,
        variables: {
          input: {
            path: bucketPath,
            contentType: mimeType,
          },
        },
      }),
    });

    return response.json();
  } catch (error) {
    console.log(error);
  }
}

export async function uploadThumbnail(localVideoPath: string, bucketPath: string) {
  let thumbnailPath = await createThumbnail(localVideoPath);
  let urlResponse = await getUploadUrl(bucketPath, "image/jpeg");
  if (urlResponse.data?.getUploadSignedUrl.url) {
    await backgroundUpload(
      urlResponse.data?.getUploadSignedUrl.url,
      thumbnailPath,
      { httpMethod: "PUT", headers: { "Content-Type": "image/jpeg" } },
      (written, total) => {}
    );
  }
  RNFS.unlink(thumbnailPath);
  return true;
}
