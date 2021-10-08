/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import Config from '~/store/config'
import postData from '~/store/postData'

let postDataStore: postData
let configStore: Config

function initializeStores(store: Store<any>) {
  postDataStore = getModule(postData, store)
  configStore = getModule(Config, store)
}

export {postDataStore, configStore, initializeStores}