import config from '@/config'

const UNAUTHORIZED = [401, 403]
const NETWORK_ERROR = '网络似乎出了点问题，请稍后重试'
const SESSION_EXPIRED = '登录已失效，请重新登录'

// 401/403 去重锁：并发请求同时失效时，只弹一次提示、只清一次登录态
let sessionExpiredLock = false

// 从本地存储取登录凭证，包装器与全局拦截器共用同一份逻辑
export function authHeader() {
	const token = uni.getStorageSync('token')
	return token ? { AccessToken: token } : {}
}

/**
 * 全局请求拦截器：给所有 uni.request 调用（包括以后新写的裸调用）兜底注入
 * 鉴权头与超时。平台不支持 addInterceptor('request') 时自动降级，不影响启动。
 */
export function installRequestInterceptor() {
	if (typeof uni.addInterceptor !== 'function') return
	try {
		uni.addInterceptor('request', {
			invoke(args) {
				args.timeout = args.timeout || config.timeout
				args.header = Object.assign({}, args.header, authHeader())
				return args
			}
		})
	} catch (e) {
		console.warn('[request] 拦截器注册失败，已回退到包装器鉴权', e)
	}
}

// 相对路径拼 baseUrl；绝对地址（http/https 开头）原样使用
function buildUrl(url) {
	return /^https?:\/\//.test(url) ? url : config.baseUrl + url
}

// HTTP 状态码归一化为可读提示（网络层失败不走这里，见下方 fail 分支）
function statusMessage(statusCode) {
	if (statusCode === 404) return '接口不存在（404）'
	if (statusCode >= 500) return '服务器开小差了，请稍后再试'
	return `请求失败（${statusCode}）`
}

function onSessionExpired() {
	if (sessionExpiredLock) return
	sessionExpiredLock = true
	uni.removeStorageSync('token')
	uni.removeStorageSync('userId')
	uni.showToast({ title: SESSION_EXPIRED, icon: 'none' })
	setTimeout(() => {
		sessionExpiredLock = false
	}, 1500)
}

/**
 * 统一请求出口。
 *
 * 自动降级策略（页面加载类请求的核心保障）：
 *   - 后端没启动 / 网络不通 → 只打一行 warn 并 reject，页面 catch 里保持 data() 的兜底数据，
 *     不弹错误提示、不白屏。这样「没连后端」时界面照常可用。
 *   - 后端返回 4xx/5xx（说明服务在，是业务或参数问题）→ 正常提示，便于定位。
 *   - 401/403 → 清登录态并提示重新登录。
 *
 * 响应剥壳：后端存在 { code, message, data } 包裹体与裸数组两种返回形态，
 * 这里统一判定，业务层直接拿到数据本身。
 */
export function request(options = {}) {
	const {
		url,
		method = 'GET',
		data = {},
		header = {},
		timeout = config.timeout,
		silent = false
	} = options

	return new Promise((resolve, reject) => {
		uni.request({
			url: buildUrl(url),
			method,
			data,
			timeout,
			header: Object.assign({ 'Content-Type': 'application/json' }, authHeader(), header),
			success: (res) => {
				const statusCode = res.statusCode
				const body = res.data

				if (UNAUTHORIZED.indexOf(statusCode) > -1) {
					// 区分「登录过期」与「本来就没登录」：
					// 前者清登录态并提示重新登录；后者（如未登录浏览首页公开接口）按普通错误处理，
					// 否则会弹出误导性的"登录已失效"
					if (uni.getStorageSync('token')) {
						onSessionExpired()
						reject(new Error(SESSION_EXPIRED))
						return
					}
					const message = (body && body.message) || statusMessage(statusCode)
					if (!silent) uni.showToast({ title: message, icon: 'none' })
					reject(new Error(message))
					return
				}

				if (statusCode < 200 || statusCode >= 300) {
					const message = (body && body.message) || statusMessage(statusCode)
					if (!silent) uni.showToast({ title: message, icon: 'none' })
					reject(new Error(message))
					return
				}

				const payload = body && typeof body === 'object' && !Array.isArray(body) && 'data' in body
					? body.data
					: body
				resolve(payload)
			},
			fail: (err) => {
				// 后端不可达：静默降级，交给页面保留本地兜底数据
				console.warn('[request] 后端不可达，本次已回退本地兜底数据：' + url, err)
				reject(new Error(NETWORK_ERROR))
			}
		})
	})
}

export const get = (url, data, options = {}) => request(Object.assign({ url, method: 'GET', data }, options))
export const post = (url, data, options = {}) => request(Object.assign({ url, method: 'POST', data }, options))
export const put = (url, data, options = {}) => request(Object.assign({ url, method: 'PUT', data }, options))
export const del = (url, data, options = {}) => request(Object.assign({ url, method: 'DELETE', data }, options))

export default request
