import { useAtom } from "jotai";
import { singleRoom } from "@Atoms/singleRoom";


const linkPattern = /(((https?:\/\/)|(www\.))[^\s]+)/gi; // Regular expression to match URLs

const useFindActiveRoomLinks = () => {
  const [display] = useAtom(singleRoom);

  const fetchLinks = async () => {
    try {
      // Fetch conversations using ConversationService
      const conversations = []

      const findLinks = (messages: any[]) => {
        const result = [];
        for (const message of messages) {
          const links = [];
          // Check if the message contains a link
          if (typeof message.message === "string") {
            const matches = message.message.match(linkPattern);
            if (matches) {
              for (const match of matches) {
                links.push({
                  id: message._id,
                  type: "Link",
                  created_at: message.created_at,
                  link: match,
                });
              }
            }
          }
          if (links.length > 0) {
            result.push(...links);
          }
        }
        return result;
      };

      return findLinks(conversations);
    } catch (error) {
      console.error("Error fetching links:", error);
      return [];
    }
  };

  return { fetchLinks };
};

export default useFindActiveRoomLinks;
