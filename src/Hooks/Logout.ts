/* eslint-disable react-hooks/exhaustive-deps */

//Third Party Imports
import { useEffect, useRef } from "react";

//First Party Imports
import { errorCallback, responseCallback } from "../types";
import { AuthenticateApi, Configuration,
  ConfigurationParameters, LogoutResponse, RefreshRequest } from "../Swagger";
import { FERYV_OAUTH_URL } from "../constants";


export interface IFetchCallbacks{
  onAuthSuccess: responseCallback
  onError: errorCallback
  onAuthError: errorCallback
  onSecondAuthError: errorCallback
}

export interface IFetchParams<T>{
  authDependency: any
  setData: React.Dispatch<React.SetStateAction<LogoutResponse | undefined>> | ((requestParmaters: LogoutResponse, ...args: any[]) => void)
  refreshParams?: RefreshRequest
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>
}

export function logoutHookFactory(callbacks: IFetchCallbacks, config: ConfigurationParameters){
  const authApi = new AuthenticateApi(new Configuration({basePath: FERYV_OAUTH_URL, ...config}))


  function useFetch<T>(fetchParams: IFetchParams<T>):
  (requestParams?: T, ...args: any[]) => Promise<void>{
  
    const reqAgain = useRef(false)
    const reqParams = useRef<T>()
    const argParams = useRef<any[]>()
  
  
    async function request(){
      const response = await authApi.logout()
      if(!argParams.current) fetchParams.setData(response);
      else fetchParams.setData(response, ...argParams.current);
    }
  
  
    async function requestAgain(){
      try{
        await request()
      }
      catch(error){
        callbacks.onSecondAuthError(error)
      }
      if(fetchParams.setLoading) fetchParams.setLoading(false)
    }
  
  
    async function authenticate(){
      try{
        const response = await authApi.refresh(fetchParams.refreshParams ? fetchParams.refreshParams : {})
        reqAgain.current = true
        callbacks.onAuthSuccess(response)
      }
      catch(error){
        callbacks.onAuthError(error)
      }
    }
  
  
    async function fetchCall(requestParams?: T, ...args: any[]){
      if(fetchParams.setLoading) fetchParams.setLoading(true);
  
      reqParams.current = requestParams
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
  
      if(fetchParams.setLoading && !reqAgain.current){
        fetchParams.setLoading(false);
        reqAgain.current = false
      }
    }
  
  
    useEffect(() => {
      if(!reqAgain.current) return;
  
      async function req(){
        await requestAgain()
        reqAgain.current = false
        if(fetchParams.setLoading) fetchParams.setLoading(false)
      }
  
      req()
    }, [fetchParams.authDependency])
  
  
    return fetchCall
  }

  return useFetch
}
