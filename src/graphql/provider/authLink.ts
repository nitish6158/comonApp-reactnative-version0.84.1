import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import {
  RefreshSessionDocument,
  RefreshSessionQuery,
  RefreshSessionQueryVariables,
} from "@Service/generated/auth.generated";
import { getCurrentOrganization, getSession, setSession } from "@Util/session";
import { possibleTypes, typePolicies } from "./schemaMetadata";

import { PUBLIC_API_HOST } from "@Service/provider/endpoints";
import { PlateformType } from "@Service/generated/types";
import { Platform } from "react-native";
import { createUploadLink } from "apollo-upload-client";
import { getNewDate } from "@Util/date";
import { setContext } from "@apollo/client/link/context";

let applicationStarted = true;

const isRefreshNeeded = async () => {
  const { expireAt: sessionExpireAt } = await getSession();

  if (!sessionExpireAt) {
    return false;
  }

  const expireAt = Number(sessionExpireAt);
  const now = getNewDate();

  if (now >= expireAt) {
    return false;
  }

  return false;
};

export async function refreshAuthToken() {
  const { refresh } = await getSession();
  const currentOrganization = await getCurrentOrganization();
  const payload = {
    query: RefreshSessionDocument,
    variables: {
      input: {
        refresh: refresh!,
        orgId: currentOrganization?._id,
        plateform: Platform.OS ? PlateformType.IOs : PlateformType.Android,
      },
    },
  };
  return await client
    .query<RefreshSessionQuery, RefreshSessionQueryVariables>(payload)
    .then(({ data }) => {
      const refreshSession = data?.refreshSession;
      // console.log("Refresh sessiion response", JSON.stringify(data));
      setSession({
        token: refreshSession.token,
        refresh: refreshSession.refresh,
        mode: refreshSession.mode,
        expireAt: refreshSession.expiredAt,
      });
      return refreshSession;
    })
    .catch((e) => {
      // navigateAndSimpleReset("Auth", {});
    });
}

// (vasyl.p: 06.12.2021) Be careful, if you gonna update enum operation names something can be broken
enum OperationNames {
  REFRESH_SESSION = "refreshSession",
  GET_ORGANIZATION = "organization",
  GET_MY_ROLE = "getMyRole",
}

const authLink = setContext(async (request, { headers }) => {
  const session = await getSession();
  let { token } = headers?.token ? { token: headers.token } : session;

  if (request.operationName !== OperationNames.REFRESH_SESSION) {
    const isRefresh = await isRefreshNeeded();

    if (token && isRefresh) {
      const refresh = await refreshAuthToken();
      token = refresh?.token;
    } else if (request.operationName === OperationNames.GET_MY_ROLE) {
      const refresh = await refreshAuthToken();
      token = refresh?.token;
    }
  }
  console.log("Token is",token)
  let header = {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  };

  return header;
});

const uploadLink = createUploadLink({
  uri: PUBLIC_API_HOST,
});

export const client = new ApolloClient({
  link: authLink.concat(uploadLink as unknown as ApolloLink),
  cache: new InMemoryCache({
    possibleTypes,
    typePolicies,
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});
