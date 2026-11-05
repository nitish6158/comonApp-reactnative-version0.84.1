import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useAtom } from "jotai";
import { activeSurveyIdAtom } from "@/Atoms/surveyAtom";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";
import { Button } from "react-native-ui-lib";
import { useCreateSurveyAnswerMutation } from "@/graphql/generated/survey.generated";
import { useAppSelector } from "@/redux/Store";
import { Colors } from "@/Constants";
import { navigate } from "@/navigation/utility";

export default function AskSurveyModal() {
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const [activeSurveyId, setActiveSurveyId] = useAtom(activeSurveyIdAtom);
  const [AnswerSurveyRequest, AnswerSurveyResponse] = useCreateSurveyAnswerMutation();
  const { t } = useTranslation();

  return (
    <View>
      <Modal isVisible={activeSurveyId !== null} onBackdropPress={skipSurvey} onBackButtonPress={skipSurvey}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{t("survey.ask-call-survey")}</Text>
          <View style={styles.buttonContainer}>
            <Button
              label={`${t("survey.skip")}`}
              size="large"
              style={styles.skipButton}
              backgroundColor={Colors.light.alertFailure}
              onPress={skipSurvey}
              disabled={AnswerSurveyResponse.loading}
            />
            <Button
              label={`${t("survey.start")}`}
              size="large"
              onPress={StartSurvey}
              backgroundColor={Colors.light.alertSuccess}
              disabled={AnswerSurveyResponse.loading}
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  async function skipSurvey() {
    const payload = {
      surveyId: activeSurveyId,
      isSkipped: true,
      participants: {
        _id: MyProfile?._id ?? "",
        firstName: MyProfile?.firstName,
        lastName: MyProfile?.lastName,
        profile_img: MyProfile?.profile_img ?? "",
      },
      Questionanswers: [
        {
          QuestionDetail: null,
          answers: [],
        },
      ],
    };

    console.log("AskSurveyModal:Skip", payload);

    let res = await AnswerSurveyRequest({
      variables: {
        input: payload,
      },
    });

    if (res.data?.createSurveyAnswer) {
      setActiveSurveyId(null);
    }
  }

  function StartSurvey() {
    setActiveSurveyId(null);
    setTimeout(() => {
      navigate("SurveyContainer", { surveyId: activeSurveyId });
    }, 500);
  }
}

const styles = StyleSheet.create({
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  modalText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 30,
  },
  skipButton: {
    marginRight: 5,
  },
});
