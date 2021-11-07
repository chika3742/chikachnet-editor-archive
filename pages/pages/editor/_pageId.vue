<template>
  <ArticleEditor :entry="page" contentType="fixedPage" />
</template>

<script lang="ts">
import { AxiosError } from 'axios'
import Vue from 'vue'
import { ContentType, FixedPage } from '~/plugins/types'
import { getSingleEntry } from '~/utils/api'

export default Vue.extend({
  layout: "empty",
  data() {
    return {
      page: undefined as FixedPage | undefined
    }
  },
  head() {
    return (this as any).$titleHead(this.$nuxt, "編集")
  },
  mounted() {
    this.fetchArticle()
  },
  methods: {
    async fetchArticle() {
      try {
        const page = await getSingleEntry<FixedPage>(this.$route.params.pageId, ContentType.fixedPage)
        this.page = page
      }
      catch (e) {
        this.$nuxt.error({ message: (e as AxiosError<any>).response!.data.message })
      }
    },
  }
})
</script>