<template>
  <div>
    <v-card>
      <div v-for="comment in comments" :key="comment.id">
        <div class="pa-4">
          <CommentItem :comment="comment" @edit="edit(comment)" @delete="deleteComment(comment)" />
          <CommentItem v-for="reply in comment.replies" :key="reply.id" class="ml-12" :comment="reply" :isReply="true" @edit="edit(reply)" @delete="deleteComment(reply)" />
        </div>
        <v-divider/>
      </div>
    </v-card>
    <v-row id="loader" justify="center" class="my-6">
      <v-progress-circular v-if="loading" indeterminate />
    </v-row>
    <v-dialog v-model="dialog1" max-width="500px">
      <v-card>
        <v-card-title>編集</v-card-title>
        <v-card-text class="pb-0">
          <v-textarea v-model="editingContent" filled />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="dialog1 = false">キャンセル</v-btn>
          <v-btn text @click="saveCommentEdit">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog2" max-width="400px">
      <v-card>
        <v-card-title>確認</v-card-title>
        <v-card-text>
          本当にコメントを削除しますか？
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="dialog2 = false">キャンセル</v-btn>
          <v-btn text @click="resolve(true); dialog2 = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar"><span>{{ snackbarText }}</span></v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { deleteComment, editComment, getComments } from '~/utils/api'
import { Comment } from '~/plugins/types'

export default Vue.extend({
  data() {
    return {
      comments: [] as Comment[],
      offset: 0,
      loading: true,
      noMore: false,
      snackbar: false,
      snackbarText: "",
      dialog1: false,
      dialog2: false,
      editingComment: undefined as Comment | undefined,
      editingContent: "",
      resolve: undefined as Function | undefined
    }
  },
  head() {
    return (this as any).$titleHead(this.$nuxt, 'コメント')
  },
  watch: {
    dialog2(to) {
      if (!to) this.resolve?.(false)
    }
  },
  mounted() {
    this.fetchComments()
    this.initScrollListener()
  },
  methods: {
    fetchComments() {
      getComments(this.offset).then((result) => {
        this.loading = false
        this.comments = [...this.comments!, ...result.list]
        if (result.list.length == 0) this.noMore = true
        this.comments.forEach(e => {
          e.replies?.reverse()
        })
      })
    },
    initScrollListener() {
      window.onscroll = () => {
        if (!this.loading && !this.noMore && window.scrollY + window.innerHeight >= document.getElementById('loader')!.offsetTop) {
          this.loading = true
          this.offset += 20
          this.fetchComments()
        }
      }
    },
    edit(comment: Comment) {
      this.editingComment = comment
      this.editingContent = comment.content
      this.dialog1 = true
    },
    saveCommentEdit() {
      this.dialog1 = false
      const comment = this.editingComment
      const content = this.editingContent
      editComment(this.editingComment!.id, this.editingContent).then(() => {
        comment!.content = content
        this.showSnackbar("編集しました")
      })
    },
    deleteComment(comment: Comment) {
      this.dialog2 = true
      new Promise((resolve) => {
        this.resolve = resolve
      }).then(async (value) => {
        this.resolve = undefined
        if (value) {
          await deleteComment(comment.id)
          this.comments = this.comments.filter(e => e.id != comment.id)
          this.comments.forEach(e => {
            if (e.replies) e.replies = e.replies.filter(e => e.id != comment.id)
          })
          this.showSnackbar("削除しました")
        }
      }).catch(e => {
        console.error(e)
        this.showSnackbar("エラーが発生しました")
      })
    },
    showSnackbar(text: string) {
      this.snackbar = true
      this.snackbarText = text
    }
  }
})
</script>