import * as React from "react";

import { Image } from "react-native";
import Logo from "@Images/logo.png";
import { stylesLogo } from "./LogoStyles";

export const LogoTitle = () => <Image source={Logo} style={stylesLogo.logo} />;
