<template>
  <ArticleEditor :entry="article" contentType="blogPost" />
</template>

<script lang="ts">
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
    this.$store.dispatch("postData/fetchCategories")
  },
  methods: {
    async fetchArticle() {
      const article = await getSingleArticle(this.$route.params.articleSlug)
      this.article = article
    },
  }
})
</script>