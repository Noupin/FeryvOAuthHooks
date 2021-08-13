//First Party Imports
import { RefreshResponse } from "./Swagger"


export type responseCallback = (response: RefreshResponse) => void
export type errorCallback = (err: Error) => void
