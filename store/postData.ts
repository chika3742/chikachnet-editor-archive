import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import { getCategories, getEntries } from "~/utils/api"
import { Article, Category, ContentType } from "~/plugins/types"

@Module({stateFactory: true, namespaced: true, name: "postData"})
export default class PostData extends VuexModule {
  posts: Article[] = []
  categories: Category[] = []

  @Mutation
  setPosts(posts: Article[]) {
    this.posts = posts
  }

  @Mutation
  setCategories(categories: Category[]) {
    this.categories = categories
  }

  @Action
  async fetchPosts() {
    const result = await getEntries(ContentType.blogPost)
    this.setPosts(result)
  }

  @Action
  async fetchCategories() {
    const result = await getCategories()
    this.setCategories(result)
  }
}