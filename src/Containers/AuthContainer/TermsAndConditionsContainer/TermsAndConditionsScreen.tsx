// @ts-nocheck
import * as React from "react";
import { useState } from "react";
import { Platform, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "react-native-elements";
import { RNVoipPushKit } from "react-native-voips-calls";
import { useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import { currentUserIdAtom } from "@Atoms/RealmloginManager";
import { navigate } from "@Navigation/utility";
import { TermsScreenProps } from "@/navigation/screenPropsTypes";
import { layoutStyle } from "@Components/layout/LayoutStyle";
import { TermsView } from "@/Components/TermsView";
import { requestUserPermission } from "@Util/permissionUtils";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { user } from "@/schemas/schema";
import { mainStyles } from "../../../styles/main";
import { termsAndConditionsStyles } from "./TermsAndConditionsStyles";

export default function TermsAndConditionsScreen({ route }: TermsScreenProps) {
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation("terms");
  const setCurrentId = useSetAtom(currentUserIdAtom);

  React.useEffect(() => {
    if (Platform.OS === "ios") {
      RNVoipPushKit.requestPermissions();
    }
    void requestUserPermission().catch(() => { });
  }, []);

    const onDecline = () => {
      navigate("Login", { showModal: true });
    };

    const onAgree = async () => {
      setLoader(true);
        try {
          const userProfile = await AsyncStorage.getItem("MyProfile");
          if (userProfile) {
            const userData = JSON.parse(userProfile) as user;
            userData["phoneConfirmed"] = true;
            await AsyncStorage.setItem("MyProfile", JSON.stringify(userData));
            setCurrentId(userData);
            dispatch(setMyProfile(userData));
          }
        } finally {
          setLoader(false);
        }
      };

      return (
        <View
          style={[
            layoutStyle.containerBackground,
            layoutStyle.wrapperPadding,
            mainStyles.flex1,
            mainStyles.justifyBetween,
          ]}
        >
      < TermsView
        boxStyle={termsAndConditionsStyles.box}
            buttonContainerStyle={termsAndConditionsStyles.buttonContainer}
            footerMarginBottom={5}
            loader={loader}
            onDecline={onDecline}
            onAgree={() => {
              void onAgree();
            }}
                titleSlot={
                  <Text
                    h4
                    style={[termsAndConditionsStyles.title, mainStyles.paddingTopBottomLg]}
                  >
                    {t("terms.title")}
                  </Text>
        }
      />
        </View>
      );
    }
