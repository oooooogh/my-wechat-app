# 表情包大全 · 微信小程序

基于 **Vue 2 + uni-app** 的表情包浏览、搜索、收藏与在线合成小程序。用户可浏览与搜索热门表情包 / 影视套图、收藏到个人收藏夹，并在「拓展」页用 Canvas 完成加文字、叠图、裁剪、马赛克四类编辑后保存到相册。

## 项目背景

课程作业项目（微信小程序端），前端由本人开发，本仓库为整理后的个人维护版本。

- **前端**：Vue 2 + uni-app，含 17 个页面、3 个自封装组件与 1 个微信原生自定义组件
- **后端**：Spring Boot 服务（独立部署），接口约定见下文
- **本仓库完成的工作**：统一请求层重构（13 个页面、22 处请求收敛）、19 处缺陷修复、App 端权限最小化、项目文档补全

> 作业提交期间代码曾随小组仓库一并提交，本仓库为作者本人整理、并完成上述重构后的版本。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 2.6 + uni-app 2.x（`@dcloudio/vue-cli-plugin-uni`） |
| 构建 | Vue CLI 5（webpack 5）+ `cross-env` 多平台变量 |
| 状态 | 页面 `data()` + `uni.setStorageSync` 持久化 + `uni.$emit/$on` 跨页事件总线 |
| 网络 | 自封装 `src/utils/request.js`（Promise 包装 + 全局 `uni.addInterceptor` 鉴权拦截） |
| 渲染 | Canvas 2D 图层模型（`uni.createCanvasContext`） |
| 组件 | 自研 `Uploader` / `Searchbar` / `v-icon` + 微信原生自定义组件 `color-picker` + weUI 半屏弹窗 |

## 目录结构

```
src
├── config/index.js            # 环境与接口配置（baseUrl / timeout / useMock 双通道开关）
├── utils/request.js           # 统一请求层：鉴权注入、响应剥壳、401 静默登出、错误归一化
├── main.js                    # 入口：注册全局图标组件 + 安装请求拦截器
├── pages.json / manifest.json # 页面路由、tabBar、平台能力与权限声明
├── components
│   ├── Uploader/Uploader.vue  # 双形态组件（上传占位 / Canvas 编辑），尺寸自适应
│   └── Searchbar/Searchbar.vue# 受控搜索组件（computed 模糊过滤 + 失焦延迟）
├── static/components
│   ├── v-icon/                # 字体图标组件（全局注册为 <v-icon>）
│   └── color-picker/          # 微信原生自定义组件（取色盘）
└── pages
    ├── home/                  # 首页：轮播、公告、热门表情包 / 影视套图、授权登录
    ├── extension/             # 核心：Canvas 表情包编辑器（文字/叠图/裁剪/马赛克）
    ├── text_search/           # 影视作品内文字搜索
    ├── hotexpression/ hotfilm/ searchdetail/   # 合集与搜索列表
    ├── expdetail/ filmdetail/                  # 表情包 / 影视套图详情与收藏
    ├── favourites/ favourite_exp/ favourite_films/ myexpressions/  # 收藏与个人页
    └── modification/ nameedit/ signatureedit/ aboutus/ agreement/   # 资料与静态页
```

## 核心实现

### 1. 统一请求层与鉴权拦截（`src/utils/request.js`）

- **地址收敛**：所有业务请求传相对路径，由 `buildUrl()` 统一拼接 `config.baseUrl`，替换原先散落在 13 个页面、共 21 处的 `http://localhost:8080` 硬编码。
- **鉴权注入**：`authHeader()` 从 `uni.getStorageSync('token')` 读取凭证，注入 `AccessToken` 请求头；同时通过 `uni.addInterceptor('request', ...)` 对**存量裸调用**做兜底，新老代码共用同一套鉴权。
- **响应剥壳**：后端存在两种返回形态（`{ code, message, data }` 包裹体与裸数组），请求层统一判定——对象且含 `data` 字段则取 `body.data`，否则原样返回，业务层不再关心包装差异。
- **异常归一化**：非 2xx 按 404 / 5xx / 其他分级给出可读提示；网络失败统一提示；`401/403` 清除 `token`、`userId` 并提示重新登录，配合 `sessionExpiredLock` 去重避免并发请求重复弹窗。

### 2. Canvas 图层化编辑器（`src/pages/extension/extension.vue`）

- 三类图层（背景图 / 文字 / 叠图）统一为 `layers` 数组，`redrawCanvas()` 作为唯一重绘出口；用 `Promise.all` 编排绘制任务，并在 `ctx.draw()` 回调中保证「清屏 → 绘制 → 截图」的时序正确（裁剪截图前先隐藏裁剪框 UI）。
- 撤销基于 `history` 状态栈：文字 / 叠图按图层出栈重绘，裁剪 / 马赛克按历史图片路径回滚。
- 裁剪框支持 8 个控制点缩放与整体拖动，触摸命中区（15px）大于视觉尺寸（7px）以提升可点性；拖动重绘采用 20ms 时间戳节流，马赛克涂抹采用定时器锁节流。
- 输入与边界防御：裁剪宽高做有限性与上下限校验，截图前二次校验裁剪区域合法性。

### 3. 跨端组件复用

- `Uploader` 以 `mode` prop（`Uploader` / `Canvas`）+ `validator` 声明双形态，子组件只负责选图、画布尺寸自适应与触摸事件上抛，业务语义留在父页面。
- `Searchbar` 为纯受控组件（`searchData` 入、`@selected` 出），被首页、合集页、搜索页、文字搜索页 4 处复用。
- 微信原生自定义组件 `color-picker` 通过 `pages.json` 的 `mp-weixin.usingComponents` 声明式挂载，宿主页面把 `wx.getSystemInfo` 换算出的 `rpxRatio` 注入组件以对齐 750rpx 设计稿。

### 4. 真实接口 + 自动降级双通道

`config.useMock` 是唯一的数据通道开关：

- **`false`（默认）**：页面请求真实后端接口。**后端没启动或网络不通时自动降级**——请求层只打一行 `console.warn` 并 reject，页面 `data()` 里的兜底数据继续渲染，因此既不弹错误提示也不白屏，"没连后端"时界面照常可用。
- **`true`**：完全不发请求，只用本地数据（只调界面、不想启动后端时打开）。

具体降级规则：

| 情况 | 行为 |
| --- | --- |
| 后端不可达（网络层失败） | 静默降级 → 保留兜底数据 + `console.warn`，不弹提示 |
| 后端返回 4xx / 5xx | 说明服务在，按 404 / 5xx 分级提示，便于定位问题 |
| 401 / 403 | 清除 `token`、`userId` 并提示重新登录（去重，避免并发重复弹窗） |
| 用户主动发起的写操作失败（收藏、保存资料） | **明确提示失败**，不会静默无响应 |

## 本地运行

```bash
npm install
npm run serve              # 微信小程序开发模式（产物在 dist/dev/mp-weixin）
npm run dev:h5             # H5 开发模式
npm run build:mp-weixin    # 微信小程序生产构建
```

微信开发者工具导入 `dist/dev/mp-weixin` 目录预览。

## 后端接口约定

| 模块 | 方法与路径 |
| --- | --- |
| 登录 / 用户 | `POST /api/auth/wechat/login`、`GET /api/user/me`、`PUT /api/users/getProfile` |
| 首页 | `GET /api/home`、`GET /api/banners`、`GET /api/announcements` |
| 表情包 | `GET /api/emojis/GetAllEmojis`、`GET /api/emojis/collection/{id}`、`GET /api/emojis/search?keyword=` |
| 影视套图 | `GET /api/collections/films/details`、`GET /api/collections/top/films?topN=` |
| 收藏 | `GET/POST/DELETE /api/user-favorite-emojis`、`GET/POST/DELETE /api/user-favorite-collections` |

## 已知限制

- 登录、资料修改、收藏等写操作的请求体形状（扁平结构）**尚未与后端逐接口核对**；`expdetail`、`filmdetail` 的收藏接口在原代码中曾存在 `{ collectData: DATA }`、`{ AccessToken: uerId }`、`PATCH { isCollect }` 等多种不一致写法，接入真实后端时需确认契约。
- 「拓展」页的「合成表情收藏到服务器」与「我合成的表情包」页缺少后端接口定义，当前为占位实现。
- 项目无 ESLint / 单元测试 / CI 配置；`npm run test:*` 脚本来自脚手架，尚无测试用例。
- `package.json` 中 `vuex`、`flyio`、`lunr` 三个依赖当前未被引用。
- 微信原生组件（`color-picker`、`mp-half-screen-dialog`）与 `<icon>` 标签仅在小程序端可用，H5 端需做条件编译或替换。
