<template>
  <div>
    <ArticleList
      ref="list"
      :headers="headers"
      :posts="posts"
      :selectedItems="configStore.selectedPages"
      :serverTotal="total"
      noDataText="固定ページがありません"
      :loading="loading"
      @rowClick="openEditor"
      @create="create"
      @change="changeSelected"
      @deleteSelected="deleteSelected"
      @updatePage="updatePage"/>
    <v-dialog v-model="error" max-width="400" persistent>
      <v-card>
        <v-card-title>エラー</v-card-title>
        <v-card-text>記事一覧の読み込み時にエラーが発生しました。{{ errorMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="fetchPosts(); error = false" >再試行</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Article, ContentType, FixedPage } from '~/plugins/types'
import { configStore } from '~/store'
import { createEntry, getEntries } from '~/utils/api'

export default Vue.extend({
  data() {
    return {
      headers: [
        {
          text: 'タイトル',
          value: 'title',
        },
        {
          text: '投稿日時',
          value: 'postDate',
        },
        {
          text: 'ステータス',
          value: 'status',
        },
      ],
      loading: true,
      posts: [] as FixedPage[],
      total: 0,
      error: false,
      errorMessage: "",
    }
  },
  head() {
    return (this as any).$titleHead(this.$nuxt, '固定ページ')
  },
  computed: {
    configStore: {
      get() {
        return this.$store.getters["vuexModuleDecorators/config"]
      }
    },
    postDataStore: {
      get() {
        return this.$store.getters["vuexModuleDecorators/postData"]
      }
    },
  },
  mounted() {
    // this.fetchPosts()
  },
  methods: {
    // async fetchPosts() {
    //   const error = await postDataStore.fetchPosts(this)
    //   if (error) {
    //     this.error = true
    //     this.errorMessage = error
    //   }
      
    //   this.loading = false
    // },
    openEditor(item: Article) {
      this.$router.push(`/pages/editor/${item.sys.id}`)
    },
    async create() {
      const result = await createEntry(ContentType.blogPost)
      this.$router.push(`/pages/editor/${result.id}`)
    },
    deleteSelected() {
      console.log(configStore.selectedPages)
    },
    async updatePage(pageInfo: any) {
      this.loading = true
      this.posts = []
      const result = await getEntries(ContentType.fixedPage, (pageInfo.page - 1) * 20)
      this.total = result.total
      this.posts = result.list
      this.loading = false
    },
    changeSelected(value: Article[]) {
      configStore.setSelectedPages(value)
    }

  }
})
</script>
