const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const BASE_URL = {
	development: 'http://localhost:8080',
	production: 'https://your-domain.com'
}

export default {
	env: ENV,

	// 后端地址：全项目唯一出口，换域名只改这里
	baseUrl: BASE_URL[ENV],

	// 单次请求超时（毫秒）
	timeout: 10000,

	// 数据通道开关：
	//   false（默认）：请求真实接口；后端不可达时静默降级，页面继续用 data() 里的兜底数据，不弹错、不白屏
	//   true          ：完全不发请求，只用本地数据（只调界面、不想启动后端时打开）
	useMock: false
}
