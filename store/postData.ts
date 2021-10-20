import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators"
import { AxiosError } from "axios"
import { getCategories, getEntries } from "~/utils/api"
import { Article, Category, ContentType } from "~/plugins/types"

@Module({stateFactory: true, namespaced: true, name: "postData"})
export default class PostData extends VuexModule {
  posts: {[key: number]: Article[]} = {}
  postsServerTotal = 0
  categories: Category[] = []

  @Mutation
  setPosts([index, posts]: [number, Article[]]) {
    this.posts[index] = posts
  }

  @Mutation
  setCategories(categories: Category[]) {
    this.categories = categories
  }

  @Mutation
  setPostsServerTotal(total: number) {
    this.postsServerTotal = total
  }

  @Action
  async fetchPosts([ctx, page]: [any, number]) {
    try {
      const result = await getEntries(ContentType.blogPost, (page - 1) * 20)
      
      this.setPosts([Math.ceil(result.skip / 20) + 1, result.list])
      this.setPostsServerTotal(result.total)
    } catch (e: any) {
      if (typeof e.response == 'object') {
        const status = (e as AxiosError).response?.status
        if (status == 403) {
          ctx.$nuxt.error({ statusCode: 403, message: "The Google account you signed in is not permitted!" })
        } else if (status == 500) {
          ctx.$nuxt.error({ statusCode: 500, message: (e as AxiosError<any>).response?.data.message })
        }
      } else return e.message
    }
  }

  @Action
  async fetchCategories() {
    const result = await getCategories()
    this.setCategories(result)
  }
}