export type ReplyChatRequest = {
  roomId: string
  cid: string
  message: string
}   

export type ReplyChatResponse = {
  message: string
  success: boolean
}

export type MarkAsReadRequest = {
  roomId: string
  cid: string[]
}

export type MarkAsReadResponse = {
  message: string
  success: boolean
}

export type ChatDeliveredRequest = {
  roomId:string 
  cid:string
}

export type ChatDeliveredResponse = {
  message: string
  success: boolean
}

export type ChangeCallStatusRequest = {
  callId: string; 
  status: string;
  userId: string;
}

export type ChangeCallStatusResponse = {
  message: string
  success: boolean
}

