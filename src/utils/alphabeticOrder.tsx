type WithFirstName = { firstName?: string | null };

export default function getAlphabatic<T extends WithFirstName>(list: T[]) {
  return list.sort((a, b) =>
    String(a.firstName ?? "").localeCompare(String(b.firstName ?? "")),
  );
}
