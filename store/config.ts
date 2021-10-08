import { Module, Mutation, VuexModule } from "vuex-module-decorators"
import Vuex from 'vuex'

const store = new Vuex.Store<any>({})

@Module({stateFactory: true, dynamic: true, store, namespaced: true, name: "config"})
export default class Config extends VuexModule {
  selectedPosts: number[] = []

  @Mutation
  addSelectedPost() {
    
  }
}