import { CommonUserList, ReduxChat } from "@Types/types";

interface ReplaceNameWithLocalProps {
  Id: string;
  phoneNo: string | number;
  UserList: CommonUserList;
}

function ReplaceNameWithLocal({ Id, phoneNo, UserList }: ReplaceNameWithLocalProps) {
  const list = Array.isArray(UserList) ? UserList : [];
  const tempuserlistdata = list.find((userlist) => userlist?.userId?._id == Id);
  if (tempuserlistdata != undefined) {
    if (tempuserlistdata?.firstName && tempuserlistdata?.lastName) {
      return tempuserlistdata?.firstName + " " + tempuserlistdata?.lastName;
    }
  }
  return phoneNo as string | number | undefined;
}
export default ReplaceNameWithLocal;
