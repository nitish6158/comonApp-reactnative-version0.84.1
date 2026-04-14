import { useState } from "react";

export const useInfinity = () => {
  const [page, setPage] = useState({ current: 1, pageSize: 15 });

  const onFetchMore = (current: number, pageSize?: number) => {
    setPage({
      current,
      pageSize: pageSize || page.pageSize,
    });
  };

  return {
    onFetchMore,
    current: page.current,
    skip: 0,
    limit: page.pageSize * page.current,
  };
};
