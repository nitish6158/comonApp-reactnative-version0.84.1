import crashlytics from "@react-native-firebase/crashlytics";

interface IDetail {
  userId: string;
  device: string;
}

export function crashLog(message: string) {
  crashlytics().log(message);
}

export async function crashDetails(details: IDetail) {
  await Promise.all([
    crashlytics().setUserId(details?.userId),
    crashlytics().setAttributes({
      user: details?.userId,
      device: details.device,
    }),
  ]);
}

export function testCrash() {
  crashlytics().crash();
}
