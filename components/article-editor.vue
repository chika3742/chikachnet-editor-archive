<template>
  <v-app dark>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="$router.go(-1)"><v-icon>arrow_back</v-icon></v-app-bar-nav-icon>
      <v-app-bar-title>編集</v-app-bar-title>
      <v-spacer/>
      <v-app-bar-nav-icon :loading="currentAction == 'deletion'"><v-icon>mdi-delete</v-icon></v-app-bar-nav-icon>
      <v-app-bar-nav-icon ><v-icon>mdi-eye</v-icon></v-app-bar-nav-icon>
      <v-app-bar-nav-icon :loading="currentAction == 'save'"><v-icon>mdi-floppy</v-icon></v-app-bar-nav-icon>
      <v-btn :loading="currentAction == 'publish'" color="#008700">公開</v-btn>
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
          <v-text-field label="ディスクリプション" outlined counter="20000" auto-grow @keydown="autosave" />
        </v-col>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

let mde: any

export default Vue.extend({
  props: ['entry', 'contentType'],
  data() {
    return {
      currentAction: undefined as string | undefined,
    }
  },
  computed: {
    entry_() {
      return this.entry
    }
  },
  watch: {
    entry(value) {
      (this as any).$nextTick(() => {
        mde.value(value.body)
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
    mde.codemirror.on('change', (this as any).autosave)
  },
  methods: {
    autosave() {
      console.log("called")
      
    }
  }
})
</script>