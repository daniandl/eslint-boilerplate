// You can use this file to test your the linter/formatter.

export default {
  state: {
    authenticated: false,
    user: null
  },

  get() {
    return this.state
  },

  checkAuth() {
    return new Promise((resolve, reject) => {
      this.socket.emit('auth.get', (err, user) => {
        if (err) return reject(new Error(err))

        this.state.authenticated = !!user
        this.state.user = user
        resolve(this.state)
      })
    })
  },

  init(socket) {
    this.socket = socket
    return this.checkAuth()
  }
}
