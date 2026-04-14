import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useCallback, useState } from "react";
import { useCreateSurveyAnswerMutation, useTakeSurveyMutation } from "@/graphql/generated/survey.generated";
import { useAppSelector } from "@/redux/Store";
import { useFocusEffect } from "@react-navigation/core";
import { Badge, Button } from "react-native-ui-lib";
import { Colors } from "@/Constants";
import { SurveyEventType } from "@/graphql/generated/types";
import { navigate } from "@/navigation/utility";
import { useTranslation } from "react-i18next";

type props = {
  type: SurveyEventType;
};

export function SurveyChecker({ type }: props) {
  const [checkChatSurvey] = useTakeSurveyMutation();
  const [AnswerSurveyRequest, AnswerSurveyResponse] = useCreateSurveyAnswerMutation();
  const [SurveyId, setSurveyId] = useState<string | null>(null);
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      chatSurvey();
    }, [])
  );

  if (SurveyId) {
    return (
      <Pressable style={styles.main} onPress={StartSurvey}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Badge label={"i"} size={20} backgroundColor={Colors.light.PrimaryColor} />
          <Text style={{ marginLeft: 10 }}>{t("survey.take-survey")}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Button
            label={`${t("survey.skip")}`}
            size="small"
            style={{ marginRight: 5 }}
            backgroundColor={Colors.light.alertFailure}
            onPress={skipSurvey}
            disabled={AnswerSurveyResponse.loading}
          />
          <Button
            label={`${t("survey.start")}`}
            size="small"
            onPress={StartSurvey}
            backgroundColor={Colors.light.alertSuccess}
            disabled={AnswerSurveyResponse.loading}
          />
        </View>
      </Pressable>
    );
  }

  return <View></View>;

  async function chatSurvey() {
    // console.log(storage.getString(keys.token))
    let res = await checkChatSurvey({
      variables: {
        input: {
          Module: type,
        },
      },
    });

    if (res.data?.takeSurvey) {
      console.log(res.data?.takeSurvey);
      if (res.data?.takeSurvey.success && res.data?.takeSurvey.surveyId) {
        setSurveyId(res.data?.takeSurvey.surveyId);
      } else {
        setSurveyId(null);
      }
    }
  }

  async function skipSurvey() {
    let res = await AnswerSurveyRequest({
      variables: {
        input: {
          surveyId: SurveyId,
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
        },
      },
    });

    if (res.data?.createSurveyAnswer) {
      console.log(res.data?.createSurveyAnswer)
      setSurveyId(null);
    }
  }

  function StartSurvey() {
    navigate("SurveyContainer", { surveyId: SurveyId });
    setSurveyId(null);
  }
}

const styles = StyleSheet.create({
  main: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
