import { Share as NativeShare, Platform } from "react-native";
import PhoneNumberUtil from "google-libphonenumber";
import branch from "react-native-branch";
import { ANDROID_URL, IOS_URL } from "@Service/provider/endpoints";

const phoneUtils = PhoneNumberUtil.PhoneNumberUtil.getInstance();

const controlParams = {
  $ios_url: IOS_URL,
  $android_url: ANDROID_URL,
};

type args = {
  phone: string;
  code: string;
  InviteApi: (phone: string, region: string, branchUrl: string) => void;
};

export const InviteContactOnApp = async ({ phone, code, InviteApi }: args) => {
  let region = code;
  const bundleIdentifier = Platform.OS === "ios" ? "com.comon.comonapp" : "com.comon.app";
  const linkProperties = {
    campaign: "Auth/Registration",
    tags: [phone, region],
  };
  try {
    // phone must begin with '+'
    const numberProto = phoneUtils.parse(phone, "");
    const countryCode = numberProto.getCountryCode();
    const countryRegion = phoneUtils.getRegionCodeForNumber(numberProto);
    if (countryCode && countryRegion) {
      linkProperties.tags[0] = phone.replace(`+${countryCode.toString()}`, "");
      linkProperties.tags[1] = countryRegion;
      region = countryRegion;
    } else {
      linkProperties.tags[0] = phone.slice(3, -1);
    }
  } catch (e) {
    console.log(e);
  }

  branch
    .createBranchUniversalObject(bundleIdentifier, {})
    .then((response) => {
      response
        .generateShortUrl(linkProperties, controlParams)
        .then((response) => {
          InviteApi(phone, region, response.url);
        })
        .catch((Err) => {
          console.log("Error in generating short url", Err);
        });
    })
    .catch((err) => {
      console.log("ERror in creating universal link", err);
    });
};
