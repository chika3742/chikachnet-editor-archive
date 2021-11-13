module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'prettier'
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'vue/html-closing-bracket-newline': [2, { multiline: 'never' }],
    'no-extra-parens': 1,
    'no-multi-spaces': 1,
    'no-unreachable': 1,
    'no-multiple-empty-lines': [1, { max: 1 }],
    'func-call-spacing': [2, 'never'],
    'no-unneeded-ternary': 2,
    semi: [2, 'never'],
    'no-var': 1,
    indent: ["warn", 2, {"SwitchCase": 1}],
    'space-in-parens': [2, 'never'],
    'no-console': 0,
    'comma-spacing': 2,
    'computed-property-spacing': 2,
    'key-spacing': 2,
    'keyword-spacing': 2,
    'no-unused-vars': 1,
    'vue/require-prop-types': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/attribute-hyphenation': 0,
    'eqeqeq': 0,
    'require-await': 1,
    'node/handle-callback-err': 1,
    '@typescript-eslint/no-unused-vars': 1,
    'no-use-before-define': 0,
    'vue/multi-word-component-names': 0,
  }
}
