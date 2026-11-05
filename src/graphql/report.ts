import gql from "graphql-tag";
import { PAGINATED_REPORT_FRAGMENT, REPORT_FRAGMENT } from "./fragments";

export const GET_MY_REPORTS = gql`
  query myReports($input: ReportsInputDto!) {
    myReports(input: $input) {
      ...PaginatedReportDetails
    }
  }
  ${PAGINATED_REPORT_FRAGMENT}
`;

export const GET_REPORT = gql`
  query report($input: IdDto!) {
    report(input: $input) {
      ...ReportDetails
    }
  }
  ${REPORT_FRAGMENT}
`;

export const START_REPORT = gql`
  mutation startReport($input: StartReportDto!) {
    startReport(input: $input) {
      ...ReportDetails
    }
  }
  ${REPORT_FRAGMENT}
`;

export const ADD_TASK_RESULT = gql`
  mutation addTaskResult($input: AddTaskResultDto!) {
    addTaskResult(input: $input) {
      ...ReportDetails
    }
  }
  ${REPORT_FRAGMENT}
`;

export const COMPLETE_REPORT = gql`
  mutation completeReport($input: CompleteReportsInputDto!) {
    completeReport(input: $input) {
      ...ReportDetails
    }
  }
  ${REPORT_FRAGMENT}
`;
