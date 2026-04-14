const DEFAULT_BATCH_LENGTH = 400;

export function getBatches(arr: any[], batchLength?: number): Array<any[]> {
  if (!batchLength) batchLength = DEFAULT_BATCH_LENGTH;
  if (arr && arr.length) {
    const lengthOfData = arr.length;
    if (lengthOfData > batchLength) {
      const arrOfSubset = [];
      const totalBatch = Math.ceil(arr.length / batchLength);
      let start = 0;
      let end = start + batchLength;
      for (let i = 0; i < totalBatch; i++) {
        const batch = arr.slice(start, end);
        if (batch.length > 0) arrOfSubset.push(batch);
        start = end + 1;
        end = start + batchLength;
        const difference = lengthOfData - end;
        if (difference < 0) end += difference;
      }
      return arrOfSubset;
    }
    return [arr];
  }
  return [];
}
