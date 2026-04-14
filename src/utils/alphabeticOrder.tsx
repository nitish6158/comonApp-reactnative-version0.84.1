export default function getAlphabatic<T>(list: T[]) {
  return list.sort((a, b) => a.firstName.localeCompare(b.firstName));
}
