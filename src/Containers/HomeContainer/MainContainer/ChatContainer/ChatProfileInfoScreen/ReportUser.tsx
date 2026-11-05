import { View, StyleSheet, FlatList } from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import { Button, Checkbox, Modal, Text } from "react-native-ui-lib";
import { windowHeight } from "@Util/ResponsiveView";
import { useTranslation } from "react-i18next";
import TextField from "@Components/AnimatedTextInput";

type ReportUserProps = {
  isVisible: boolean;
  onCancel: () => void;
  onReport: (reason: string) => void;
};

type ReportReason = {
  reason: string;
};

const reportReasons: ReportReason[] = [
  { reason: "OffensiveMessages" },
  { reason: "Spam" },
  { reason: "Didnsignup" },
  { reason: "NoLongerNeeded" },
  { reason: "Other" },
];

// Report reason item component - extracted for better performance
const ReportReasonItem = React.memo(({
  item,
  index,
  selectedReason,
  setReason,
  otherReason,
  setOtherReason,
  t
}: {
  item: ReportReason;
  index: number;
  selectedReason: string;
  setReason: (reason: string) => void;
  otherReason: string;
  setOtherReason: (text: string) => void;
  t: (key: string) => string;
}) => {
  return (
    <View key={index} style={styles.checkboxView}>
      <Checkbox
        color="#33CCFF"
        borderRadius={30}
        value={selectedReason === item.reason}
        label={t(`chatProfile.${item.reason}`)}
        onValueChange={() => setReason(item.reason)}
      />
      {item.reason === "Other" && selectedReason === item.reason && (
        <TextField
          style={styles.textInput}
          placeholder="Enter your reason"
          onChangeText={setOtherReason}
          showCharCounter
          maxLength={130}
          multiline={true}
          autoFocus={true}
        />
      )}
    </View>
  );
});

export default function ReportUser({ isVisible, onCancel, onReport }: ReportUserProps) {
  const [reason, setReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const { t } = useTranslation();

  // Handle report submission
  const handleReport = useCallback(() => {
    const reportReason = reason === "Other" ? otherReason : t(`chatProfile.${reason}`);
    onReport(reportReason);
    setReason("");
  }, [reason, otherReason, t, onReport]);

  // Handle cancel action
  const handleCancel = useCallback(() => {
    onCancel();
    setReason("");
  }, [onCancel]);

  // Memoized renderer for better performance
  const renderItem = useCallback(({ item, index }: { item: ReportReason; index: number }) => (
    <ReportReasonItem
      item={item}
      index={index}
      selectedReason={reason}
      setReason={setReason}
      otherReason={otherReason}
      setOtherReason={setOtherReason}
      t={t}
    />
  ), [reason, otherReason, t]);

  // For performance optimization, memoize the keyExtractor
  const keyExtractor = useCallback((item: ReportReason) => item.reason, []);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      overlayBackgroundColor={"rgba(0,0,0,.5)"}
      onBackgroundPress={onCancel}
    >
      <View style={styles.main}>
        <View style={styles.container}>
          <Text text60 center>
            {t("chatProfile.Report-and-Block")}
          </Text>
          <Text text75 marginT-15>
            {t("chatProfile.blockerSubHeading")}
          </Text>
          <Text text75 marginT-5>
            Your chat with this chatroom will also be deleted
          </Text>

          <Text text80 marginB-10 style={{ color: "#828282" }} marginT-20>
            {t("chatProfile.Reason-for-blocking")}:
          </Text>

          <FlatList
            data={reportReasons}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
          />

          <View style={styles.actionView}>
            <Button
              onPress={handleCancel}
              label={"Cancel"}
              backgroundColor={"gray"}
              fullWidth
              style={{ width: 120 }}
            />
            <View style={{ width: 40 }} />
            <Button
              onPress={handleReport}
              label={"Block"}
              backgroundColor={"#33CCFF"}
              fullWidth
              style={{ width: 120 }}
              disabled={reason === "Other" && !otherReason.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  main: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    height: windowHeight,
    flex: 1,
  },
  container: {
    backgroundColor: "white",
    width: 350,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
  },
  checkboxView: {
    marginVertical: 5,
  },
  actionView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    paddingHorizontal: 20,
    height: 45,
    borderRadius: 10,
    marginBottom: 2,
  },
});
