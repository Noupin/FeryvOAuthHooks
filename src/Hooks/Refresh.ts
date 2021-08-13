//First Party Imports
import { AuthenticateApi, Configuration, RefreshRequest } from "../Swagger";
import { errorCallback, responseCallback } from "../types";


export interface IRefreshCallbacks{
  onSuccess: responseCallback
  onError: errorCallback
}


export function refreshHookFactory(callbacks: IRefreshCallbacks, config: Configuration){
  const authApi = new AuthenticateApi(config)

  function useRefresh(refreshParams: RefreshRequest={},
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>): () => Promise<void>{
    async function fetchRefresh(){
      if(setLoading) setLoading(true);

      try{
        const response = await authApi.refresh(refreshParams)
        callbacks.onSuccess(response)
      }
      catch(error){
        callbacks.onError(error)
      }

      if(setLoading) setLoading(false);
    }

    return fetchRefresh
  }

  return useRefresh
}
