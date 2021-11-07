import { Module, Mutation, VuexModule } from "vuex-module-decorators"
import Vuex from 'vuex'
import { Article, FixedPage } from "~/plugins/types"

const store = new Vuex.Store<any>({})

@Module({stateFactory: true, dynamic: true, store, namespaced: true, name: "config"})
export default class Config extends VuexModule {
  selectedPosts: Article[] = []
  selectedPages: FixedPage[] = []

  @Mutation
  setSelectedPosts(value: Article[]) {
    this.selectedPosts = value
  }

  @Mutation
  setSelectedPages(value: FixedPage[]) {
    this.selectedPages = value
  }
}