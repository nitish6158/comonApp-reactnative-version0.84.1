import {atom} from 'jotai'

export type AuthAtomType = {
  refresh: string | null
  token: string | null
  mode: string | null
  isMasterAdmin: boolean | null
  user:{
    _id: string
    email: string
    phone: string
    firstName: string
    lastName: string
    iso_code: string
    phoneConfirmed: string
    emailConfirmed: boolean
    profile_img: string
    bio: {
      status: string
      time: number
    }
    status: string
    lastSeen: number
    folders: Array<{
      _id: number
      name: string
      roomId: string[]
    }>
  } | null
}

export const initialAuth:AuthAtomType = {
  token:null,
  refresh:null,
  mode:null,
  isMasterAdmin:null,
  userProfile:null
}

export const AuthAtom = atom(initialAuth)