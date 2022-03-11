import { ClientStorage, ClientStorageType, HasuraAuthClient } from '@nhost/hasura-auth-js'
import { HasuraStorageClient } from '@nhost/hasura-storage-js'

import { AuthClient } from '../../../hasura-auth-js/node_modules/@nhost/core/src'
import { NhostFunctionsClient } from '../clients/functions'
import { NhostGraphqlClient } from '../clients/graphql'

export interface NhostClientConstructorParams {
  backendUrl: string
  refreshIntervalTime?: number
  clientStorage?: ClientStorage
  clientStorageType?: ClientStorageType
  autoRefreshToken?: boolean
  autoLogin?: boolean
  start?: boolean
  Client?: typeof AuthClient
}

export class NhostClient {
  auth: HasuraAuthClient
  storage: HasuraStorageClient
  functions: NhostFunctionsClient
  graphql: NhostGraphqlClient

  /**
   * Nhost Client
   *
   * @example
   * const nhost = new NhostClient({ url });
   *
   * @docs https://docs.nhost.io/TODO
   */
  constructor({
    backendUrl,
    refreshIntervalTime,
    clientStorage,
    clientStorageType,
    autoRefreshToken,
    autoLogin,
    start = true,
    Client
  }: NhostClientConstructorParams) {
    if (!backendUrl) throw new Error('Please specify a `backendUrl`. Docs: [todo]!')
    this.auth = new HasuraAuthClient({
      url: `${backendUrl}/v1/auth`,
      refreshIntervalTime,
      clientStorage,
      clientStorageType,
      autoRefreshToken,
      autoLogin,
      start,
      Client
    })

    this.storage = new HasuraStorageClient({
      url: `${backendUrl}/v1/storage`
    })

    this.functions = new NhostFunctionsClient({
      url: `${backendUrl}/v1/functions`
    })

    this.graphql = new NhostGraphqlClient({
      url: `${backendUrl}/v1/graphql`
    })

    // set current token if token is already accessable
    this.storage.setAccessToken(this.auth.getAccessToken())
    this.functions.setAccessToken(this.auth.getAccessToken())
    this.graphql.setAccessToken(this.auth.getAccessToken())

    // update access token for clients
    this.auth.onAuthStateChanged((_event, session) => {
      this.storage.setAccessToken(session?.accessToken)
      this.functions.setAccessToken(session?.accessToken)
      this.graphql.setAccessToken(session?.accessToken)
    })

    // update access token for clients
    this.auth.onTokenChanged((session) => {
      this.storage.setAccessToken(session?.accessToken)
      this.functions.setAccessToken(session?.accessToken)
      this.graphql.setAccessToken(session?.accessToken)
    })
  }
}
