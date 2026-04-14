import { DeadlineStorageKeys, StorageKeysList, getStorage, removeStorage, setStorage } from "@Util/storage";
import { useEffect, useRef, useState } from "react";

import { getNewDate } from "@Util/date";
import moment from "moment";

export interface UseStorageDedline {
  storageKey: `${DeadlineStorageKeys}`;
}

export interface UseStorageDedlineReturnType {
  dedline?: number;
  isCanResend: boolean;
  onRemove: () => void;
  onFinish: () => void;
  onResend: () => void;
  setIsCanResend: (value) => void;
}

export const useStorageDedline = ({ storageKey }: UseStorageDedline): UseStorageDedlineReturnType => {
  const [dedline, setDedline] = useState<number>(0);
  const timerRef = useRef(dedline || 0);
  const [isCanResend, setIsCanResend] = useState(true);
  const timeout = useRef<any>({});

  const tick = () => {
    timeout.current = setInterval(() => {
      timerRef.current -= 1;
      if (timerRef.current < 0) {
        clearInterval(timeout.current);
        onFinish();
      } else {
        setDedline(timerRef.current);
      }
    }, 1000);
  };

  const onRemove = () => {
    if (storageKey) removeStorage(storageKey);
  };

  const onResend = (storageKey: StorageKeysList) => {
    const date = getNewDate(30);
    clearInterval(timeout.current);
    timerRef.current = 30;
    setDedline(30);
    setStorage(storageKey, new Date(date).toString());
    setIsCanResend(false);
    tick();
  };

  const onFinish = () => {
    clearInterval(timeout.current);
    onRemove();
    setIsCanResend(true);
  };

  useEffect(() => {
    if (storageKey) {
      const now = moment();
      getStorage(storageKey).then(async (res: any) => {
        const then = new Date(res);
        const diff = Number(moment.duration(moment(then).diff(now)).seconds());

        if (diff > 0) {
          timerRef.current = diff;
          setDedline(diff);
          setIsCanResend(false);
          tick();
        } else {
          onFinish();
        }
      });
    }
    return () => {
      clearInterval(timeout.current);
    };
  }, [storageKey]);

  return {
    dedline,
    isCanResend,
    onRemove,
    onFinish,
    onResend,
    setIsCanResend,
  };
};
