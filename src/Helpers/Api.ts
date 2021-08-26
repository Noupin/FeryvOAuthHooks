//First Party Imports
import { FERYV_OAUTH_URL } from "../constants";
import { Configuration, ConfigurationParameters, AuthenticateApi } from "../Swagger";


export const AuthenticateAPIFactory = (apiKey?: string, config?: ConfigurationParameters) => {
  const conf: ConfigurationParameters = {
    basePath: FERYV_OAUTH_URL,
    credentials: 'include',
    apiKey: apiKey,
    ...config
  }
  return new AuthenticateApi(new Configuration(conf))
}


export class API{
  private key: string

  constructor(apiKey?: string){
    if(!apiKey){
      this.key = ""
    }
    else{
      this.key = `Bearer ${apiKey}`
    }
  }

  get apiKey(){
    return this.key
  }

  set apiKey(apiKey: string){
    if(!apiKey){
      this.key = ""
    }
    else{
      this.key = `Bearer ${apiKey}`
    }
  }

  get Authenticate(){
    return AuthenticateAPIFactory(this.apiKey)
  }
}