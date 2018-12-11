module.exports = {
  extends: [
    'standard',
    'prettier',
    'prettier/standard',
    'plugin:vue/recommended'
  ],
  plugins: ['import', 'prettier', 'standard', 'vue'],
  parserOptions: {
    ecmaVersion: 2017
  },
  env: {
    node: true,
    es6: true
  },
  rules: {
    'space-before-function-paren': 0,
    'new-cap': 0,
    'prettier/prettier': 1
  }
}
