/* eslint-disable react-hooks/exhaustive-deps */

//Third Party Imports
import { useEffect, useRef } from "react";

//First Party Imports
import { errorCallback, responseCallback } from "../types";
import { Configuration,
  ConfigurationParameters, LogoutResponse, RefreshRequest } from "../Swagger";
import { API } from "../Helpers/Api";


export interface ILogoutCallbacks{
  onAuthSuccess: responseCallback
  onError: errorCallback
  onAuthError: errorCallback
  onSecondAuthError: errorCallback
}

export interface ILogoutParams{
  authDependency: any
  setData: React.Dispatch<React.SetStateAction<LogoutResponse | undefined>> | ((requestParmaters: LogoutResponse, ...args: any[]) => void)
  refreshParams?: RefreshRequest
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>
}

export function logoutHookFactory(callbacks: ILogoutCallbacks, config: ConfigurationParameters){

  function useLogout(logoutParams: ILogoutParams): (apiKey: string) => Promise<void>{
    const reqAgain = useRef(false)
    const argParams = useRef<any[]>()
    const api = new API("", new Configuration(config))


    async function request(){
      const response = await api.Authenticate.logout()
      if(!argParams.current) logoutParams.setData(response);
      else logoutParams.setData(response, ...argParams.current);
    }


    async function requestAgain(){
      try{
        await request()
      }
      catch(error){
        callbacks.onSecondAuthError(error)
      }
      if(logoutParams.setLoading) logoutParams.setLoading(false)
    }


    async function authenticate(){
      try{
        const response = await api.Authenticate.refresh(logoutParams.refreshParams ?
          logoutParams.refreshParams : {})
        reqAgain.current = true
        callbacks.onAuthSuccess(response)
      }
      catch(error){
        callbacks.onAuthError(error)
      }
    }


    async function logoutCall(apiKey: string, ...args: any[]){
      if(logoutParams.setLoading) logoutParams.setLoading(true);

      api.apiKey = apiKey
      argParams.current = args

      try{
        await request()
      }
      catch (error){
        if(error.status && error.status === 401){
          await authenticate()
        }
        else{
          callbacks.onError(error)
        }
      }
  
      if(logoutParams.setLoading && !reqAgain.current){
        logoutParams.setLoading(false);
        reqAgain.current = false
      }
    }


    useEffect(() => {
      if(!reqAgain.current) return;

      async function req(){
        await requestAgain()
        reqAgain.current = false
        if(logoutParams.setLoading) logoutParams.setLoading(false)
      }

      req()
    }, [logoutParams.authDependency])


    return logoutCall
  }

  return useLogout
}
