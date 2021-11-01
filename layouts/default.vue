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
      <v-spacer />
      <v-btn v-show="$route.path == '/comments'" text @click="registerNotification">通知を登録する</v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <v-slide-y-reverse-transition v-if="!loading">
          <Nuxt />
        </v-slide-y-reverse-transition>
        <v-row v-else align="center" class="ma-0">
          <v-progress-circular indeterminate />
          <span class="ml-4">ログイン状態を取得しています...</span>
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
import { getMessaging, getToken } from 'firebase/messaging'
import { auth } from '~/plugins/firebase'
import { addAdminNotificationToken } from '~/utils/api'

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

    navigator.serviceWorker.register('/firebase-messaging-sw.js')
  },
  methods: {
    signOut() {
      auth.signOut()
    },
    registerNotification() {
      getToken(getMessaging(), { vapidKey: "BII3AKi9M1izFih74-PlokYFdK1g1e6i1o8D1z0SP8CoTw0E4d9j3_ahBnwSnXKAx9s7BcQfo8iFoElOoTh6sWI" }).then(token => {
        addAdminNotificationToken(token)
      })
    }
  }
})
</script>
