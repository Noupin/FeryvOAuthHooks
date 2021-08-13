/* eslint-disable react-hooks/exhaustive-deps */
//Third Party Imports
import { useEffect, useRef } from "react";

//First Party Imports
import { AuthenticateApi, Configuration } from "../Swagger";
import { errorCallback, responseCallback } from "../types";


interface IFetchCallbacks{
  onAuthSuccess: responseCallback
  onError: errorCallback
  onAuthError: errorCallback
}

export function fetchHookFactory(callbacks: IFetchCallbacks, config: Configuration){
  const authApi = new AuthenticateApi(config)


  function useFetch<T, U, V>(thisArg: U,
    swaggerFunction: ((requestParameters: T) => Promise<V>) | (() => Promise<V>),
    authDependency: any,
    setData: React.Dispatch<React.SetStateAction<V | undefined>> | ((requestParmaters: V, ...args: any[]) => void),
    setLoading?: React.Dispatch<React.SetStateAction<boolean>>):
    (requestParams?: T, ...args: any[]) => Promise<void>{
  
    const reqAgain = useRef(false)
    const reqParams = useRef<T>()
    const argParams = useRef<any[]>()
  
  
    async function request(){
      const response = await swaggerFunction.call(thisArg, reqParams.current!)
      if(!argParams.current) setData(response);
      else setData(response, ...argParams.current);
    }
  
  
    async function requestAgain(){
      try{
        await request()
      }
      catch(error){
        callbacks.onAuthError(error)
      }
      if(setLoading) setLoading(false)
    }
  
  
    async function authenticate(){
      try{
        const response = await authApi.refresh({})
        reqAgain.current = true
        callbacks.onAuthSuccess(response)
      }
      catch(error){
        callbacks.onAuthError(error)
      }
    }
  
  
    async function fetchCall(requestParams?: T, ...args: any[]){
      if(setLoading) setLoading(true);
  
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
  
      if(setLoading && !reqAgain.current){
        setLoading(false);
        reqAgain.current = false
      }
    }
  
  
    useEffect(() => {
      if(!reqAgain.current) return;
  
      async function req(){
        await requestAgain()
        reqAgain.current = false
        if(setLoading) setLoading(false)
      }
  
      req()
    }, [authDependency])
  
  
    return fetchCall
  }

  return useFetch
}
