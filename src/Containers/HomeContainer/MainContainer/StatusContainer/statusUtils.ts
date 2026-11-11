// @ts-nocheck
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";

export const STATUS_BG_COLORS = ["#0B63F6", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#0F172A", "#0891B2"];

export const STATUS_RING_UNSEEN = "#10B981";
export const STATUS_RING_SEEN = "#BDBDBD";

export type StatusAuthor = {
  _id: string;
  name: string;
  profile_img?: string | null;
};

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("file:")) return path;
  return `${DefaultImageUrl}${path}`;
}

/** authorId → { name, profile_img } built from the registered ComOn contacts (and the current user). */
export function useStatusAuthors(): Record<string, StatusAuthor> {
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);

  return useMemo(() => {
    const map: Record<string, StatusAuthor> = {};
    for (const contact of comonContact ?? []) {
      const id = contact?.userId?._id;
      if (!id) continue;
      const name = `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim() || contact.phone;
      map[id] = { _id: id, name, profile_img: contact.userId?.profile_img };
    }
    if (MyProfile?._id) {
      map[MyProfile._id] = {
        _id: MyProfile._id,
        name: `${MyProfile.firstName ?? ""} ${MyProfile.lastName ?? ""}`.trim(),
        profile_img: MyProfile.profile_img,
      };
    }
    return map;
  }, [comonContact, MyProfile]);
}

export function formatStatusTime(date: string | number | Date): string {
  const d = new Date(date);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString();
}
