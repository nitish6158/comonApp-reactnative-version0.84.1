import { isEmpty, isUndefined } from "lodash";

const isActiveAction = (data: any[], myid: string) => {
  let isExit = {};
  isExit = data?.filter((ele: { user_id: any }) => ele.user_id == myid);
  if (!isEmpty(isExit) && !isUndefined(isExit)) {
    return true;
  }
  return false;
};
export default isActiveAction;
