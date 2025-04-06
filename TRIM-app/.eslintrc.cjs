/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: false, // 分号
        wrapAttributes: false, // 标签属性换行
        printWidth: 100, // 换行长度
        endOfLine: 'auto' // 换行符，windows(回车）和mac（回车+换行）兼容
      }
    ]
  }
}
