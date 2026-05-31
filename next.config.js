/** @type {import('next').NextConfig} */
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
	outputFileTracingRoot: path.join(__dirname),
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
					{ key: 'X-DNS-Prefetch-Control', value: 'on' },
				],
			},
		]
	},
}

module.exports = nextConfig
