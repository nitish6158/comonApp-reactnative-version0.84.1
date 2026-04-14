import { ApolloCache } from "@apollo/client";
import { Assignment } from "@Service/generated/types";
import { DataType } from "./types";
import { StartReportMutation } from "@Service/generated/report.generated";

export const onUpdateMyAssignments = (cache: ApolloCache<Assignment>, { data }: DataType<StartReportMutation>) => {
  cache.modify({
    id: cache.identify({ ...data?.startReport.assignment, __typename: "Assignment" }),
    fields: {
      activeReportId() {
        return data?.startReport._id;
      },
    },
  });
};
