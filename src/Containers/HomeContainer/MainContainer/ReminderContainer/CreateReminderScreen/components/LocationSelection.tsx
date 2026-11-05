import { View, Text, Platform } from "react-native";
import React, { useEffect, useRef } from "react";
import Modal from "react-native-modal";
import { reminderStyle as styles } from "../reminder.styles";
import AntDesign from "react-native-vector-icons/AntDesign";
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteProps } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACE_API_KEY } from "@Service/provider/endpoints";
import { LocationSelectionProps } from "../reminder.types";
import { Colors } from "@/Constants";
import { useTranslation } from "react-i18next";

export default function LocationSelection({ isVisible, onClose, onSelect, defaultText }: LocationSelectionProps) {
  const ref = useRef();
  const {t} = useTranslation()

  return (
    <View>
      <Modal style={{ margin: 0, backgroundColor: "white" }} isVisible={isVisible} onBackButtonPress={onClose}>
        <View style={[styles.headerContainer, { marginTop: Platform.OS == "ios" ? 40 : 5, paddingHorizontal: 20 }]}>
          <AntDesign name="arrowleft" color="black" size={22} onPress={onClose} />
        </View>
        <View style={{ flex: 1 }}>
          <GooglePlacesAutocomplete
            placeholder={t("reminders.search-location")}
            fetchDetails={true}
            defaultText={defaultText}
            ref={ref}
            enablePoweredByContainer={false}
            // keepResultsAfterBlur={true}
            styles={{
              textInputContainer: {
                backgroundColor: Colors.light.PrimaryColor,
                paddingHorizontal: 20,
                paddingVertical: 20,
              },
              textInput: {
                height: 38,
                color: "#5d5d5d",
                fontSize: 16,
              },
            }}
            onPress={onSelect}
            nearbyPlacesAPI="GoogleReverseGeocoding"
            query={{
              key: GOOGLE_PLACE_API_KEY,
              language: "en",
            }}
            onFail={console.log}
            onNotFound={() => {}}
          />
        </View>
      </Modal>
    </View>
  );
}
