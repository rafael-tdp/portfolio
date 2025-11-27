declare module '@ioc:Adonis/Core/HttpContext' {
  import type { IncomingMessage, ServerResponse } from 'http'

  export interface HttpContextContract {
    request: any
    response: any
    auth?: any
    params?: any
    // allow indexing to keep it flexible during migration
    [key: string]: any
  }
}

declare module '@ioc:Adonis/Core/Application' {
  const Application: any
  export default Application
}
