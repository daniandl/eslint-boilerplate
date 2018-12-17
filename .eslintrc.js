module.exports = {
  root: true,
  env: {
    browser: true
  },
  globals: {
    expect: true
  },
  extends: [
    'airbnb-base',
    'plugin:vue/recommended',
    'prettier',
    'prettier/vue'
  ],
  plugins: ['prettier', 'vue'],
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 4,
        multiline: {
          max: 1,
          allowFirstLine: true
        }
      }
    ]
  }
}
