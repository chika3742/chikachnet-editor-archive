<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="posts"
      :loading="loading"
      :items-per-page="15"
      :search="search"
      item-key="id"
      show-select
      loading-text="Loading..."
      no-results-text="検索結果なし"
      :no-data-text="noDataText"
      @click:row="onRowClick" >
      <template #top>
        <v-row v-if="selected.length == 0" class="ma-0">
          <v-dialog v-model="dialog2" max-width="400px">
            <template #activator="{on, attrs}">
              <v-btn v-if="!$route.path.includes('comments')" class="ml-6 mt-6" v-bind="attrs" v-on="on">変更した記事を一括公開</v-btn>
            </template>
            <v-card>
              <v-card-title>確認</v-card-title>
              <v-card-text>変更した記事をすべて公開します。</v-card-text>
              <v-divider/>
              <v-card-actions>
                <v-spacer/>
                <v-btn text @click="dialog2 = false">キャンセル</v-btn>
                <v-btn text @click="publishAll">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-text-field v-model="search" class="ma-4" append-icon="mdi-magnify" label="検索" single-line hide-details />
        </v-row>
        <v-row class="ma-0" :class="{hide: selected.length == 0}" align-content="center">
          <v-container>
            <span class="mx-2">{{selected.length}}件を選択</span>
            <v-tooltip bottom>
              <template #activator="{on, attrs}">
                <v-btn fab icon v-bind="attrs" :loading="deleting" v-on="on" @click.stop="dialog = true">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>削除</span>
              <v-dialog v-model="dialog" max-width="300">
                <v-card>
                  <v-card-title>確認</v-card-title>
                  <v-card-text>選択したエントリーを削除しますか？</v-card-text>
                  <v-card-actions>
                  <v-spacer />
                    <v-btn text @click="dialog = false" v-text="'キャンセル'" />
                    <v-btn text @click="deleteSelected" v-text="'OK'" />
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on, attrs}">
                <v-btn fab icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-eye-off</v-icon>
                </v-btn>
              </template>
              <span>非公開</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{on, attrs}">
                <v-btn fab icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
              <span>公開</span>
            </v-tooltip>
        
          </v-container>
        </v-row>
      </template>
      <template #[`item.status`]="{item}">
        <span :class="statusClass(item.status)">{{item.status}}</span>
      </template>
    </v-data-table>
    <v-btn fixed fab style="position: fixed; bottom: 0; right: 0" class="ma-8" :loading="creating" @click="create"><v-icon>post_add</v-icon></v-btn>
    <v-snackbar v-model="snackbar">
      {{snackbarText}}
    </v-snackbar>
  </div>
</template>

<script>
export default {
  props: {
    headers: {
      type: Array,
      required: true
    },
    posts: {
      type: Array,
      required: true
    },
    noDataText: {
      type: String,
      default: ""
    },
    loading: {
      type: Boolean,
      default: true
    },
    selectedItems: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      search: "",
      creating: false,
      deleting: false,
      dialog: false,
      dialog2: false,
      snackbar: false,
      snackbarText: ""
    }
  },
  computed: {
    selected: {
      get() {
        return this.$props.selectedItems
      },
      set(value) {
        this.$emit('change', value)
      }
    }
  },
  methods: {
    onRowClick(item) {
      this.$emit("rowClick", item)
    },
    create() {
      this.creating = true
      this.$emit("create")
    },
    deleteSelected() {
      this.dialog = false
      this.$emit("deleteSelected")
    },
    statusClass(status) {
      if (status == "下書き") return "orange--text"
      if (status == "変更済み") return "blue--text"
      if (status == "公開") return "green--text"
    },
    publishAll() {
      this.dialog2 = false
      this.$parent.loading = true
      const promises = [
        ...this.$store.getters.postEntries?.filter((e) => e.status == "変更あり")?.map((e) => this.$callApi(this, "GET", "publish", {
          id: e.id
        })),
        ...this.$store.getters.fixedPageEntries?.filter((e) => e.status == "変更あり")?.map((e) => this.$callApi(this, "GET", "publish", {
          id: e.id
        }))
      ]
      Promise.all(promises).then(() => {
        return Promise.all([this.$store.dispatch("getPostEntries"), this.$store.dispatch("getFixedPageEntries")])
      }).then(() => {
        this.snackbar = true
        this.snackbarText = "公開しました"
      }).catch((e) => {
        this.snackbar = true
        if (e.response.data.error.name == "required") {
          this.snackbarText = "必須フィールドが未入力です。" + e.response.data.error.details
        } else {
          this.snackbarText = "エラーが発生しました"
        }
      }).finally(() => {
        this.$parent.loading = false
      })
    }
  }
}
</script>

<style lang="scss">
.hide {
  display: none;
}
</style>
