<template>
  <v-app dark>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="back"><v-icon>arrow_back</v-icon></v-app-bar-nav-icon>
      <v-app-bar-title>編集 - {{ entry_ ? entry_.title : '' }}</v-app-bar-title>
      <v-spacer/>
      <v-app-bar-nav-icon :disabled="!entry_" :loading="currentAction == 'deletion'" @click="dialog = true"><v-icon>mdi-delete</v-icon></v-app-bar-nav-icon>
      <v-app-bar-nav-icon :disabled="!entry_" :loading="currentAction == 'preview'" @click="openPreview"><v-icon>mdi-eye</v-icon></v-app-bar-nav-icon>
      <v-app-bar-nav-icon :disabled="!entry_" :loading="currentAction == 'save'" @click="save"><v-icon>mdi-floppy</v-icon></v-app-bar-nav-icon>
      <v-btn :loading="currentAction == 'publish'" color="#008700" @click="showPublishDialog">{{ pubText }}</v-btn>
      <!-- <v-btn icon :loading="deleting" :disabled="!entry" v-bind="attrs" v-on="on"><v-icon>mdi-delete</v-icon></v-btn> -->
    </v-app-bar>
    <v-main>
      <v-container>
        <div v-if="!entry" class="center"><v-progress-circular indeterminate size="70" width="5" /></div>
        <v-slide-y-transition>
          <v-col v-show="entry">
            <v-text-field v-if="entry_" v-model="entry_.title" label="タイトル" outlined @keydown="autosave" />
            <v-row class="mx-0">
              <v-text-field v-if="entry_" v-model="entry_.slug" label="URLスラッグ" outlined style="max-width: 300px" @keydown="autosave" />
              <v-spacer />
              <v-select v-if="contentType == 'blogPost' && entry_" v-model="entry_.categoryId" :items="$store.getters['vuexModuleDecorators/postData'].categories" label="カテゴリー" item-text="name" item-value="id" outlined @change="autosave" />
            </v-row>
            <textarea />

            <h3>カバー画像</h3>
            <v-img :src="entry_ && entry_.heroImage ? entry_.heroImage.url : undefined" class="my-4" style="width: 500px" />
            <v-row class="ma-0 mb-8" align="center">
              <v-btn :disabled="!entry_ || !entry_.heroImage"><v-icon>delete</v-icon>削除</v-btn>
              <div style="width: 16px"></div>
              <v-btn :disabled="uploading" @click="selectHeroImage"><v-icon>add_photo_alternate</v-icon>選択</v-btn>
              <div style="width: 16px"></div>
              <v-progress-circular v-if="uploading" indeterminate />
              <div style="width: 16px"></div>
              <span v-if="uploading">{{ uploadProgress }}</span>
            </v-row>

            <v-text-field label="ディスクリプション" outlined counter="20000" auto-grow @keydown="autosave" />
          </v-col>
        </v-slide-y-transition>
        <v-dialog v-model="dialog" max-width="400px">
          <v-card>
            <v-card-title>確認</v-card-title>
            <v-card-text>このエントリを削除しますか？</v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn text @click="dialog = false">キャンセル</v-btn>
              <v-btn text @click="deleteEntry">OK</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialog2" max-width="400px">
          <v-card>
            <v-card-title>確認</v-card-title>
            <v-card-text>{{ pubText == "下書きに戻す" ? "このエントリを非公開にしますか？" : "このエントリを公開しますか？" }}</v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn text @click="dialog2 = false">キャンセル</v-btn>
              <v-btn text @click="publish(pubText != '下書きに戻す')">OK</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-snackbar v-model="snackbar">{{ snackbarText }}</v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { Article, Category, ContentType, Status } from '~/plugins/types'
import { deleteEntry, getPreviewToken, publishEntry, unpublishEntry, updateSingleArticle, uploadAsset } from '~/utils/api'

let mde: any
let timer: NodeJS.Timeout | undefined

export default Vue.extend({
  props: ['entry', 'contentType'],
  data() {
    return {
      currentAction: undefined as string | undefined,
      uploading: false,
      uploadProgress: "",
      snackbar: false,
      snackbarText: "",
      dialog: false,
      dialog2: false,
      entry_: undefined as Article | undefined,
      previewToken: undefined as string | undefined
    }
  },
  computed: {
    pubText() {
      if (this.entry_?.status == Status.updated) return "変更を公開"
      if (this.entry_?.status == Status.draft) return "公開"
      if (this.entry_?.status == Status.published) return "下書きに戻す"
      return "Loading..."
    }
  },
  watch: {
    entry(value) {
      (this as any).$nextTick(() => {
        this.entry_ = this.entry
        mde.value(value.body)
        mde.codemirror.on('change', (this as any).autosave)
      })
    }
  },
  async mounted() {
    const SimpleMDE = require('simplemde')
    mde = new SimpleMDE({
      blockStyles: {
        bold: "__"
      },
      toolbar: [
        "bold",
        "italic",
        "strikethrough",
        "|",
        "heading-2",
        "heading-3",
        "horizontal-rule",
        "|",
        "code",
        "quote",
        "unordered-list",
        "ordered-list",
        "link",
        {
          name: "image",
          title: "Insert image",
          className: "fa fa-image",
          action: (editor: any) => {
            // const el = document.createElement("input")
            // el.setAttribute("type", "file")
            // el.setAttribute("accept", "image/*")
            // el.addEventListener('change', () => {
            //   const reader = new FileReader()
            //   reader.addEventListener('load', () => {
            //     // this.uploadAsset(el.files[0], reader)
            //   }, false)
            //   // reader.readAsDataURL(el.files[0])
            // })
            // el.click()
            const cursor = editor.codemirror.getCursor()
            editor.codemirror.getDoc().replaceRange("\n\n![image]()", cursor)
          }
        },
        "|",
        "preview",
        "side-by-side",
        "fullscreen"
      ]
    })
    this.previewToken = await getPreviewToken()
  },
  methods: {
    autosave() {
      clearTimeout(timer!)
      timer = undefined
      this.entry_!.body = mde.value()
      timer = setTimeout(() => {
        this.save()
      }, 3000)
    },
    async back() {
      if (timer) await this.save()
      this.$router.go(-1)
    },
    async save() {
      try {
        clearTimeout(timer!)
        timer = undefined
        this.currentAction = "save"
        await updateSingleArticle(this.entry_!.sys.id, this.entry_!)
      } catch (e) {
        this.showSnackbar(e.message)
      }
      this.currentAction = undefined
    },
    selectHeroImage() {
      const el = document.createElement("input")
      el.setAttribute("type", "file")
      el.setAttribute("accept", "image/*")
      el.addEventListener('change', async () => {
        this.uploading = true
        try {
          const result = await uploadAsset(el.files![0], (msg) => {
            this.uploadProgress = msg
          })
          this.entry_!.heroImage = result
          this.save()
          this.showSnackbar("アップロードしました")
        } catch (e) {
          this.showSnackbar(e.message)
        }
        this.uploading = false
      })
      el.click()
    },
    openPreview() {
      if (!this.entry_?.categoryId || !this.entry_.slug) {
        this.showSnackbar("カテゴリーとスラッグを設定してください")
      } else if (this.$store.getters['vuexModuleDecorators/postData'].categories.length == 0 || !this.previewToken) {
        this.showSnackbar('読み込みが未完了です')
      } else {
        const categories = this.$store.getters['vuexModuleDecorators/postData'].categories as Category[]
        const categorySlug = categories.find(e => e.id == this.entry_?.categoryId)!.slug
        let url = ""
        if (this.contentType == ContentType.blogPost) {
          url = `https://www.chikach.net/category/${categorySlug}/${this.entry_?.slug}?preview=true&token=${this.previewToken}`
        }
        window.open(url, "preview")
      }
    },
    showPublishDialog() {
      if (!this.entry_?.title || !this.entry_.slug || !this.entry_.categoryId) {
        this.showSnackbar("必須フィールド(タイトル、スラッグ、カテゴリー)を入力してください")
        return
      }
      this.dialog2 = true
    },
    async publish(publish: boolean) {
      if (timer) await this.save()
      this.currentAction = "publish"
      this.dialog2 = false
      try {
        let newEntry: Article
        if (publish) newEntry = await publishEntry(this.entry_?.sys.id!)
        else newEntry = await unpublishEntry(this.entry_?.sys.id!)
        
        this.entry_ = newEntry
        this.showSnackbar(publish ? "公開しました" : "非公開にしました")
      } catch (e) {
        this.showSnackbar(e.response.data.message)
      }
      this.currentAction = undefined
    },
    async deleteEntry() {
      this.dialog = false
      this.currentAction = "deletion"
      try {
        if (this.entry_?.status != Status.draft) await unpublishEntry(this.entry_!.sys.id)
        await deleteEntry(this.entry_!.sys.id)
        this.$router.go(-1)
      } catch (e) {
        this.showSnackbar(e.message)
      }
      this.currentAction = undefined
    },
    showSnackbar(text: string) {
      this.snackbarText = text
      this.snackbar = true
    }
  }
})
</script>