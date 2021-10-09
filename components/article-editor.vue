<template>
  <v-app dark>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="$router.go(-1)"><v-icon>arrow_back</v-icon></v-app-bar-nav-icon>
      <v-app-bar-title>編集 - {{ entry_ ? entry_.title : '' }}</v-app-bar-title>
      <v-spacer/>
      <v-progress-circular v-if="interval" :value="saveTime">{{ Math.ceil(saveTime * (3 / 100)) }}</v-progress-circular>
      <v-app-bar-nav-icon :disabled="!entry_" :loading="currentAction == 'deletion'"><v-icon>mdi-delete</v-icon></v-app-bar-nav-icon>
      <v-app-bar-nav-icon :disabled="!entry_" ><v-icon>mdi-eye</v-icon></v-app-bar-nav-icon>
      <v-app-bar-nav-icon :disabled="!entry_" :loading="currentAction == 'save'" @click="save"><v-icon>mdi-floppy</v-icon></v-app-bar-nav-icon>
      <v-btn v-if="pubText != ''" :loading="currentAction == 'publish'" color="#008700">{{ pubText }}</v-btn>
      <!-- <v-btn icon :loading="deleting" :disabled="!entry" v-bind="attrs" v-on="on"><v-icon>mdi-delete</v-icon></v-btn> -->
    </v-app-bar>
    <v-main>
      <v-container>
        <div v-if="!entry" class="center"><v-progress-circular indeterminate size="70" width="5" /></div>
        <v-col :style="!entry ? 'display: none' : ''">
          <v-text-field v-if="entry_" v-model="entry_.title" label="タイトル" outlined @keydown="autosave" />
          <v-row class="mx-0">
            <v-text-field v-if="entry_" v-model="entry_.slug" label="URLスラッグ" outlined style="max-width: 300px" @keydown="autosave" />
            <v-spacer />
            <v-select v-if="contentType == 'blogPost' && entry_" v-model="entry_.categoryId" :items="$store.getters['vuexModuleDecorators/postData'].categories" label="カテゴリー" item-text="name" item-value="id" outlined @change="autosave" />
          </v-row>
          <textarea />

          <h3>カバー画像</h3>
          <v-img :src="entry_ && entry_.heroImage ? entry_.heroImage.url : undefined" class="my-4" style="width: 500px" />
          <v-row class="ma-0 mb-8">
            <v-btn :disabled="!entry_ || !entry_.heroImage"><v-icon>delete</v-icon>削除</v-btn>
            <div style="width: 16px"></div>
            <v-btn :disabled="uploading" @click="selectHeroImage"><v-icon>add_photo_alternate</v-icon>選択</v-btn>
            <div style="width: 16px"></div>
            <v-progress-circular v-if="uploading" indeterminate />
          </v-row>

          <v-text-field label="ディスクリプション" outlined counter="20000" auto-grow @keydown="autosave" />
        </v-col>
        <v-snackbar v-model="snackbar">{{ snackbarText }}</v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { Article, Status } from '~/plugins/types'
import { updateSingleArticle, uploadAsset } from '~/utils/api'

let mde: any
let timer: NodeJS.Timeout

export default Vue.extend({
  props: ['entry', 'contentType'],
  data() {
    return {
      currentAction: undefined as string | undefined,
      uploading: false,
      snackbar: false,
      snackbarText: "",
      entry_: undefined as Article | undefined,
      interval: undefined as NodeJS.Timer | undefined,
      saveTime: 0,
    }
  },
  computed: {
    pubText() {
      if (this.entry_?.status == Status.updated) return "変更を公開"
      if (this.entry_?.status == Status.draft) return "公開"
      return ""
    }
  },
  watch: {
    entry(value) {
      (this as any).$nextTick(() => {
        this.entry_ = this.entry
        console.log(this.entry_)
        
        mde.value(value.body)
        mde.codemirror.on('change', (this as any).autosave)
      })
    }
  },
  mounted() {
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
            const el = document.createElement("input")
            el.setAttribute("type", "file")
            el.setAttribute("accept", "image/*")
            el.addEventListener('change', () => {
              const reader = new FileReader()
              reader.addEventListener('load', () => {
                // this.uploadAsset(el.files[0], reader)
              }, false)
              // reader.readAsDataURL(el.files[0])
            })
            el.click()
            // console.log(editor.codemirror.getDoc().replaceRange("[]", editor.codemirror.getCursor()))
          }
        },
        "|",
        "preview",
        "side-by-side",
        "fullscreen"
      ]
    })
  },
  methods: {
    autosave() {
      clearTimeout(timer)
      clearInterval(this.interval!)
      this.entry_!.body = mde.value()
      timer = setTimeout(() => {
        this.save()
      }, 3000)
      this.saveTime = 100
      this.interval = setInterval(() => {
        this.saveTime -= (50 / 2900) * 100
      }, 50)
    },
    async save() {
      clearInterval(this.interval!)
      this.interval = undefined
      try {
        clearTimeout(timer)
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
        await uploadAsset(el.files![0])
        this.showSnackbar("アップロードしました")
        this.uploading = false
      })
      el.click()
    },
    showSnackbar(text: string) {
      this.snackbarText = text
      this.snackbar = true
    }
  }
})
</script>