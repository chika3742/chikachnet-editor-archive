<template>
  <div>
    <h2>{{ errorTitle }}</h2>
    <code>
      {{ errorDetail }}
    </code>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    error: {
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      errorTitle: (this as any).getErrorTitle(this.$props.error),
      errorDetail: this.$props.error.message
    }
  },
  head() {
    const title = (this as any).errorTitle
    this.$nuxt.$emit('setTitle', title)
    return {
      title
    }
  },
  methods: {
    getErrorTitle(errorObj: any) {
      if (errorObj.statusCode == 404) return "404 Not Found"
      else return "An error was occured"
    }
  }
})
</script>