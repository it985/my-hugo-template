# Amigo - 极简朋友圈风格 Hugo 主题 / Minimalist WeChat Moments Hugo Theme

[![Hugo](https://img.shields.io/badge/Hugo-%230076D1.svg?style=flat&logo=hugo&logoColor=white)](https://gohugo.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[中文](#中文) | [English](#english)

---

# 中文

Amigo 是一款为 [Hugo](https://gohugo.io/) 打造的极简博客主题，其设计灵感来源于 **微信朋友圈 (WeChat Moments)**。它旨在提供一个私密、亲切且易于阅读的动态分享空间，支持 PJAX 无刷新加载和多种评论系统。

## ✨ 主题特性

- 📱 **朋友圈 UI**：高度还原微信朋友圈视觉体验，支持九宫格图片展示
- 🖼️ **智能多图布局**：自动适配 1/2/3/4/6/9 张图片排列，支持 Live Photo 混排
- 🎵 **音乐播放器**：集成 Meting API，支持网易云音乐在线播放，PJAX 页面切换音乐不中断
- 🎬 **视频播放器**：支持普通视频和哔哩哔哩视频嵌入，自定义控件
- 🎤 **语音消息**：微信风格语音气泡，自动检测时长
- 📄 **长文章卡片**：首页自动识别长文章，以博客卡片形式展示
- 💬 **朋友圈评论**：Artalk 深度集成，支持点赞、弹幕、IP 归属地显示
- ⏰ **人性化时间**：朋友圈风格时间显示（"刚刚"、"5分钟前"、"昨天"）
- 🚀 **全站 PJAX**：丝滑的无刷新页面切换
- 🌓 **深色模式**：支持手动切换及系统跟随
- 🖼️ **图片灯箱**：集成 ViewImage.js，点击图片放大浏览
- 🎨 **精美排版**：本地化中文字体优化，阅读体验更佳
- 🛠️ **响应式设计**：完美适配手机、平板及桌面端
- 🔍 **搜索功能**：支持本地搜索，无需外部服务

## 📸 预览站点

访问 [Amigo 主题演示站点](https://200181.xyz) 查看实际效果。

## ⚙️ 前置条件

- **Hugo**：建议使用 0.128.2+ 版本
- **评论系统**（三选一）：
  - [Artalk](https://artalk.js.org/)：推荐 2.8.7+，支持点赞、弹幕等完整功能
  - [Twikoo](https://github.com/Mintimate/twikoo-eo)：无需服务器，支持 EdgeOne 部署
  - [Giscus](https://giscus.app/)：基于 GitHub Discussions

### 评论方案选择建议

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 有自己的服务器 | Artalk | 功能最全：点赞、弹幕、IP 归属地 |
| 没有服务器 | Twikoo EO | 免费部署到 EdgeOne，国内访问快 |
| 技术博客 | Giscus | 与 GitHub 深度集成 |

## 🚀 快速开始

### 1. 安装

```bash
git clone https://github.com/zqlit/Hugo-Theme-Amigo.git themes/Amigo
```

### 2. 配置

将主题目录下的 [hugo.toml](./hugo.toml) 复制到站点根目录，或添加以下基本配置：

```toml
theme = "Amigo"

[params]
  username = "您的昵称"
  avatar = "/images/avatar.jpg"
  description = "一句话简介"
  cover = "/images/header.png"

  # 评论模式: "artalk"、"twikoo"、"giscus"、"none"
  commentMode = "artalk"

  # Artalk 配置
  artalkServer = "https://your-artalk-server.com"
  artalkSite = "您的站点名称"
  enableDanmaku = true  # 首页弹幕
```

### 3. 完整配置项

<details>
<summary>点击展开完整配置</summary>

#### 站点基础信息

| 参数 | 说明 | 示例 |
|------|------|------|
| `username` | 显示昵称 | `"Vaica"` |
| `avatar` | 头像地址 | `"/images/avatar.jpg"` |
| `description` | 个人简介 | `"记录生活"` |
| `cover` | 封面图片 | `"/images/cover.jpg"` |
| `headerMedia` | 封面媒体（图片或视频） | `"/videos/bg.mp4"` |
| `favicon` | 浏览器图标 | `"/favicon.ico"` |
| `icp` | IICP 备案号 | `"京ICP备xxxxxxx号"` |

#### 评论系统

```toml
commentMode = "artalk"  # "artalk" / "twikoo" / "giscus" / "none"

# Artalk
artalkServer = "https://artalk.example.com"
artalkSite = "我的博客"
enableDanmaku = true

# Twikoo
twikooEnvId = "your-env-id"
twikooLang = "zh-CN"

# Giscus
giscusRepo = "user/repo"
giscusRepoId = "R_xxxxx"
giscusCategory = "Announcements"
giscusCategoryId = "DIC_xxxxx"
```

#### 功能开关

```toml
showTags = true          # 显示文章标签
showLocation = true      # 显示地点信息
enableSearch = true      # 本地搜索
enableDarkMode = true    # 深色模式切换
enablePjax = true        # PJAX 无刷新加载
enableLightbox = true    # 图片灯箱
```

#### 字体

```toml
fontFamily = "ZQL"  # "ZQL" / "PingFangQiaoMuTi" / "AlimamaFangYuanTi"
```

#### 导航菜单

```toml
[[menu.main]]
  name = "首页"
  url = "/"
  weight = 1

[[menu.main]]
  name = "关于"
  url = "/about.html"
  weight = 2
```

</details>

## 📝 使用指南

### 目录结构

```text
content/
├── posts/           # 朋友圈动态
├── about.md         # 关于页面
└── friends.md       # 友链页面
```

### 撰写动态

```markdown
---
title: "周末去爬山"
date: 2026-02-20
author: "Vaica"
location: "武汉·东湖"
tags: ["生活", "摄影"]
---

今天天气真好，去公园散步。🌸

![photo1.jpg](photo1.jpg)
![photo2.jpg](photo2.jpg)
```

### 多图布局

主题会自动根据图片数量选择最佳布局：

| 图片数量 | 布局 |
|----------|------|
| 1 张 | 居中展示 |
| 2 张 | 左右并排 |
| 3 张 | 三列网格 |
| 4 张 | 2×2 网格 |
| 5-6 张 | 3×2 网格 |
| 7-9 张 | 3×3 九宫格 |

### Shortcodes

#### 音乐卡片 (music-card)

卡片式音乐播放器，支持本地音频和 Meting API：

```markdown
{{< music-card
    src="https://example.com/song.mp3"
    cover="/images/cover.jpg"
    name="歌曲名"
    artist="艺术家"
    accent="#d43c33"
>}}
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `src` | 音频地址（支持 Meting API URL 或直链） | - |
| `cover` | 封面图片 | `/images/default-cover.jpg` |
| `name` | 歌曲名称 | `未知歌曲` |
| `artist` | 艺术家 | `未知艺术家` |
| `accent` | 主题色 | `#d43c33` |

使用 Meting API 时，`src` 填入 API 地址即可自动解析：
```markdown
{{< music-card
    src="https://open.motues.top/music?server=netease&type=song&id=182402"
    name="歌曲名"
    artist="艺术家"
>}}
```

#### 音乐播放器 (music)

基础版音乐播放器，带进度条和上/下一首控制：

```markdown
{{< music
    src="https://example.com/song.mp3"
    cover="/images/cover.jpg"
    name="歌曲名"
    artist="艺术家"
>}}
```

#### 实况照片 (motion-photo)

类似 iPhone 实况照片效果，鼠标悬停播放视频：

```markdown
{{< motion-photo
    image="cover.jpg"
    video="video.mp4"
    alt="描述文字"
    ratio="3/4"
    delay="500"
>}}
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `image` | 封面图片 | - |
| `video` | 视频文件（不填则自动从图片路径推导 .mp4） | - |
| `alt` | 描述文字 | - |
| `ratio` | 宽高比 | `3/4` |
| `delay` | 悬停触发延迟（毫秒） | `500` |

#### 实况照片 - 简洁版 (livephoto)

Apple 风格实况照片，带实况/静音按钮：

```markdown
{{< livephoto image="cover.jpg" video="video.mp4" >}}
{{< livephoto src="photo.avif" >}}
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `image` / `src` | 封面图片 | - |
| `video` | 视频文件（不填则自动推导） | - |
| `alt` | 描述文字 | `Live Photo` |
| `style` | 自定义 CSS | - |

#### 实况照片 - 卡片版 (livephoto-card)

带播放控制、音量调节和进度条的卡片式实况照片：

```markdown
{{< livephoto-card
    src="cover.jpg"
    video="video.mp4"
    caption="图片说明"
>}}
```

#### 视频播放器 (video)

自定义视频播放器，支持播放/暂停、进度条、静音和全屏。同时支持哔哩哔哩视频嵌入：

```markdown
{{< video src="video.mp4" >}}
```

带封面图和自定义比例：

```markdown
{{< video src="video.mp4" poster="cover.jpg" ratio="4/3" >}}
```

自动播放 + 循环：

```markdown
{{< video src="video.mp4" autoplay="true" loop="true" muted="true" >}}
```

哔哩哔哩视频（自动识别 BV 号或 aid）：

```markdown
{{< video src="https://www.bilibili.com/video/BV1xx411c7mu" >}}
{{< video src="https://www.bilibili.com/video/BV1xx411c7mu" page="2" >}}
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `src` | 视频地址（本地路径、外链或 B 站链接） | - |
| `poster` | 封面图 | - |
| `ratio` | 宽高比 | `16/9` |
| `autoplay` | 自动播放 | `false` |
| `loop` | 循环播放 | `false` |
| `muted` | 静音 | `false` |
| `alt` | 无障碍描述 | - |
| `page` | B 站视频分P（仅 B 站） | `1` |

#### 语音消息 (voice)

模仿微信语音消息样式的音频播放器：

```markdown
{{< voice src="audio.mp3" >}}
```

指定时长显示：

```markdown
{{< voice src="audio.mp3" duration="12" >}}
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `src` | 音频地址（MP3 直链或本地路径） | - |
| `duration` | 显示时长（秒），不填则自动获取 | - |

### 长文章卡片

当文章超过 500 字或在 Front Matter 中设置 `isLongArticle: true` 时，首页会以博客卡片形式展示，包含封面图、标题和摘要。

```markdown
---
title: "我的长文章"
isLongArticle: true
cover: "cover.jpg"
---

正文内容...
```

封面图抓取优先级：
1. `cover` 参数（Front Matter 显式设置）
2. `images` 参数第一张
3. 正文 `<img>` 第一张
4. 无图时显示纯文字卡片

### 评论开关

- **Posts**：默认开启，`comments: false` 关闭
- **Pages**：默认关闭，`comments: true` 开启

### 友链配置

创建 `data/friends.yml`：

```yaml
- name: "Vaica"
  url: "https://usj.cc"
  avatar: "https://github.com/zqlit"
  description: "开发者"
```

在 `content/friends.md` 中设置 `layout: "friends"`

## 🛠️ 技术栈

- **SSG**: [Hugo](https://gohugo.io/)
- **Icons**: [Remix Icon](https://remixicon.com/)
- **Comments**: [Artalk](https://artalk.js.org/) / [Twikoo](https://twikoo.js.org/) / [Giscus](https://giscus.app/)
- **Music**: [Meting API](https://github.com/metowolf/MetingJS)
- **JS**: ViewImage.js, PJAX.js

## ☕ 赞赏支持

如果你觉得这个主题还不错，欢迎请作者喝杯咖啡！

<table>
  <tr>
    <td align="center">
      <img src="https://usj.cc/image/reward/new.png" alt="微信赞赏" width="200" /><br />
      微信支付
    </td>
    <td align="center">
      <img src="https://usj.cc/image/reward/alipay.jpg" alt="支付宝" width="200" /><br />
      支付宝
    </td>
  </tr>
</table>

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议。

感谢使用 **Amigo**！如果喜欢，欢迎点个 **Star** ⭐️

---

# English

Amigo is a minimalist [Hugo](https://gohugo.io/) blog theme inspired by **WeChat Moments**. It provides an intimate, easy-to-read space for sharing updates, with PJAX navigation and multi-comment system support.

## ✨ Features

- 📱 **Moments UI**: Faithful recreation of WeChat Moments with grid image layout
- 🖼️ **Smart Grid Layout**: Auto-adapts to 1/2/3/4/6/9 images, supports Live Photo mixing
- 🎵 **Music Player**: Meting API integration, music persists across PJAX page transitions
- 🎬 **Video Player**: Supports regular videos and Bilibili embeds with custom controls
- 🎤 **Voice Message**: WeChat-style voice bubble with auto duration detection
- 📄 **Long Article Card**: Auto-detects long articles and displays as blog cards on homepage
- 💬 **Moments Comments**: Deep Artalk integration with likes, danmaku, IP geolocation
- ⏰ **Human-friendly Time**: WeChat-style display ("just now", "5 min ago", "yesterday")
- 🚀 **PJAX Navigation**: Smooth page transitions without full reloads
- 🌓 **Dark Mode**: Manual toggle with system preference detection
- 🖼️ **Lightbox**: ViewImage.js integration for image zoom
- 🎨 **Typography**: Optimized Chinese font rendering
- 🛠️ **Responsive**: Perfect on mobile, tablet, and desktop
- 🔍 **Search**: Local search, no external service required

## 📸 Demo

Visit the [Amigo Demo Site](https://200181.xyz) to see it in action.

## ⚙️ Prerequisites

- **Hugo**: Version 0.128.2+ recommended
- **Comment System** (choose one):
  - [Artalk](https://artalk.js.org/): Full features (likes, danmaku, IP geolocation)
  - [Twikoo](https://github.com/Mintimate/twikoo-eo): Serverless, deploy on EdgeOne
  - [Giscus](https://giscus.app/): GitHub Discussions based

## 🚀 Quick Start

### 1. Install

```bash
git clone https://github.com/zqlit/Hugo-Theme-Amigo.git themes/Amigo
```

### 2. Configure

Copy [hugo.toml](./hugo.toml) from the theme directory to your site root, or add:

```toml
theme = "Amigo"

[params]
  username = "Your Name"
  avatar = "/images/avatar.jpg"
  description = "A short bio"
  cover = "/images/cover.jpg"
  commentMode = "artalk"
  artalkServer = "https://your-artalk-server.com"
  artalkSite = "My Blog"
```

### 3. Configuration Reference

<details>
<summary>Click to expand full configuration</summary>

#### Site Info

| Param | Description | Example |
|-------|-------------|---------|
| `username` | Display name | `"Vaica"` |
| `avatar` | Avatar URL | `"/images/avatar.jpg"` |
| `description` | Short bio | `"Life recorder"` |
| `cover` | Header image | `"/images/cover.jpg"` |
| `headerMedia` | Header media (image or video) | `"/videos/bg.mp4"` |
| `icp` | ICP registration number | Optional |

#### Comment System

```toml
commentMode = "artalk"  # "artalk" / "twikoo" / "giscus" / "none"

# Artalk
artalkServer = "https://artalk.example.com"
artalkSite = "My Blog"
enableDanmaku = true

# Twikoo
twikooEnvId = "your-env-id"

# Giscus
giscusRepo = "user/repo"
giscusRepoId = "R_xxxxx"
giscusCategory = "Announcements"
giscusCategoryId = "DIC_xxxxx"
```

#### Feature Toggles

```toml
showTags = true
showLocation = true
enableSearch = true
enableDarkMode = true
enablePjax = true
enableLightbox = true
```

#### Navigation Menu

```toml
[[menu.main]]
  name = "Home"
  url = "/"
  weight = 1

[[menu.main]]
  name = "About"
  url = "/about.html"
  weight = 2
```

</details>

## 📝 Usage Guide

### Writing Posts

```markdown
---
title: "Weekend Hiking"
date: 2026-02-20
author: "Vaica"
location: "Wuhan, China"
tags: ["life", "photography"]
---

Beautiful weather today! 🌸

![photo1.jpg](photo1.jpg)
![photo2.jpg](photo2.jpg)
```

### Image Grid Layout

The theme automatically selects the best layout based on image count:

| Count | Layout |
|-------|--------|
| 1 | Centered |
| 2 | Side by side |
| 3 | 3-column grid |
| 4 | 2×2 grid |
| 5-6 | 3×2 grid |
| 7-9 | 3×3 grid |

### Shortcodes

#### Music Card (music-card)

Card-style music player with Meting API support:

```markdown
{{< music-card
    src="https://example.com/song.mp3"
    cover="/images/cover.jpg"
    name="Song Name"
    artist="Artist"
    accent="#d43c33"
>}}
```

| Param | Description | Default |
|-------|-------------|---------|
| `src` | Audio URL (Meting API or direct link) | - |
| `cover` | Cover image | `/images/default-cover.jpg` |
| `name` | Song name | `Unknown Song` |
| `artist` | Artist name | `Unknown Artist` |
| `accent` | Theme color | `#d43c33` |

#### Music Player (music)

Basic music player with progress bar and prev/next controls:

```markdown
{{< music
    src="https://example.com/song.mp3"
    cover="/images/cover.jpg"
    name="Song Name"
    artist="Artist"
>}}
```

#### Motion Photo (motion-photo)

iPhone-style live photo effect, plays video on hover:

```markdown
{{< motion-photo
    image="cover.jpg"
    video="video.mp4"
    alt="Description"
    ratio="3/4"
    delay="500"
>}}
```

| Param | Description | Default |
|-------|-------------|---------|
| `image` | Cover image | - |
| `video` | Video file (auto-derived from image path if omitted) | - |
| `alt` | Alt text | - |
| `ratio` | Aspect ratio | `3/4` |
| `delay` | Hover trigger delay (ms) | `500` |

#### Live Photo (livephoto)

Apple-style live photo with live/mute buttons:

```markdown
{{< livephoto image="cover.jpg" video="video.mp4" >}}
```

#### Live Photo Card (livephoto-card)

Card-style live photo with playback controls, volume, and progress bar:

```markdown
{{< livephoto-card
    src="cover.jpg"
    video="video.mp4"
    caption="Photo description"
>}}
```

#### Video Player (video)

Custom video player with play/pause, progress bar, mute, and fullscreen. Also supports Bilibili video embeds:

```markdown
{{< video src="video.mp4" >}}
```

With poster image and custom ratio:

```markdown
{{< video src="video.mp4" poster="cover.jpg" ratio="4/3" >}}
```

Autoplay + loop:

```markdown
{{< video src="video.mp4" autoplay="true" loop="true" muted="true" >}}
```

Bilibili video (auto-detects BV ID or aid):

```markdown
{{< video src="https://www.bilibili.com/video/BV1xx411c7mu" >}}
{{< video src="https://www.bilibili.com/video/BV1xx411c7mu" page="2" >}}
```

| Param | Description | Default |
|-------|-------------|---------|
| `src` | Video URL (local path, external, or Bilibili link) | - |
| `poster` | Cover image | - |
| `ratio` | Aspect ratio | `16/9` |
| `autoplay` | Autoplay | `false` |
| `loop` | Loop playback | `false` |
| `muted` | Muted | `false` |
| `alt` | Accessibility description | - |
| `page` | Bilibili video page (Bilibili only) | `1` |

#### Voice Message (voice)

WeChat-style voice message audio player:

```markdown
{{< voice src="audio.mp3" >}}
```

With explicit duration display:

```markdown
{{< voice src="audio.mp3" duration="12" >}}
```

| Param | Description | Default |
|-------|-------------|---------|
| `src` | Audio URL (MP3 direct link or local path) | - |
| `duration` | Display duration in seconds (auto-detected if omitted) | - |

### Long Article Card

When an article exceeds 500 characters or has `isLongArticle: true` in front matter, it displays as a blog card on the homepage with cover image, title, and excerpt.

```markdown
---
title: "My Long Article"
isLongArticle: true
cover: "cover.jpg"
---

Content here...
```

Cover image priority:
1. `cover` param (explicit front matter)
2. First image from `images` param
3. First `<img>` in content
4. Text-only card if no image

### Friends Page

Create `data/friends.yml`:

```yaml
- name: "Vaica"
  url: "https://usj.cc"
  avatar: "https://github.com/zqlit"
  description: "Developer"
```

Set `layout: "friends"` in `content/friends.md`.

## 🛠️ Tech Stack

- **SSG**: [Hugo](https://gohugo.io/)
- **Icons**: [Remix Icon](https://remixicon.com/)
- **Comments**: [Artalk](https://artalk.js.org/) / [Twikoo](https://twikoo.js.org/) / [Giscus](https://giscus.app/)
- **Music**: [Meting API](https://github.com/metowolf/MetingJS)
- **JS**: ViewImage.js, PJAX.js

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by [Vaica](https://github.com/zqlit) | Star this repo if you like it! ⭐️
