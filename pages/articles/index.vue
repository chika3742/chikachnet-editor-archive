<template>
  <ArticleList
    v-if="!error"
    ref="list"
    :headers="headers"
    :posts="postDataStore.posts"
    :selectedItems="configStore.selectedPosts"
    noDataText="記事がありません"
    :loading="loading"
    @rowClick="openEditor"
    @create="create"
    @change="changeSelected"
    @deleteSelected="deleteSelected"/>
  <p v-else>エラーが発生しました。({{ errorMessage }})</p>
</template>

<script lang="ts">
import Vue from 'vue'
import { Article, ContentType } from '~/plugins/types'
import { configStore, postDataStore } from '~/store'
import { createEntry } from '~/utils/api'

export default Vue.extend({
  data() {
    return {
      headers: [
        {
          text: 'タイトル',
          value: 'title',
        },
        {
          text: 'カテゴリー',
          value: 'category',
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
      error: undefined,
      loading: true,
    }
  },
  head() {
    return (this as any).$titleHead(this.$nuxt, '記事')
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
    this.fetchPosts()
  },
  methods: {
    async fetchPosts() {
      await postDataStore.fetchPosts(this)
      this.loading = false
    },
    openEditor(item: Article) {
      this.$router.push(`/articles/editor/${item.sys.id}`)
    },
    async create() {
      const result = await createEntry(ContentType.blogPost)
      this.$router.push(`/articles/editor/${result.id}`)
    },
    deleteSelected() {

    },
    changeSelected(value: Article[]) {
      configStore.setSelectedPosts(value)
    }

  }
})
</script>
