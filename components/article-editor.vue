<!--suppress CssInvalidPropertyValue -->
<template>
  <v-app dark>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="back"><v-icon>arrow_back</v-icon></v-app-bar-nav-icon>
      <v-app-bar-title>編集 - {{ entry_.title }}</v-app-bar-title>
      <v-spacer/>
      <v-app-bar-nav-icon :disabled="loading" :loading="currentAction == 'deletion'" @click="dialog = true"><v-icon>mdi-delete</v-icon></v-app-bar-nav-icon>
      <v-app-bar-nav-icon :disabled="loading" :loading="currentAction == 'preview'" @click="openPreview"><v-icon>mdi-eye</v-icon></v-app-bar-nav-icon>
      <v-app-bar-nav-icon :disabled="loading" :loading="currentAction == 'save'" @click="save"><v-icon>mdi-floppy</v-icon></v-app-bar-nav-icon>
      <v-btn :disabled="loading" :loading="currentAction == 'publish'" color="#008700" @click="showPublishDialog">{{ pubText }}</v-btn>
      <!-- <v-btn icon :loading="deleting" :disabled="!entry" v-bind="attrs" v-on="on"><v-icon>mdi-delete</v-icon></v-btn> -->
    </v-app-bar>
    <v-main>
      <v-container v-shortkey="{ save: ['meta', 's'], preview: ['meta', 'p'] }" @shortkey="onShortcut">
        <div v-if="loading" class="center"><v-progress-circular indeterminate size="70" width="5" /></div>
        <v-slide-y-transition>
          <v-col v-show="!loading">
            <v-text-field v-model="entry_.title" label="タイトル" outlined @keydown="autosave" />
            <v-row class="mx-0">
              <v-text-field v-model="entry_.slug" label="URLスラッグ" outlined style="max-width: 300px" @keydown="autosave" />
              <v-spacer />
              <v-select v-if="contentType === 'blogPost'" v-model="entry_.categoryId" :items="$store.getters['vuexModuleDecorators/postData'].categories" label="カテゴリー" item-text="name" item-value="id" outlined @change="autosave" />
            </v-row>
            <textarea />

            <h3>カバー画像</h3>
            <v-img :src="entry_ && entry_.heroImage ? entry_.heroImage.url : undefined" class="my-4" style="width: 500px" />
            <v-row class="ma-0 mb-8" align="center">
              <v-btn :disabled="!entry_ || !entry_.heroImage" :loading="currentAction === 'coverDeletion'" @click="dialog3 = true"><v-icon>delete</v-icon>削除</v-btn>
              <div style="width: 16px"></div>
              <v-btn :disabled="uploading" @click="selectHeroImage"><v-icon>add_photo_alternate</v-icon>選択</v-btn>
              <div style="width: 16px"></div>
              <v-progress-circular v-if="uploading" indeterminate />
              <div style="width: 16px"></div>
              <span v-if="uploading">{{ uploadProgress }}</span>
            </v-row>

            <v-text-field v-model="entry_.description" label="ディスクリプション" outlined counter="20000" auto-grow @keydown="autosave" />

            <v-switch v-model="entry_.enableAd" label="広告を表示する" />
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

        <v-dialog v-model="dialog3" max-width="400px">
          <v-card>
            <v-card-title>確認</v-card-title>
            <v-card-text>カバー画像を削除しますか？</v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn text @click="dialog3 = false">キャンセル</v-btn>
              <v-btn text @click="deleteCover">OK</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="uploadingImage" persistent width="300px">
          <v-card>
            <v-card-title>画像アップロード中</v-card-title>
            <v-card-text>
              {{ uploadProgress }}
              <v-progress-linear indeterminate />
            </v-card-text>
          </v-card>
        </v-dialog>

        <v-dialog width="400">
          <v-card>
            <v-card-title>画像挿入</v-card-title>
            <v-card-text>挿入方法の選択</v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text>ライブラリから挿入</v-btn>
              <v-btn text>新規アップロード</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="embedYouTubeDialog.show" persistent width="400px">
          <v-card>
            <v-card-title>埋め込みURL</v-card-title>
            <v-card-text>
              <v-text-field ref="embedField" v-model="embedYouTubeDialog.url" label="URL" outlined />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text @click="embedYouTubeDialog.show = false">キャンセル</v-btn>
              <v-btn text @click="insertEmbedYouTube">OK</v-btn>
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
import {Article, Category, ContentType, Status} from '~/plugins/types'
import {configStore} from '~/store'
import {
  deleteAsset,
  deleteEntry,
  getPreviewToken,
  publishEntry,
  unpublishEntry,
  updateSingleEntry,
  uploadAsset
} from '~/utils/api'

let mde: any
let timer: NodeJS.Timeout | undefined

export default Vue.extend({
  props: ['entry', 'contentType'],
  data() {
    return {
      currentAction: undefined as string | undefined,
      loading: true,
      uploading: false,
      uploadingImage: false,
      uploadProgress: "",
      snackbar: false,
      snackbarText: "",
      dialog: false,
      dialog2: false,
      dialog3: false,
      embedYouTubeDialog: {
        show: false,
        codemirror: undefined as any,
        url: ""
      },
      entry_: {
        title: "",
        body: "",
        description: "",
      } as Article | undefined,
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
        this.loading = false;
        (this as any).$nextTick(() => {
          mde.value(value.body)
          mde.codemirror.on('change', (this as any).autosave)
        })
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
        {
          name: "text-color",
          title: "Text Color",
          className: "fa fa-tint",
          action: (editor: any) => {
            editor.codemirror.getDoc().replaceSelection(`<span style="color: ">${editor.codemirror.getSelection()}</span>`)
          }
        },
        {
          name: "text-size",
          title: "Text Size",
          className: "fa fa-text-width",
          action: (editor: any) => {
            editor.codemirror.getDoc().replaceSelection(`<span style="font-size: em">${editor.codemirror.getSelection()}</span>`)
          }
        },
        "|",
        "heading-2",
        "heading-3",
        "|",
        "horizontal-rule",
        "code",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        ...this.contentType == 'blogPost' ? [{
          name: "image",
          title: "Insert image",
          className: "fa fa-image",
          action: (editor: any) => {
            const el = document.createElement("input")
            el.setAttribute("type", "file")
            el.setAttribute("accept", "image/*")
            el.setAttribute("multiple", "true")
            el.addEventListener('change', async () => {
              this.uploadingImage = true
              try {
                for (let i = 0; i < el.files!.length; i++) {
                  const result = await uploadAsset(el.files![i], (msg) => {
                    this.uploadProgress = `${msg} (${i + 1} / ${el.files?.length})`
                  })

                  const cursor = editor.codemirror.getCursor()
                  editor.codemirror.getDoc().replaceRange(`\n\n![image](${result.url})`, cursor)
                }
              } catch (e: any) {
                this.showSnackbar(`エラーが発生しました。${e.message}`)
              }
              this.uploadingImage = false
            })
            el.click()
          }
        }] : [],
        {
          name: "embed",
          title: "Embed YouTube",
          className: "fa fa-youtube",
          action: (editor: any) => {
            this.embedYouTubeDialog.codemirror = editor.codemirror
            this.embedYouTubeDialog.show = true
            this.$nextTick(() => {
              this.$nextTick(() => {
                (this.$refs.embedField as any).focus()
              })
            })
          }
        },
        "|",
        "preview",
        "side-by-side",
        "fullscreen"
      ],
      shortcuts: {
        "toggleHeading2": "Cmd-2",
        "toggleHeading3": "Cmd-3",
      }
    })
    this.previewToken = await getPreviewToken()
  },
  methods: {
    onShortcut(e: any) {
      switch (e.srcKey) {
        case "save":
          this.save()
          break
        case "preview":
          this.openPreview()
          break
      }
    },
    autosave() {
      clearTimeout(timer!)
      timer = undefined
      this.entry_!.body = mde.value()
      timer = setTimeout(() => {
        this.save()
      }, 5000)
    },
    async back() {
      if (timer) await this.save()
      this.$router.go(-1)
    },
    async save() {
      clearTimeout(timer!)
      timer = undefined

      try {
        this.currentAction = "save"
        await updateSingleEntry(this.entry_!.sys.id, this.entry_!, this.contentType)
        this.entry_!.status = Status.updated
      } catch (e: any) {
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
          this.entry_!.heroImage = await uploadAsset(el.files![0], (msg) => {
            this.uploadProgress = msg
          })
          await this.save()
          this.showSnackbar("アップロードしました")
        } catch (e: any) {
          this.showSnackbar(e.message)
        }
        this.uploading = false
      })
      el.click()
    },
    openPreview() {
      if ((this.contentType != 'fixedPage' && !this.entry_?.categoryId) || !this.entry_?.slug) {
        this.showSnackbar("カテゴリーとスラッグを設定してください")
      } else if ((this.contentType != 'fixedPage' && this.$store.getters['vuexModuleDecorators/postData'].categories.length == 0) || !this.previewToken) {
        this.showSnackbar('読み込みが未完了です')
      } else {
        let url = ""
        if (this.contentType == ContentType.blogPost) {
          const categories = this.$store.getters['vuexModuleDecorators/postData'].categories as Category[]
          const categorySlug = categories.find(e => e.id == this.entry_?.categoryId)!.slug
          url = `https://www.chikach.net/category/${categorySlug}/${this.entry_?.slug}/?preview=true&token=${this.previewToken}`
        } else if (this.contentType == ContentType.fixedPage) {
          url = `https://www.chikach.net/${this.entry_?.slug}/?preview=true&token=${this.previewToken}`
        }
        window.open(url, "preview")
      }
    },
    showPublishDialog() {
      if (!this.entry_?.title || !this.entry_.slug || (this.contentType == 'blogPost' && !this.entry_.categoryId) || (this.contentType == 'fixedPage' && !this.entry_.description)) {
        this.showSnackbar("必須フィールド(タイトル、スラッグ、カテゴリー)を入力してください")
        return
      }
      this.dialog2 = true
    },
    insertEmbedYouTube() {
      this.embedYouTubeDialog.show = false
      let embedUrl
      try {
        const url = new URL(this.embedYouTubeDialog.url)
        if (url.hostname == "www.youtube.com" || url.hostname == "youtube.com") {
          embedUrl = `https://www.youtube.com/embed/${url.searchParams.get("v")}`
        } else if (url.hostname == "youtu.be") {
          embedUrl = `https://www.youtube.com/embed/${url.pathname.substr(1)}`
        } else if (url.hostname == "vimeo.com") {
          embedUrl = `https://player.vimeo.com/video/${url.pathname.substr(1)}`
        } else {
          throw new Error("YouTube、VimeoのURLを入力してください")
        }
      } catch (e: any) {
        this.showSnackbar("YouTube、VimeoのURLを入力してください")
        this.embedYouTubeDialog.url = ""
        this.embedYouTubeDialog.codemirror = undefined
        return
      }
      const cursor = this.embedYouTubeDialog.codemirror.getCursor()
      this.embedYouTubeDialog.codemirror.getDoc().replaceRange(`/i/${embedUrl}`, cursor)

      this.embedYouTubeDialog.url = ""
      this.embedYouTubeDialog.codemirror = undefined
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
      } catch (e: any) {
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
        configStore.setSelectedPosts(configStore.selectedPosts.filter(e => e.sys.id != this.entry_!.sys.id))
        this.$router.go(-1)
      } catch (e: any) {
        this.showSnackbar(e.message)
      }
      this.currentAction = undefined
    },
    async deleteCover() {
      this.currentAction = "coverDeletion"
      this.dialog3 = false
      try {
        await deleteAsset(this.entry_!.heroImage!.id)
        this.entry_!.heroImage = undefined
        this.save()
        this.showSnackbar("削除しました")
      } catch (e: any) {
        this.showSnackbar("エラーが発生しました。" + e.message)
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
