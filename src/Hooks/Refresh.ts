//First Party Imports
import { errorCallback, responseCallback } from "../types";
import { AuthenticateApi, Configuration,
  ConfigurationParameters, RefreshRequest } from "../Swagger";
import { FERYV_OAUTH_URL } from "../constants";


export interface IRefreshCallbacks{
  onSuccess: responseCallback
  onError: errorCallback
}


export function refreshHookFactory(callbacks: IRefreshCallbacks, config: ConfigurationParameters){
  const authApi = new AuthenticateApi(new Configuration({basePath: FERYV_OAUTH_URL, ...config}))

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
