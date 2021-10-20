<template>
  <div>
    <v-row no-gutters class="d-flex">
      <div class="mr-4"><v-icon large>account_circle</v-icon></div>
      <v-col class="mr-8" style="flex: 3; min-width: 0">
        <v-row style="opacity: 0.7" no-gutters>
          <span class="mr-2">{{ comment.nickname }}</span>
          ・
          <span class="ml-2">{{ comment.postDate }}</span>
          <v-spacer />
          <v-menu>
            <template #activator="{on, attrs}">
              <v-btn icon v-bind="attrs" v-on="on"><v-icon>more_horiz </v-icon></v-btn>
            </template>
            <v-list min-width="100px">
              <v-list-item @click="$emit('edit')">
                <v-list-item-action class="mr-4"><v-icon>edit</v-icon></v-list-item-action>
                <v-list-item-title>編集</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('delete')">
                <v-list-item-action class="mr-4"><v-icon>delete</v-icon></v-list-item-action>
                <v-list-item-title>削除</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('block')">
                <v-list-item-action class="mr-4"><v-icon>block</v-icon></v-list-item-action>
                <v-list-item-title>このIPからのコメントを非表示</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-row>

        <p :class="{'collapse': !readMore}" style="white-space: pre-wrap">{{ comment.content }}</p>
        <v-row v-if="comment.content.length >= 60" no-gutters><v-spacer /><v-btn small text @click="readMore = !readMore">{{ !readMore ? "続きを読む" : "一部を表示"}}</v-btn></v-row>

      </v-col>
      <span v-if="!isReply" class="mr-4 my-4 link" style="flex: 1" @click="openUrl(comment.entry.url)">{{ comment.entry.title }}<v-icon class="mx-2" small>launch</v-icon></span>
      <span v-else style="flex: 1"></span>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: ['comment', 'isReply'],
  data() {
    return {
      readMore: false,
    }
  },
  mounted() {
  },
  methods: {
    openUrl(url: string) {
      window.open(url)
    }
  }
})
</script>