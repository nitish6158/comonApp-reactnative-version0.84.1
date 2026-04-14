import { CommonUserList, ReduxChat } from "@Types/types";

interface ReplaceNameWithLocalProps {
  Id: string;
  phoneNo: string | number;
  UserList: CommonUserList;
}

function ReplaceNameWithLocal({ Id, phoneNo, UserList }: ReplaceNameWithLocalProps) {
  const tempuserlistdata = UserList?.find((userlist: { _id: any }) => userlist?.userId._id == Id);
  if (tempuserlistdata != undefined) {
    if (tempuserlistdata?.firstName && tempuserlistdata?.lastName) {
      return tempuserlistdata?.firstName + " " + tempuserlistdata?.lastName;
    }
  } else {
    return phoneNo;
  }
}
export default ReplaceNameWithLocal;
