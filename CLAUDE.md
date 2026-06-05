# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

一探科技（1explore）官网 — 一个展示公司服务和案例的静态单页网站。聚焦服务业数字化转型，AI驱动的数据获取与流程自动化。

## 技术栈

- 纯静态站点：无构建系统，直接用浏览器打开 `index.html` 即可
- HTML + CSS + Vanilla JS
- Google Fonts (Noto Sans SC)

## 文件结构

```
index.html   # 主页面，6个 section：hero/about/services/cases/labs/contact
styles.css   # 所有样式
main.js      # 交互逻辑：动态加载 labs.json、导航 active 状态
labs.json    # AI实验室数据（卡片从这动态渲染）
```

## 常用操作

**本地预览**：直接在浏览器中打开 `index.html`，或使用任意静态服务器：

```bash
npx serve .
# 或
python3 -m http.server 8080
```

**添加新实验项目**：编辑 `labs.json`，添加对象：

```json
{
  "id": "3",
  "title": "项目名称",
  "description": "描述",
  "url": "https://...",
  "date": "2026-06"
}
```

占位项目用 `"url": "#"` 代替，页面会自动渲染为半透明不可点击状态。

## 架构说明

- **滚动导航**：使用 Intersection Observer 监听 section，当 section 进入视口一半以上时更新侧边圆点和顶部导航的 active 状态
- **labs 动态加载**：页面加载时 fetch `./labs.json`，然后 renderLabs 将数据渲染为卡片
- **CSS 架构**：全局滚动吸附（scroll-snap）、CSS Grid/Flexbox 布局、大量 CSS 变量用于主题色彩