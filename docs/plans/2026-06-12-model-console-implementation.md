# Model Console Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将公共模型配置页面重构为左右布局、右侧上下分区的专业仿真控制台。

**Architecture:** 保留 `ModelEditorPage` 的数据流和公共模型定义，通过语义化 class 和少量展示辅助函数重组布局。`CurvePreview` 继续负责 ECharts 生命周期，同时统一专业控制台曲线主题。

**Tech Stack:** React 18、TypeScript、Ant Design 5、TanStack Query、ECharts、Vitest、CSS Grid

---

### Task 1: 公共工作台结构

**Files:**
- Modify: `src/features/model-config/ModelEditorPage.tsx`
- Create: `src/features/model-config/ModelEditorPage.test.ts`

**Steps:**
1. 添加失败测试，要求页面包含目录、曲线主区和参数区的稳定结构标识。
2. 运行定向测试并确认失败。
3. 重组公共模板 JSX，保持原有请求和交互逻辑。
4. 运行定向测试并确认通过。

### Task 2: 专业控制台视觉

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/features/environment/CurvePreview.tsx`
- Modify: `src/features/environment/CurvePreview.test.ts`

**Steps:**
1. 扩充曲线 option 测试，覆盖专业配色与网格配置。
2. 运行定向测试并确认失败。
3. 实现响应式左右工作台、参数网格、列表状态与曲线主题。
4. 运行定向测试和类型检查。

### Task 3: 真实页面验证

**Files:**
- Verify: `src/features/model-config/ModelEditorPage.tsx`
- Verify: `src/styles/global.css`

**Steps:**
1. 使用真实后端数据打开 `/model/wind-power`。
2. 验证模型列表、参数回填、曲线渲染和刷新。
3. 检查桌面与窄屏布局。
4. 运行 `npm test` 和 `npm run build`。
