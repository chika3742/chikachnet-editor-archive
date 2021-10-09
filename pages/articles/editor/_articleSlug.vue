<template>
  <ArticleEditor :entry="article" contentType="blogPost" />
</template>

<script lang="ts">
import { AxiosError } from 'axios'
import Vue from 'vue'
import { Article } from '~/plugins/types'
import { getSingleArticle } from '~/utils/api'

export default Vue.extend({
  layout: 'empty',
  data() {
    return {
      article: undefined as Article | undefined
    }
  },
  head() {
    return (this as any).$titleHead(this.$nuxt, "編集")
  },
  mounted() {
    this.fetchArticle()
    if (this.$store.getters['vuexModuleDecorators/postData'].categories.length == 0) this.$store.dispatch("postData/fetchCategories")
  },
  methods: {
    async fetchArticle() {
      try {
        const article = await getSingleArticle(this.$route.params.articleSlug)
        this.article = article
      } catch (e) {
        this.$nuxt.error({ message: (e as AxiosError<any>).response!.data.message })
      }
    },
  }
})
</script>