import { AllChatRooms } from "@Atoms/allRoomsAtom";
//import liraries
import { ContactInfo } from "@Types/types";
import { useAtom } from "jotai";
import { useNavigation } from "@react-navigation/core";

// create a component

const NavigateTochatScreen = (ContactInfo: ContactInfo) => {
  const [ChatRooms] = useAtom(AllChatRooms);
  const navigation = useNavigation();
  //   const item = AllRoooms.find((room) => room.user_id == navigateItemId);
};

//make this component available to the app
export default NavigateTochatScreen;
