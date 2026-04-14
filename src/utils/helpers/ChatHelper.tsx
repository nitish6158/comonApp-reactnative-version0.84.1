function getMyWallpaperForCurrentRoom(participants: any, myUserId: string) {
  const findMyObj = participants.find((p: any) => p.user_id === myUserId);
  return findMyObj?.wallpaper ?? null;
}

export { getMyWallpaperForCurrentRoom };
