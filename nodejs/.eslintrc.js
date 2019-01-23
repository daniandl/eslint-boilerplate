module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    expect: true
  },
  extends: [
    'airbnb-base',
    'prettier',
  ],
  plugins: ['prettier'],
  parserOptions: {
    sourceType: 'module',
    parser: 'babel-eslint'
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
