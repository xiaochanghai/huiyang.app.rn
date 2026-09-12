# 旧业务清理记录

本次范围：生产、库存、设备、维修、质量、分析、物料及旧订单详情。商城代码、兼容跳转与公共功能保留。

## 已删除的代码

- 页面目录：`src/app/production`、`src/app/inventory`、`src/app/equipment`、`src/app/repair-order`、`src/app/quality`、`src/app/analytics`、`src/app/material`、`src/app/order`。
- 示例页面：`src/app/test/equipment.tsx`、`src/app/test/repair-order.tsx`。
- 专属组件目录：`src/components/production`、`src/components/inventory`、`src/components/equipment`、`src/components/repair-order`、`src/components/analytics`。
- 设备类型文件 `src/types/equipment.ts` 及对应导出。
- 无剩余调用方的生产、库存、旧订单图标及对应导出。

`src/app/qr-scanner.tsx` 保留通用扫码和链接打开功能，移除 `Equip_<id>` 跳转设备详情的分支；设备编码现在作为普通文本显示，避免进入已删除的页面。

## 商城兼容路径

`src/app/(app)/production.tsx` 和 `src/app/(app)/inventory.tsx` 已经是商城兼容跳转，分别指向商品分类和购物车，不包含旧业务实现，继续保留。

商城商品、订单、个人中心、登录及通用 API、附件、推送、更新和主题能力未在本次清理范围内。旧生产、库存、设备、维修、质量、分析、物料和订单详情链接不再可用。商城历史订单与详情仍位于 `src/app/(app)/sub-pages/order`，不受影响；`src/app/(app)/order.tsx` 仍作为商城历史订单兼容跳转保留。

## 依赖清理

本次不修改 `package.json` 或锁文件。依赖是否可移除必须依据剩余调用方判断：

- `react-native-chart-kit`：分析模块删除后，当前源码已无引用，列为待删除依赖；按当前要求暂时保留，后续移除时同步依赖清单和锁文件。
- 相机、图片选择、文件查看、动画、列表等公共依赖不随业务页面批量删除。
- 聊天专用依赖继续按 [聊天依赖清理清单](chat-dependency-cleanup.md) 管理。

## 验证

删除路径残留引用检查、商城网络配置与数量保存检查通过，Web 商城登录页已验证。后续已修复公共组件 API 与测试类型配置，全项目 `pnpm type-check` 通过。Android/iOS 真机行为尚未验证。

相关文档：[商城迁移说明](mall-migration.md)、[项目说明](../README.md)。
