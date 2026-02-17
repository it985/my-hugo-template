# Amigo - Minimalist WeChat Moments Style Hugo Theme

[![Hugo](https://img.shields.io/badge/Hugo-%230076D1.svg?style=flat&logo=hugo&logoColor=white)](https://gohugo.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Amigo is a minimalist blog theme for [Hugo](https://gohugo.io/), inspired by **WeChat Moments**. It aims to provide a private, intimate, and easy-to-read space for sharing updates, supporting PJAX seamless loading and multiple comment systems.

[中文文档](./README.md)

---

## ✨ Features

- 📱 **Moments UI**: Highly restored WeChat Moments visual experience, supporting 9-grid image display.
- 🚀 **Full-site PJAX**: Smooth, no-refresh page transitions for an enhanced browsing experience.
- 🌓 **Dark Mode**: Supports manual toggle and system-wide synchronization.
- 💬 **Multi-comment Support**: Built-in support for **Artalk** (deeply adapted to Moments-style likes/comments) and **Giscus**.
- 🖼️ **Image Lightbox**: Integrated ViewImage.js for zooming into images with a single click.
- 🎨 **Beautiful Typography**: Optimized localized Chinese fonts (built-in *zql* font) for a better reading experience.
- 🛠️ **Responsive Design**: Perfectly adapted for mobile, tablet, and desktop.
- 🔙 **Smart Header**: Automatically toggles background and displays title on scroll, with integrated "Back to Top" functionality.

## 📸 Screenshots

*(Suggested: Add screenshots of your theme here)*

## 🚀 Quick Start

### 1. Installation

Run the following command in your Hugo site directory:

```bash
git clone https://github.com/your-username/hugo-theme-amigo.git themes/Amigo
```

### 2. Configuration

Add the following basic configuration to your `hugo.toml`:

```toml
theme = "Amigo"

[params]
  username = "Your Nickname"
  avatar = "/images/avatar.jpg"
  description = "A short bio"
  cover = "/images/cover.jpg" # Homepage cover
  
  # Comment Mode: "artalk", "giscus", or "none"
  commentMode = "artalk"

  # Font Settings: "ZQL", "PingFangQiaoMuTi", "AlimamaFangYuanTi"
  fontFamily = "ZQL"

  # Artalk Configuration
  artalkServer = "Your Artalk Server URL"
  artalkSite = "Your Site Name"
  
  # Feature Toggles
  enablePjax = true
  enableLightbox = true
```

## 📝 Usage Guide

### Directory Structure

```text
content/
├── posts/           # Moments/Updates (Articles)
├── about.md         # About page
└── friends.md       # Friends page (layout: "friends")
```

### Writing Updates (Posts)

Create a `.md` file in the `content/posts/` directory:

```markdown
---
title: "Nice weather today"
date: 2024-05-20T12:00:00+08:00
author: "Vaica"
location: "Wuhan · East Lake"
images:
  - "/images/posts/p1.jpg"
  - "/images/posts/p2.jpg"
---

The content of your update goes here...
```

### Comment Toggle Logic

- **Posts**: Comments are enabled by default. Set `comments: false` to disable.
- **Pages**: Comments are disabled by default. Set `comments: true` to enable (e.g., for a Guestbook).

### Friends Configuration

Create `data/friends.yml` in your site's root directory:

```yaml
- name: "Vaica"
  url: "https://usj.cc"
  avatar: "https://github.com/vaica.png"
  description: "Developer"
```

And set `layout: "friends"` in `content/friends.md`.

## 🛠️ Tech Stack

- **SSG**: [Hugo](https://gohugo.io/)
- **Icons**: [Remix Icon](https://remixicon.com/)
- **Comments**: [Artalk](https://artalk.js.org/) / [Giscus](https://giscus.app/)
- **JS Components**: ViewImage.js, PJAX.js

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Thanks for using **Amigo**! If you like this project, please give it a **Star** ⭐️.
