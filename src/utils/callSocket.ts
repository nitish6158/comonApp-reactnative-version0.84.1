export function parseSocketMessage<T>(message: T | string): T | null {
  if (typeof message !== "string") {
    return message;
  }

  try {
    return JSON.parse(message) as T;
  } catch (error) {
    console.log("Unable to parse socket message", error);
    return null;
  }
}
