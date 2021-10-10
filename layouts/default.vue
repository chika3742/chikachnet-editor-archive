<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template #append>
       <div class="pa-2">
          <v-btn block @click="signOut">ログアウト</v-btn>
       </div>
      </template>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>{{ title }}</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt v-if="!loading" />
        <v-row v-else align="center" class="ma-0">
          <v-progress-circular indeterminate />
          <span class="ml-4">Checking auth state...</span>
        </v-row>
      </v-container>
    </v-main>
    <v-footer
      app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { auth } from '~/plugins/firebase'

export default Vue.extend({
  data () {
    return {
      drawer: false,
      loading: true,
      items: [
        {
          icon: 'article',
          title: '記事',
          to: '/articles'
        },
        {
          icon: 'pages',
          title: '固定ページ',
          to: '/pages'
        },
        {
          icon: 'category',
          title: 'カテゴリー',
          to: '/categories'
        },
        {
          icon: 'photo',
          title: 'メディア',
          to: '/assets'
        },
        {
          icon: 'comment',
          title: 'コメント',
          to: '/comments'
        },
      ],
      title: 'cneditor'
    }
  },
  created() {
    this.$nuxt.$on('setTitle', (title: string) => {
      this.title = title
    })
  },
  mounted() {
    this.loading = false
  },
  methods: {
    signOut() {
      auth.signOut()
    }
  }
})
</script>
