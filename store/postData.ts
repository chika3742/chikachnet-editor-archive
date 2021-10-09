import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import { AxiosError } from "axios"
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
  async fetchPosts(ctx: any) {
    try {
      const result = await getEntries(ContentType.blogPost)
      this.setPosts(result)
    } catch (e: any) {
      if (typeof e.response == 'object') {
        const status = (e as AxiosError).response?.status
        if (status == 403) {
          ctx.$nuxt.error({ statusCode: 403, message: "The Google account you signed in is not permitted!" })
        } else if (status == 500) {
          ctx.$nuxt.error({ statusCode: 500, message: (e as AxiosError<any>).response?.data.message })
        }
      }
    }
  }

  @Action
  async fetchCategories() {
    const result = await getCategories()
    this.setCategories(result)
  }
}