import { gql } from "@apollo/client";

export const CheckActiveSurvey = gql`
  mutation takeSurvey($input: surveyDateTimeInput!) {
    takeSurvey(input: $input) {
      message
      success
      surveyId
    }
  }
`;

export const GetSurveyQuestion = gql`
  query conductSurvey($input:IdDto!){
    conductSurvey(input:$input){
      Module
      scenario {
        language
        Questions {
          language
          _id
          label
          type
          options {
            _id
            title
          }
        }
      }
    }
  }
`

export const CreateSurveyAnswer = gql`
  mutation createSurveyAnswer($input:surveyAnswersInput!){
    createSurveyAnswer(input:$input){
      success
      message
    }
  }
`

export const ChangeUserSurveyPreference = gql`
  mutation updateUserIsSurvey($input:isSurveyNeed!){
    updateUserIsSurvey(input:$input){
      success
      message
    }
  }
`