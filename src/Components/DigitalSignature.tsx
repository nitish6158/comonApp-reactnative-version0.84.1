import { Colors } from "@/Constants";
import { windowHeight } from "@Util/ResponsiveView";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dimensions, Image, StyleSheet, Text, View } from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import Modal from 'react-native-modal'

interface IDigitalSignature {
  onPressSave(image: string): void;
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
}

function DigitalSignature(props: IDigitalSignature) {
  const { onPressSave, modalVisible, setModalVisible } = props;

  const ref = useRef();

  const { t } = useTranslation();

  const handleOK = (signature: string) => {
    const urlWithoutBase64 = signature.replace("data:image/png;base64,", "");
    onPressSave(urlWithoutBase64);
    ref.current?.clearSignature();
  };

  const handleEmpty = () => {
    console.log("Empty");
  };

  const style = `.m-signature-pad--footer
    .button {
      background-color: ${Colors.light.PrimaryColor};
      color: #FFF;
    }
    `;

  return (
    <Modal 
      style={{
        flex:1,
        // backgroundColor:'white',
        justifyContent:'flex-end',
        margin:-10
      }}
      onBackdropPress={()=> setModalVisible(false)}
      isVisible={modalVisible}
      onBackButtonPress={() => setModalVisible(false)}>
    
      <View style={styles.centeredView}>
        <View style={{backgroundColor:'white',borderRadius:30,paddingVertical:20}}>
          <Text style={styles.textStyle}>{t("signatureDescription")}</Text>
          <SignatureScreen
            ref={ref}
            onOK={handleOK}
            descriptionText=""
            onEmpty={handleEmpty}
            clearText={t("clear")}
            confirmText={t("btn.save")}
            webStyle={style}
            trimWhitespace={true}
            webviewContainerStyle={{}}
          />
        </View>
      </View>
    </Modal>
  );
}

export default React.memo(DigitalSignature);

const styles = StyleSheet.create({
  centeredView: {
    justifyContent:'flex-end',
  },
  textStyle: {
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 17,
    color: Colors.light.black,
    textAlign: "center",
    marginVertical: 10,
  },
});
