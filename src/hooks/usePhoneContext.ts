import { PhoneContext } from "@Context/PhoneProvider";
import { useContext } from "react";

export const usePhoneContext = () => useContext(PhoneContext);
