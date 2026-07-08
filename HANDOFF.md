# Handoff Notes（跨账号/跨设备交接用）

> 给下一个 Claude session（无论哪个账号登录）：开始干活前先读完这份文件。
> Last updated: 2026-07-02

## 项目是什么

Wing Zeng 的个人 portfolio 网站（React 19 + Vite 7）。安装/运行/部署见 [README.md](README.md)。
UI 需要像素级对齐 Figma——规则和自动校验流程见 [CLAUDE.md](CLAUDE.md)（每个 session 会自动加载）。

## 当前状态（截至 2026-07-02）

- 分支 `exploration_1` @ `582c800`，工作区干净。
- `main` 落后 `exploration_1` 两个 commit（`872c8c5` 的 Curie demo + `582c800` 的 README）。
  可以随时无冲突 fast-forward，用户尚未决定合并时机。
- 完整备份（含 git 历史）在 `~/Desktop/wingzengying_e/portfolio-website`，
  同目录下还有其他设计项目的备份（curie-homepage、curie-design-system 等）。

## Curie demo（Work tab 里的互动演示）

代码在 `src/components/curie/`，替代了原来 second-screen 镂空窗口里的静态截图。

- 设计稿：Figma 文件 "Landing page"，node **3309-2020**（frame `expand - chats`）。
- 实现方式：固定 1120×640 的 stage 按 Figma 1:1 还原，用 `useFitScale` 测宽后
  `transform: scale()` 缩放到容器里；文字保持真实 DOM（可访问性）。
- 顶部加了 **macOS 窗口边框**（红黄绿三点 + 居中标题），stage 因此变为 1120×672，
  外层 `aspect-ratio: 1120 / 672`。这是用户要求的、有意偏离 Figma 的部分（模仿 Cursor Desktop 截图）。
- 尺寸：桌面端占镂空窗口宽度 88%（上下留白相等），移动端 94%。
- 交互：screen 1（landing，预填 prompt + repo chip）按发送 → screen 2（chat，
  用户消息 + Curie 回复 + 两张 task card）。左上角编辑按钮可重置回 screen 1。

## Gallery（Analog tab 内容 + #/gallery 页，2026-07-07 新增）

Webflow /gallery 的重设计版：scatter hero（Claude startups 风格，作品卡环绕标题
出血排布 + 滚动视差）+ 居中 category tabs + 下方 masonry grid + closing quote
+ lightbox。

- **共享体是 `src/GalleryContent.jsx`，渲染在两个地方**：
  1. 落地页 Analog tab 的 second screen（SecondScreen.jsx 对 `analogue` 特判，
     渲染 `<GalleryContent embedded />`——保留原来的面板揭示/mask 形式，
     滑下来看到的直接就是 gallery）；
  2. 独立路由 `#/gallery`（GalleryPage.jsx 只是 bar + GalleryContent + footer 壳）。
  **用户明确说过：以后 Analog tab 要加的内容直接加进 gallery**（改
  GalleryContent / gallery.js 即可，两处同步生效）。
- 数据：`src/projects/gallery.js`（5 个 category、54 张作品、散落 slot 预设、
  `GALLERY_QUOTE` 收尾用 jimin-05 "Don't think about making art" 海报，换照片改
  `GALLERY_QUOTE.item`）。
- 图片：经 Webflow API 导出 → WebP 两档（`src/assets/projects/gallery/{thumb,full}`，共 ~7MB）。
- 动效：GSAP + ScrollTrigger，入场全部 ScrollTrigger 门控（embedded 揭示到位才播），
  `prefers-reduced-motion` 时跳过。
- frameContent.js 的 ANALOG.items（Gallery/手帐/In Real Life 卡片）和
  `gallery-preview.webp` 已不再被 Analog tab 渲染（被 GalleryContent 取代），
  数据先保留备用。
- 无 Figma 稿——设计参考是 claude.com/programs/startups 的 hero，用户已确认方案。
- **已知坑（已修复，别再踩）**：`.gp-closing__figure` 用 `box-shadow: 0 0 0
  9999px var(--gp-panel)` 复刻站内 `.second-screen__window` 的镂空技巧
  （real-life.png 三排照片之间有真实透明缝隙，露出下面固定的 dither 背景）。
  第一次实现时 `.gp-closing` 没加 `overflow:hidden`，导致这个 9999px shadow
  真的以未裁切的巨大范围参与合成，在这个图多 + GSAP 视差多的长页面上触发了
  Chromium 合成渲染 bug——快速滚到底再往上滑，中间大片内容整体变白（computed
  style 显示 opacity:1/visible 正常，但实际没画出来）。**真正的根因**：站内
  原技巧永远是`.second-screen__feature { overflow:hidden }` 包一层，把巨大
  shadow 裁到该行自己的边界内。修复方式：`.gp-closing` 补上 `overflow:hidden`
  （裁切 shadow），同时要保证 `.gallery-content`/`.gp-closing` 全链路没有
  opaque 背景挡在中间——只有 `.gp-hero`/`.gp-grid-wrap` 该有自己的 solid
  背景。以后再给任何元素加 `9999px` 级别的 box-shadow，**必须**配一层
  `overflow:hidden` 的父容器。

## AI Playground 动效 frame（2026-07-07 新增）

三个 playground feature row 的媒体从静态图升级为"滑到那里才动"的组件
（全部 GSAP + ScrollTrigger，零新依赖；`prefers-reduced-motion` 时保持静态图）。
代码在 `src/components/playground/`，由 `frameContent.js` 里 item 的
`media: 'musion' | 'roblox' | 'vinyl'` 字段驱动（SecondScreen 的
`FEATURE_MEDIA` 表做映射，无 `media` 字段的 item 走原来的 `<img>` 路径）。

- **MusionTilt**：musion.png 切成 4 层（`assets/projects/musion-layers/`，
  wordmark + 3 台手机，全画布 1440×912 WebP，同样式叠放即像素对齐）。
  入场手机错峰上浮；hover + fine pointer 时 `gsap.quickTo` 驱动整组
  rotateX/rotateY 跟随鼠标，各层不同 translateZ 产生视差；离开
  `elastic.out` 回弹。切层脚本逻辑：按 alpha 列投影分段（x 0–457 字标，
  584–905 / 935–1257 / 1287–1440 三台手机）。
- **RobloxLive**：截图 ai-game.png 上、视频区域精确坐标
  （left 2.29% / top 2.79% / w 63.47% / h 49.42%，16:9）叠一个
  `<video muted loop playsInline>`；进入视口播放并淡入，离开暂停。
  CTA "Start Playing" 新标签页打开 roblox.com 游戏页。
  `assets/projects/roblox-preview.mp4` 是真实的游戏预览视频（8s 912×514
  H.264 无声 1.6MB），来源：Roblox 自托管 HLS 需登录态，经用户在 playwright
  窗口登录后，从页面网络请求抓到 sc2.rbxcdn.com 带签名 manifest，分段是
  **gzip 压缩的 webm**（gunzip 后 cat 拼接再 ffmpeg 转码即可）。以后要换视频
  重复这个流程：登录页面 → 抓 manifest URL → 下载分段 → gunzip → concat →
  `ffmpeg -i full.webm -an -vf scale=912:-2 -crf 26 out.mp4`。
- **RetroPlayer**（2026-07-07 晚，替换掉最初的 VinylPlayer 黑胶方案）：
  用户提供的像素播放器动画（`ai-player.mp4` 864×432 8.9s + 首帧海报
  `ai-player-poster.webp`）。imageOnly solo 居中行（像 Analog 的 real-life），
  在 playground 列表末尾。默认态：海报 + 手绘像素 PLAY 键（SVG，盖住原图
  左下角十字键，rect 5.2%/62.5%/10.4%/21%，配色取自原图 #e68181/#cc6a86/
  #1c3460）做像素游戏式 wiggle 提醒（ScrollTrigger 门控，`top 90%`——页尾
  元素阈值要宽，否则矮视口滚不到触发线），屏幕 OSD 条（Kode Mono 琥珀色，
  盖住原图乱码文字行）显示 "Click PLAY if you want some AI music..."。
  点击：视频播放 + OSD 跑马灯 "Chrismas Love City pop ver. — by WING &
  SUNO"；播完一次自动回默认态，可重按；播放中再按 = 停止。
  Suno 音乐已接入：`assets/projects/ai-playlist-track.mp3`（59s，来源
  suno.com/s/Yi8279prGED0Q9Wz，share 链接 → 页面 HTML 里 grep
  `cdn1.suno.ai/<uuid>.mp3` 直接可下）。播放 = 音乐 + 视频循环，歌曲结束
  自动复位。`ai-playlist.png` 已不被引用（保留备用）。
  **调试教训**：验证页尾 ScrollTrigger 时 `scrollIntoView({block:'center'})`
  可能到不了触发线（页面滚不到那么深），要 `scrollTo(0, scrollHeight)`。

无 Figma 稿——动效为用户口头需求（"delightful、滑到才动"），方案经用户确认。

## 明确的下一步（用户原话规划）

1. **Screen 3：full automation loop** —— 用户切到另一个 chat 看完整自动化流程。
   用户说 "i will product that in html later"，即用户会先出 HTML 草稿再让 Claude 实现。
2. 待用户确认后把 `exploration_1` fast-forward 进 `main`。
3. 每次改动 UI 后，若 `~/Desktop/wingzengying_e` 需要保持最新，
   重跑：`rsync -a --exclude node_modules --delete ~/Documents/port-codex-upload/ ~/Desktop/wingzengying_e/portfolio-website/`

## 用户偏好（本项目内观察到的）

- 中英混用，回复跟随用户语言。
- 重视：responsive、accessibility、与参考截图的比例一致（如"上下留白相等"）。
- 大文件/构建产物不进 git（.gitignore 已配好 root-level export 的忽略规则）。
