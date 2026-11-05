export function MultiAudioManager() {
  let audioList = [] as Array<{ id: string; path: string }>;
  return {
    addAudio: (path: string) => {
      let id = Date.now().toString();
      audioList.push({ id, path });
      return id;
    },
    removeAudio: (id: string) => {
      audioList = audioList.filter((au) => au.id != id);
    },
    getAudio: () => {
      return audioList;
    },
    getAudioById: (id: string) => {
      return audioList.find((au) => au.id == id);
    },
  };
}
