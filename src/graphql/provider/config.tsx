/* eslint-disable prettier/prettier */
import React from "react";
import { ApolloProvider as Provider } from "@apollo/client";
import { client } from "./authLink";

export const ApolloProvider = ({ children }: any) => {
  return <Provider client={client}>{children}</Provider>;
};
