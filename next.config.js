/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { dev }) => {
		// On some Windows setups, webpack fs cache can become inconsistent and cause ChunkLoadError.
		if (dev) {
			config.cache = false
		}
		return config
	},
}

module.exports = nextConfig