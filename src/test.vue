<template>
	<VApp class="loader-ctn">
		<Transition v-if="problem || loading" name="loaderAnim">
			<VLayout align-center class="start-overlay darker" justify-center>
				<div v-if="!problem" class="logo-icon">
					<svg
						preserveAspectRatio="xMinYMin meet"
						viewBox="0 0 100 100"
						xmlns="http://www.w3.org/2000/svg"
						v-html="require('@/assets/img/logo-icon.svg')"
					></svg>
				</div>
				<Fai
					v-else-if="update"
					:icon="['far','cloud-download-alt']"
					class="danger--text mr-3"
					size="5x"
				></Fai>
				<Fai
					v-else
					:icon="['far','times-hexagon']"
					class="danger--text mr-3"
					size="5x"
				></Fai>

				<div v-if="problem">
					<div v-if="maintenance" class="display-1">Maintenance</div>
					<div v-else-if="update" class="display-1">Update Downloaded</div>
					<div v-else class="display-1">Something went wrong :(</div>

					<div class="fw-bold number danger--text">
						{{ problem }}
						<div v-if="problem.indexOf('whitelist') !== -1" class="mt-3">
							<VBtn class="has-glow ma-0" color="primary" href="/auth">
								<span class="py-2">
									<Fai :icon="['fas', 'sign-in']" class="mr-2 icon-svg" size="lg"></Fai>Login via OPSkins
								</span>
							</VBtn>
						</div>
					</div>
				</div>
			</VLayout>
		</Transition>

		<Interface v-if="connected" :loading.sync="loading"></Interface>
	</VApp>
</template>

<script>
// import { close as closeToast } from './components/toast'
import { Errors } from './utils'

import socket from './modules/socket'
import Auth from './modules/auth'

import Interface from '@/views/interface'

const getConfig = () =>
	new Promise((resolve, reject) => {
		socket.emit('config.get', (err, resp) => {
			if (err) reject(new Error(err))
			resolve(resp)
		})
	})

export default {
	name: 'LoadingOverlay',
	components: {
		Interface
	},
	data() {
		return {
			connected: false,
			disconnected: false,
			loading: true,
			problem: false,
			maintenance: null,
			reconnectAttempt: 0,
			update: false
		}
	},
	beforeMount() {
		// wait for socket to connect
		socket.on('connect', () => {
			// reset
			this.reconnectAttempt = 0
			this.problem = false

			if (this.disconnected) {
				this.disconnected = false
				// closeToast()
			}

			console.log('Connected to server, initilizing app!')

			Promise.all([getConfig(), Auth.init()])
				.then(values => {
					console.log('Got config and auth', values)
					const config = values[0]
					const auth = values[1]

					if (auth.authenticated) {
						auth.user.keys = 0
						this.$ga.set('userId', auth.user.steamID)
					}

					// this.$store.config = config
					// this.$store.auth = auth
					this.processConfig(config, auth)

					if (!this.problem) this.connected = true
				})
				.catch(err => {
					this.$toast.open({
						type: 'error',
						title: 'Couldnt Load Config/Auth',
						text: `${this.$t(`errors.${Errors[err.message]}`)} (${err.message})`
					})
				})
		})

		socket.on('config.changed', resp => {
			const config = resp.data
			this.processConfig(config, this.$store.auth)
			if (!this.problem && !this.connected) this.connected = true

			this.$store.config = config
		})

		socket.on('reconnecting', attempt => {
			console.warn('Trying to reconnect, attempt:', attempt)
			this.reconnectAttempt = attempt

			if (this.reconnectAttempt === 2) {
				this.$toast.open({
					type: 'error',
					closeable: false,
					timeout: 0,
					sound: false,
					loading: true,
					text: 'You have lost connection to the server. Reconnecting..'
				})
			}

			if (this.reconnectAttempt >= 3) {
				this.problem =
					'Connection with the server was lost. Make sure you are online or try again later.'
			}
		})

		socket.on('disconnect', () => {
			if (this.disconnected) return
			this.disconnected = true
		})

		// window.addEventListener('updateAvailable', () => {
		//   this.loading = true
		//   this.update = true
		//   this.problem = 'An update has been found, reloading site...'

		//   setTimeout(() => location.reload(), 2000)
		// })
	},
	methods: {
		// hyperdisgusting
		processConfig(config, auth) {
			if (config.whitelist.enabled) {
				const inWhitelist = auth.authenticated
					? config.whitelist.list
							.map(i => i.steamID)
							.includes(auth.user.steamID)
					: false
				if (!inWhitelist) this.problem = 'You are not on the whitelist.'
			} else {
				this.problem = false
			}

			if (config.maintenance.active) {
				this.maintenance = true
				if (!auth.user || auth.user.rank !== 1) {
					this.problem = config.maintenance.info
				}
			} else {
				this.maintenance = false
				this.problem = false
			}
			return true
		}
	}
}
</script>

<style lang="scss" scoped>
@import './styles/variables.scss';

.loader-ctn {
	overflow: hidden;
}

.start-overlay {
	position: absolute;
	width: 100vw;
	height: 100vh;
	z-index: 999;

	.logo-icon {
		width: 20vw;
		max-width: 250px;
		animation: loading-bounce 2.5s ease infinite;
		transition: all 0.3s ease;
	}
}

// loader animation out
.loaderAnim-leave-active {
	overflow: hidden;
	transition: transform 1s cubic-bezier(0.9, 0, 0, 0.9);

	.logo-icon {
		animation: spinOut 0.3s ease forwards;
	}
}
.loaderAnim-leave {
	transform: translateY(0);
}
.loaderAnim-leave-to {
	transform: translateY(100%);
}

@keyframes spinOut {
	from {
		transform: none;
	}
	to {
		transform: scale(0) rotate(45deg);
	}
}

@keyframes loading-bounce {
	0% {
		transform: rotate(0deg);
	}

	10% {
		transform: translate(-10px, -15px) rotate(-3deg);
	}
	14% {
		transform: translate(-10px, 0) rotate(0);
	}

	70% {
		transform: translate(-10px, 0) rotate(0);
	}
	74% {
		transform: translate(0, -15px) rotate(3deg);
	}

	90% {
		transform: translate(0, 0) rotate(0);
	}

	100% {
		transform: translate(0, 0) rotate(0);
	}
}
</style>


