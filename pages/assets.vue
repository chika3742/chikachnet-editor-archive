<template>
  <div>
    <v-row v-if="loading" no-gutters justify="center">
      <v-progress-circular class="mt-12" indeterminate size="80" width="4" />
    </v-row>

    <v-row>
      <v-col v-for="asset in assets" :key="asset.id" class="d-flex child-flex" cols="3">
        <div class="asset-image" @click="showImageDialog(asset)">
          <v-img v-if="asset.url && imageExtensions.some(e => asset.url.endsWith(e))" :src="asset.url" aspect-ratio="1.3" />
          <div v-else style="word-break: break-all;">{{ asset.url ? asset.url.split('/').splice(-1)[0] : 'No URL' }}</div>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog.show" max-width="600">
      <v-card>
        <v-card-title>アセット編集</v-card-title>
        <v-row no-gutters justify="center" class="pa-4">
          <v-img v-if="dialog.asset" class="asset-image__dialog" :src="dialog.asset.url" max-height="500" contain/>
        </v-row>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red" text :loading="dialog.deleting" @click="dialog2 = true">削除</v-btn>
          <v-btn color="blue" text @click="open">開く</v-btn>
          <v-btn text @click="dialog.show = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog2" max-width="400">
      <v-card>
        <v-card-title>確認</v-card-title>
        <v-card-text>アセットを削除しますか？</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog2 = false">キャンセル</v-btn>
          <v-btn color="red" text @click="deleteAsset_">削除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn fixed fab bottom right @click="dialog.show = true">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AssetData } from '~/plugins/types'
import { deleteAsset, getAssets } from '~/utils/api'
export default Vue.extend({
  data() {
    return {
      assets: [] as AssetData[],
      loading: true,
      dialog: {
        show: false,
        asset: null as AssetData | null,
        deleting: false,
      },
      dialog2: false,
      imageExtensions: ['jpg', 'jpeg', 'png', 'gif', 'PNG', 'JPG', 'JPEG', 'GIF', 'webp'],
    }
  },
  head() {
    return (this as any).$titleHead(this.$nuxt, 'メディア')
  },
  mounted() {
    getAssets().then(assets => {
      this.assets = assets
      this.loading = false
    })
  },
  methods: {
    showImageDialog(asset: AssetData) {
      this.dialog.show = true
      this.dialog.asset = asset
    },
    open() {
      window.open(this.dialog.asset?.url, '_blank')
    },
    deleteAsset_() {
      this.dialog2 = false
      this.dialog.deleting = true
      deleteAsset(this.dialog.asset!.id).then(() => {
        this.dialog.show = false
        this.dialog.deleting = false
        this.assets = this.assets.filter(a => a.id !== this.dialog.asset!.id)
      })
    },
  }
})
</script>

<style lang="scss">
  .asset-image {
    cursor: pointer;
    transition: all 0.3s ease;

    &__dialog {
      box-shadow: 0 0 8px #ffffffaa;
      border-radius: 4px;
    }
  }
  .asset-image:hover {
    transform: scale(1.15);
    filter: blur(1px) brightness(1.2);
  }
</style>