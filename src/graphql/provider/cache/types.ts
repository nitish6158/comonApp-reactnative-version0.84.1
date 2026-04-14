import { FetchResult } from "@apollo/client";

export type DataType<T> = Omit<FetchResult<T, Record<string, T>, Record<string, T>>, "context">;
