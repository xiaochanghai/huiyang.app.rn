# 聊天功能依赖清理清单

本文记录删除聊天功能后需要清理的直接依赖。核对日期：2026-09-12；聊天代码删除提交：`7b26f13`。

当前只完成 AI 请求与会话依赖的删除。下列待清理依赖按要求暂时保留，本文不代表已执行卸载。

## 已删除

已从 `package.json` 移除并同步 `pnpm-lock.yaml`：

| 包名 | 原用途 |
| --- | --- |
| `@ai-sdk/anthropic` | Anthropic 模型适配器 |
| `@ai-sdk/react` | React 聊天会话与流式状态 |
| `ai` | AI 请求、消息转换和流式响应 |

## 待删除

以下依赖原先用于聊天模块；聊天源码删除后，当前 `src` 中未发现引用。后续执行清理前应再次检查调用方，避免删除新增业务正在使用的包。

| 包名 | 所属清单 | 原用途 / 清理说明 |
| --- | --- | --- |
| `@expo/ui` | dependencies | 聊天原生界面 |
| `@legendapp/list` | dependencies | 聊天消息列表 |
| `@radix-ui/react-context-menu` | dependencies | Web 右键菜单 |
| `@radix-ui/react-dropdown-menu` | dependencies | Web 下拉菜单 |
| `@radix-ui/react-tooltip` | dependencies | Web 悬浮提示 |
| `css-to-react-native` | dependencies | 聊天样式转换 |
| `expo-blur` | dependencies | 模糊背景 |
| `expo-document-picker` | dependencies | 聊天文件附件；删除时同步移除 `app.config.ts` 中的插件配置 |
| `expo-glass-effect` | dependencies | 原生玻璃效果 |
| `expo-symbols` | dependencies | 聊天系统图标 |
| `lucide-react` | dependencies | 原 Web 聊天图标 |
| `mdast-util-from-markdown` | dependencies | Markdown 解析 |
| `mdast-util-gfm-table` | dependencies | Markdown 表格解析 |
| `micromark-extension-gfm-table` | dependencies | Markdown 表格语法扩展 |
| `react-syntax-highlighter` | dependencies | 代码块高亮 |
| `@types/react-syntax-highlighter` | devDependencies | 代码高亮类型声明 |

## 保留与另行评估

- `lucide-react-native`：商城图标已统一迁移至 `@/components/ui/icons` 的 `FontAwesome` 组件，依赖已移除。
- `expo-image`、`expo-image-picker`、`expo-file-system`、`expo-haptics`、`moti`、`react-native-reanimated`、`react-native-keyboard-controller` 等公共依赖：仍有其他模块调用，保留。
- `expo-system-ui`：虽然已无直接业务引用，但可能涉及主题与框架配置，不纳入本次待删除清单，另行核实。
- `expo-web-browser`：仍在 `app.config.ts` 中注册插件，不纳入本次待删除清单，另行核实其用途。

## 后续执行与验证

1. 重新核对待删除包的源码引用、Expo 插件配置与原生工程配置。
2. 使用 pnpm 移除已确认的包，同步 `package.json`、`pnpm-lock.yaml` 和本地安装；不要只手工删除依赖声明。
3. 移除 `expo-document-picker` 时同步清理 [app.config.ts](../app.config.ts) 中对应插件。原生依赖变更需要重新构建 Android/iOS 安装包并验证，不能仅以 Web 页面通过作为完成依据。
4. 检查锁文件差异，避免顺带升级其他依赖。执行 `git diff --check`、类型检查、Web 启动验证及受影响原生端验证。

2026-09-12 已修复类型检查：移除弃用的 `baseUrl`，显式加载 Jest 与 Node 类型，并适配当前 FlashList、Reanimated 和 React Native API。`pnpm type-check` 已通过，无需额外弃用忽略参数。

相关文件：[依赖清单](../package.json)、[锁文件](../pnpm-lock.yaml)、[商城迁移说明](mall-migration.md)。
