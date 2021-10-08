export default function ({app, nuxt}: any, inject: (funcName: string, callback: Function) => undefined) {
  inject('titleHead', ($nuxt: any, title: string) => {
    $nuxt.$emit('setTitle', title)
    return {
      title
    }
  })
}