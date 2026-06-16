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
index.html   # 主页面，6个 section：hero/about/method/work/labs/contact
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

---

## 生产部署

**线上地址：** https://1xplore.cn （2026-06-05 启用 HTTPS）

**服务器：** 阿里云 ECS（47.122.112.224），admin 用户（sudo 免密）

**架构：**
```
Nginx 1.24（80/443）
└── 1xplore.cn / www.1xplore.cn → 反代 → 127.0.0.1:8088
                                     └── python3 -m http.server 8088
                                          └── /home/admin/1xplore.cn/
```

**端口分配：**
| 端口 | 服务 | 进程 cwd | 状态 |
|------|------|---------|------|
| 80/443 | Nginx 1.24 | /usr/sbin/nginx | 运行中 |
| 3000 | Test8 frontend (Vite) | test8/frontend | 运行中 |
| 3001 | Test8 backend (node) | test8/backend | 运行中 |
| 3002 | Test8 OCR (python FastAPI) | test8/backend/ocr_service | 运行中 |
| 3012 | Test12 GeoRanking API (node) | test12-geo-ranking | 运行中 |
| 4000 | Test14 StaffAllocation (node) | test14-staff-allocation | **未运行**（nginx 已配） |
| 8080 | searxng (127.0.0.1 only) | /usr/local/searxng/ | 运行中，**勿占** |
| 8088 | **Test10 静态站** (python http.server) | /home/admin/1xplore.cn | 运行中 |

**部署/重启：**
```bash
ssh admin@47.122.112.224
# 部署新文件（不需要 kill 任何进程，python http.server 直接读盘）
scp index.html styles.css admin@47.122.112.224:/home/admin/1xplore.cn/

# 如果一定要重启 Test10（先找 PID，按端口精确定位）
sudo ss -tlnp 'sport = :8088'    # 拿到 PID
kill <PID>
cd /home/admin/1xplore.cn && nohup python3 -m http.server 8088 > /tmp/1xplore-server.log 2>&1 &

# nginx 改配置后
sudo nginx -t && sudo systemctl reload nginx
```

**避免误杀：**
- ❌ `pkill -f python3` — 会杀 Test10 (8088) + Test8 OCR (3002) + searxng resource tracker
- ❌ `pkill -f node` — 会杀 Test8 backend (3001) + Test12 API (3012)
- ❌ `pkill -f http.server` — 安全但精度差，不如按端口
- ✅ 按端口定位：`sudo ss -tlnp 'sport = :PORT'` 拿 PID 再 kill
- ✅ 改 nginx 配置：永远用 `sudo nginx -t && sudo systemctl reload nginx`，不要 `pkill nginx`（会断连接）

**端口监控（企微通知）：**
- 脚本：`/home/admin/scripts/port-monitor.py`（state 在同目录）
- cron：`*/5 * * * *` 每 5 分钟巡检
- 监控 7 个端口：3000/3001/3002/3012/4000/8080/8088
- 触发条件：服务上线（up）/ 下线（down）/ PID 变化（restart）→ 企微 webhook
- 静默：无变化不发通知
- 日志：`/var/log/port-monitor.log`

**SSL 证书：** acme.sh
- 证书路径：`/etc/nginx/ssl/1xplore.{fullchain.pem,key}`
- 续期：`~/.acme.sh/acme.sh --renew -d 1xplore.cn`

**注意：**
- 1xplore.cn 之前用 Python http.server 跑在 80 端口直接暴露，已迁移到 8088 由 Nginx 反代（更安全）
- labs.json 改后无需重启服务，直接刷新页面即可