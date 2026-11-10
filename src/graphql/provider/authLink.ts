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
  const { expireAt: sessionExpireAt, refresh } = await getSession();

  if (!sessionExpireAt || !refresh) {
    return false;
  }

  const expireAt = Number(sessionExpireAt);
  if (isNaN(expireAt) || expireAt <= 0) {
    return false;
  }

  const now = getNewDate();
  // Refresh if token has expired or is expiring in less than 5 minutes
  const bufferMs = 5 * 60 * 1000;
  return now >= expireAt - bufferMs;
};

let activeRefreshPromise: Promise<any> | null = null;

export async function refreshAuthToken() {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const { refresh } = await getSession();
      if (!refresh) return null;

      const currentOrganization = await getCurrentOrganization();
      const payload = {
        query: RefreshSessionDocument,
        variables: {
          input: {
            refresh: refresh,
            orgId: currentOrganization?._id,
            plateform: Platform.OS === "ios" ? PlateformType.IOs : PlateformType.Android,
          },
        },
      };

      const res = await client.query<RefreshSessionQuery, RefreshSessionQueryVariables>(payload);
      const refreshSession = res.data?.refreshSession;
      if (refreshSession) {
        await setSession({
          token: refreshSession.token,
          refresh: refreshSession.refresh,
          mode: refreshSession.mode,
          expireAt: refreshSession.expiredAt,
        });
        return refreshSession;
      }
      return null;
    } catch (e: any) {
      console.warn("[authLink] Token refresh warning:", e?.message);
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
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
      token = refresh?.token || token;
    } else if (request.operationName === OperationNames.GET_MY_ROLE) {
      const refresh = await refreshAuthToken();
      token = refresh?.token || token;
    }
  }

  const authHeaders: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
  };
  if (token && token !== "undefined" && token !== "null") {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  let header = {
    headers: {
      ...headers,
      ...authHeaders,
    },
  };

  return header;
});

const uploadLink = createUploadLink({
  uri: PUBLIC_API_HOST,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
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
