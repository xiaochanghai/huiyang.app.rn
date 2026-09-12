# 商城页面迁移

源项目：`E:\zhonghong\dahua-mall-uniapp`。页面已转换为 Expo / React Native 组件，页面入口位于 `src/app/(app)`，共享实现位于 `src/features/mall`。

## 页面入口

| 页面 | Expo 路径 |
| --- | --- |
| 商城登录 | `/pages/login`；`/login` 保留给维修等原业务 |
| 注册 | `/sub-pages/user/register` |
| 首页 | `/pages/home` |
| 分类 | `/pages/product/category` |
| 订单购物车 | `/pages/user/shopping-cart` |
| 我的 | `/pages/user/user-center` |
| 历史订单 | `/sub-pages/order/order-list` |
| 修改密码 | `/sub-pages/user/user-setting/password` |
| 商品详情 | `/sub-pages/product/goods-detail?id=A002` |

Expo 自动省略末尾的 `index`。源项目带 `/index` 的上述链接通过兼容跳转保留查询参数。登录前打开商品链接，登录后会返回对应商品。首页入口 `/(app)` 自动转至商城首页；底部导航为首页、分类、订单、我的。

配套实现了搜索结果、标签商品列表、历史订单详情和活动海报查看，避免指定页面上的入口失效。源项目 `static/logo.png` 与底栏图标已复制至 `assets/mall`。

## 数据与配置

- 使用源项目的 `/xcx/Authorize/*` 和 `/xcx/Yw/*` 接口、租户编号及 `Authorization` / `Token` 请求头；支持 `Data.Data` 响应。
- 默认接口地址来自源项目开发配置：`http://47.87.129.28:6060`。可通过进程环境变量 `EXPO_PUBLIC_MALL_API_URL` 覆盖，修改后重新启动或构建 Expo。
- 当前服务的 HTTPS 探测返回协议错误，因此保留原 HTTP 地址，为该主机配置 Android 域级网络例外和 iOS ATS 精确例外（[Apple 文档](https://developer.apple.com/documentation/BundleResources/Information-Property-List/NSAppTransportSecurity/NSExceptionDomains)）。未全局关闭正式包网络保护。`plugins/with-mall-network.js` 保证重新 prebuild 时配置仍有效，改用 HTTPS 后移除商城 HTTP 例外。调试包保留原有 Metro HTTP 支持。
- 环境变量经 `env.js` 注入运行配置，客户端与原生插件读取同一地址。修改主机或网络策略后需要重新 prebuild 并构建安装原生包，不能仅通过 OTA 生效。当前更改未做真机安装验证。HTTPS Web 部署仍要求后端提供 HTTPS 与跨域支持。
- 商城登录态、记住用户名/密码与原有其他业务的登录存储隔离。退出或修改密码会清理商城登录态及查询缓存。
- 数量增减调用 `Ddjia` / `Ddjian`，直接输入调用 `Ddtiao`，携带已知的订单号与行编号。修改成功后刷新商品和订单；失败显示错误并恢复显示数量。
- 订单地址与备注失焦时保存；提交前主动提交所有数量输入草稿并等待成功，再保存地址与备注、提交订单。此流程不依赖原生输入框失焦。数量保存失败会阻止订单提交。
- 搜索和标签商品列表使用分页查询，偏移量累计接口返回条数；支持触底加载和手动加载更多，对重复商品编码去重，空页停止加载。
- 注册源页面原本只有 TODO，没有可用的注册接口。现已迁移表单和校验，提交后明确显示在线注册尚未开放，不模拟注册成功。

## 验证

启动 `pnpm web --port 8090` 后，可运行 `node scripts/mall-smoke.cjs`。脚本需要 Playwright；可用 `PLAYWRIGHT_MODULE` 指定已有 Playwright 模块路径。

该脚本拦截所有商城接口，使用独立测试数据，不向真实后端提交订单或修改密码。覆盖九个指定页面、旧链接与登录回跳、搜索和标签分页、保持输入焦点时直接提交、数量保存失败阻止下单、订单草稿保存与提交失败/成功、密码确认校验、登出及旧登录入口。截图输出至 `.expo/mall-review`。`node scripts/mall-review-checks.cjs` 另外检查原生网络配置和数量草稿提交顺序。

已完成 Web 手机视口验证和新增文件 ESLint 检查。使用真实账号的接口联调和 Android/iOS 真机验证尚未执行。全项目类型检查仍存在迁移前的旧列表组件、测试全局类型等错误；TypeScript 6 运行检查时还需要 `--ignoreDeprecations 6.0`。
