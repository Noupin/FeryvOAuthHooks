//First Party Imports
import { errorCallback, responseCallback } from "../types";
import { AuthenticateApi, Configuration,
  ConfigurationParameters, RefreshRequest } from "../Swagger";


export interface IRefreshCallbacks{
  onSuccess: responseCallback
  onError: errorCallback
}


export function refreshHookFactory(callbacks: IRefreshCallbacks, config: ConfigurationParameters){
  const authApi = new AuthenticateApi(new Configuration(config))

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
