import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { SurveyContainerScreenProps } from "@/navigation/screenPropsTypes";
import { useCreateSurveyAnswerMutation, useConductSurveyLazyQuery } from "@/graphql/generated/survey.generated";
import { SurveyOptionsDto, SurveyQuestionDto } from "@/graphql/generated/types";
import HeaderWithBack from "@/Components/header/HeaderWithBack";
import { Button, KeyboardAwareFlatList, TextField } from "react-native-ui-lib";
import { Colors } from "@/Constants";
import { useAppSelector } from "@/redux/Store";
import { useTranslation } from "react-i18next";
import ToastMessage from "@/utils/ToastMesage";
import { windowWidth } from "@/utils/ResponsiveView";
import { Keyboard } from "react-native";

type AnswerType = {
  QuestionDetail: {
    _id: string | null | undefined;
    label: string | null | undefined;
  };
  answers: SurveyOptionsDto[];
};

export default function SurveyContainer({ navigation, route }: SurveyContainerScreenProps) {
  const [getSurveyDetails, getSurveyDetailsResponse] = useConductSurveyLazyQuery();
  const [questions, setQuestions] = useState<SurveyQuestionDto[]>([]);
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const [answers, setAnswers] = useState<AnswerType[]>([]);
  const [answerSurveyRequest, answerSurveyResponse] = useCreateSurveyAnswerMutation();
  const [language, setLanguage] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    getQuestions();
  }, []);

  const getQuestions = useCallback(async () => {
    try {
      const { data, error } = await getSurveyDetails({
        variables: {
          input: {
            _id: route.params.surveyId,
          },
        },
      });

      if (data?.conductSurvey?.scenario?.[0]?.Questions) {
        const surveyQuestions = data.conductSurvey.scenario[0].Questions;
        const lang = data.conductSurvey.scenario[0].language;
        setLanguage(lang);
        setQuestions(surveyQuestions);
        
        setAnswers(
          surveyQuestions.map((q) => ({
            QuestionDetail: {
              language: q.language,
              _id: q._id,
              label: q.label,
            },
            answers: [],
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching survey questions:", error);
    }
  }, [getSurveyDetails, route.params.surveyId]);

  const handleAnswerChange = useCallback((questionId: string, newAnswer: SurveyOptionsDto[]) => {
    let newAnswers = newAnswer.map((v) => ({
      ...v,
      title: v.title?.trim() || "",
    }));
    setAnswers((prevAnswers) =>
      prevAnswers.map((question) =>
        question.QuestionDetail._id === questionId
          ? {
              ...question,
              answers: newAnswers,
            }
          : question
      )
    );
  }, []);

  const renderQuestion = useCallback(
    ({ item }: { item: SurveyQuestionDto }) => {
      const currentAnswer = answers.find((a) => a.QuestionDetail._id === item._id);

      return (
        <View style={styles.questionWrapper}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{item.label}</Text>
          </View>
          {item.type === "TEXT_INPUT" ? (
            <View style={styles.textInput}>
              <TextField
                onChangeText={(text) => handleAnswerChange(item._id, [{ _id: item._id, title: text }])}
                multiline
                maxLength={200}
                placeholder={`${t("survey.enter-review")}`}
                placeholderTextColor="gray"
                style={{ width: windowWidth - 80 }}
                showCharCounter
              />
            </View>
          ) : (
            <View>
              {item.options?.map((option, index) => {
                const isSelected = currentAnswer?.answers.find((v) => v._id == option._id);
                //console.log(option._id, currentAnswer?.answers);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionContainer, isSelected && styles.selectedOption]}
                    onPress={() => {
                      let newAnswers: SurveyOptionsDto[];
                      if (item.type === "RADIO") {
                        newAnswers = [option];
                      } else if (item.type === "CHECKBOX") {
                        newAnswers = isSelected
                          ? currentAnswer?.answers.filter((a) => a._id !== option._id) ?? []
                          : [...(currentAnswer?.answers ?? []), option];
                      } else {
                        newAnswers = [];
                      }

                      // console.log(newAnswers);
                      handleAnswerChange(item._id, newAnswers);
                    }}
                  >
                    <Text style={styles.optionText}>{option.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      );
    },
    [answers, handleAnswerChange]
  );

  const submitSurvey = useCallback(async () => {
    try {
      let answersFormat = answers.map((v) => {
        return {
          ...v,
          answers: v.answers.map((b) => b.title),
        };
      });

      console.log(answersFormat);

      const res = await answerSurveyRequest({
        variables: {
          input: {
            surveyId: route.params.surveyId,
            isSkipped: false,
            language,
            Questionanswers: answersFormat,
            participants: {
              _id: MyProfile?._id ?? "",
              firstName: MyProfile?.firstName,
              lastName: MyProfile?.lastName,
              profile_img: MyProfile?.profile_img ?? "",
            },
          },
        },
      });

      if (res.data?.createSurveyAnswer) {
        navigation.goBack();
        ToastMessage(t("survey.success"));
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
    }
  }, [answerSurveyRequest, answers, MyProfile, navigation, route.params.surveyId]);

  const skipSurvey = useCallback(async () => {
    try {
      const res = await answerSurveyRequest({
        variables: {
          input: {
            surveyId: route.params.surveyId,
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
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error skipping survey:", error);
    }
  }, [answerSurveyRequest, MyProfile, navigation, route.params.surveyId]);

  function FooterComponent() {
    if (questions.length === 0) return null;

    // if(answerSurveyResponse.loading) return <ActivityIndicator size={"small"}/>

    return (
      <View style={styles.footerContainer}>
        <Button
          label={`${t("survey.skip")}`}
          size="large"
          style={styles.skipButton}
          backgroundColor={Colors.light.alertFailure}
          onPress={skipSurvey}
          disabled={answerSurveyResponse.loading}
        />
        <Button
          label={`${t("survey.submit")}`}
          size="large"
          onPress={submitSurvey}
          backgroundColor={Colors.light.alertSuccess}
          disabled={answerSurveyResponse.loading}
        />
      </View>
    );
  }

  if (getSurveyDetailsResponse.loading) {
    return (
      <View style={styles.main}>
        <HeaderWithBack />
        {getSurveyDetailsResponse.loading && (
          <View style={{ marginVertical: 20, flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size={"large"} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <HeaderWithBack />
      <KeyboardAwareFlatList
        style={styles.listContainer}
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item, index) => `${item._id ?? ""}_${index}`}
        ListFooterComponent={FooterComponent}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  listContainer: {
    marginTop: 10,
  },
  questionWrapper: {
    marginBottom: 20,
  },
  questionContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  questionText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "500",
  },
  optionContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FCF5ED",
    marginHorizontal: 20,
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: "#E3D18A",
  },
  optionText: {
    textAlign: "center",
    fontSize: 15,
  },
  textInput: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FCF5ED",
    marginHorizontal: 20,
    marginBottom: 5,
    minHeight: 40,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 20,
    marginBottom: 100,
  },
  skipButton: {
    marginRight: 5,
  },
});
