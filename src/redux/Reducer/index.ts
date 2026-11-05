import { combineReducers } from "redux";
import CallReducer, { callPersister } from "./CallReducer";
import ChatReducer, { chatPersister } from "./ChatReducer";
import ContactReducer, { contactPersister } from "./ContactReducer";
import OrganisationReducer, { organisationPersister } from "./OrganisationsReducer";
import SocketSlice from "./SocketSlice";
import languageSlice, { languagePersister } from './LanguageReducer'
import { persistReducer } from "redux-persist";
import TaskReducer from './TaskReducer';


const Reducers = combineReducers({
  Chat: persistReducer({key:'Chat',storage:chatPersister},ChatReducer),
  Contact: persistReducer({ key: 'Contact', storage: contactPersister }, ContactReducer),
  Calls: persistReducer({ key: 'Calls', storage: callPersister }, CallReducer),
  Organisation: persistReducer({ key: 'Calls', storage: organisationPersister }, OrganisationReducer),
  appLanguage:persistReducer({ key: 'Language', storage: languagePersister }, languageSlice),
  appSocket:SocketSlice,
  Task: TaskReducer,
});

export type RootState = ReturnType<typeof Reducers>;
export default Reducers;
