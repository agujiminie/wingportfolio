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

## Cat gaze page (#/cat) — 2026-09-23

- 用户本轮要求：先用已生成的 25 张 Margo 图片做一个可看的独立页面。
  页面为 `#/cat`（也接受 `#/cat/`），白底、居中近景猫、左上角 `← Home`。
  当前先本地预览，尚未部署或发布 PR。
- `src/CatPage.jsx` / `src/cat-page.css` 提供页面壳和标题；hash 路由在
  `src/main.jsx` 中注册，无需修改静态托管 rewrite。
- 核心组件：`src/components/cat/CatGaze.jsx`、`useGazeCell.js`、
  `catFrames.js`、`cat-gaze.css`。默认导入真实 5×5 帧表，也接受自定义 `frames`、
  `faceAnchor`、像素单位的 `reach`、`idle`、`className` 和 `aspectRatio`。
  以后在任意 section 中使用：

  ```jsx
  import CatGaze from './components/cat/CatGaze'
  import { CAT_FRAMES } from './components/cat/catFrames'

  <CatGaze frames={CAT_FRAMES} />
  ```

- 25 张真实 `<img>` 叠放，先显示中间帧，所有图片 `decode()` 完成后启用跟随；
  只改变 `visibility`，无 transition、淡入淡出、3D 或视频拖动。
  缺文件补最近邻；加载失败使用已成功解码的邻居；全空时使用 SVG 占位图。
- 鼠标在窗口中跟随；触屏从猫的 stage 开始拖动，使用 pointer capture，
  `touch-action: none`。第二根手指忽略，手指按住时不启动空闲动作。
  方向计算以 stage 的 `getBoundingClientRect()` 和脸部锚点为准；
  默认 reach 是视口短边的 0.45 倍。rAF 合并事件，归一化坐标加 ±0.06 滞回。
- 无输入 2.5 秒或离开窗口进入空闲，每 1.2–3 秒走到一个相邻方向，偏向回正。
  页面隐藏时暂停；减少动态效果偏好启用时不自动转头，但保留主动跟随。
  键盘聚焦猫后，方向键可切换方向，Home 回正中。
- 素材在 `src/assets/cat/`：25 张 1400×1400 WebP，合计约 2.72 MB。
  源自 `output/imagegen/margo-gaze-v3/frames`，不是新拍的 25 张真照片。
  `r0` 朝上、`r4` 朝下；`c0` 观众左、`c4` 观众右；`r2-c2` 正面。
  生成图毛纹、胸口轮廓和方向间隔有小幅差异，硬切时仍可观察到。
- 无 Figma 稿。本页面参考用户的 `1000039656.mov` 与明确描述：保留纯白背景、
  居中单猫和硬切跟随。当前展示 Margo 完整耳朵和半身原图，四周留白；
  视频中的原猫头部裁切更近，因此不声称逐像素复刻。Home 链接按用户方案添加。
- 本地验证记录、桌面/390px 截图放在 git 忽略的 `output/cat-preview/`。
  `npm run build` 通过。新增猫组件 lint 无错误；全仓 lint 仍有既存的
  UI 组件 props 验证、Dither/Curie hooks 等错误，不能报告全仓 lint 通过。

### Cat smoothing comparison — 2026-09-23

- 用户试玩认为硬切不够顺滑，调研后批准三个可切换小样。`#/cat` 底部现在有
  `原版` / `柔和跟随` / `补帧试验`，默认补帧试验。页面提示该版仅左右，暂无上下。
  控件是本轮用户批准的对比功能，仍无 Figma 参考。
- `CatGaze` 新增 `smooth`（默认 false，保留原组件行为）、`sequence`（可选的一维
  水平帧列）props。页面切换时按版本 key 重建，清理旧监听和动画。
- `gazeMotion.js` 使用按 elapsed time 计算的指数缓动（65ms 时间常数）和速度上限
  0.012 归一化单位/ms，每次积分最大 32ms。快速移动时经过邻近姿势；新输入直接
  替换目标，无动画排队或过冲。静止后停止 rAF；reduced-motion 下主动输入直接定位。
- `interpolatedFrames.js` 只读取 `assets/cat/interpolated/h*.webp` 并按顺序排列。
  RIFE v4.6 离线生成 12 张中间帧，两组各 6 张，原图 r2-c1 / r2-c2 / r2-c3
  原样保留为 h00 / h07 / h14，共 15 张、约 1.46 MB。模型不进入前端依赖。
  指针映射比例与原版相同，但范围限制在原来的 c1–c3；垂直方向不改变姿态。
- 素材来源和 hashes 见 `src/assets/cat/interpolated/{README.md,manifest.json}`。
  补帧消除了部分大幅姿态跳变，但毛纹和胸口形状差异可能表现为轻微拉伸/变软，
  未宣称能完全修复身份和身体一致性。此阶段先保留左右小样，后续批准见下一节。
- 构建、新增/修改猫组件 lint 通过。浏览器实测三模式、原版 25 个方向；扩展回归
  覆盖快速反向、平滑邻近姿势、补帧 15 个角度、水平范围、触屏事件、reduced-motion、
  空闲和图片加载失败回退。真实手机硬件触控未测，触屏路径用模拟 pointer 事件。
  对比截图和测试记录保存在 `output/cat-interpolation/`。

### Full 2D interpolated cat gaze — 2026-09-23

- 用户认为补帧改善明显，明确要求继续。已将同一方法扩展到上下和斜向，
  默认显示 `补帧版`，保留 `原版` / `柔和跟随` 供对比。
- `src/assets/cat/atlas/` 包含 29×29、共 841 张 768px WebP（27.87 MB）。
  每两个原方向之间补 6 张：先水平 RIFE，再垂直 RIFE；原 5×5 对应新网格
  0/7/14/21/28。原始 25 张和先前左右小样未修改。素材来源、导出方法、
  体积、hashes 和限制见 atlas README / manifest；生成脚本在 `scripts/cat/`。
- `CatGazeAtlas.jsx` 复用 `useGazeCell` 的触控、空闲、键盘和减少动态效果逻辑，
  新增 `gridSize` 映射两轴连续角度。`gazeMotion.js` 中 65ms 缓动时间常数不变，
  完整补帧版速度上限 0.006 归一化单位/ms；输入可随时打断，无排队或过冲。
- 用单 canvas 直接绘制姿态，没有交叉淡化；中心照片作为加载后备。
  `gazeFrameCache.js` 按当前方向及运动方向预取邻近图，最多持有 36 个已解码
  ImageBitmap（约 81 MiB 像素数据），4 个并发请求。HTTP 缓存复用已访问图片。
  超出范围释放 bitmap，反向运动取消不相关下载，过期解码不能回写旧方向；
  页面隐藏暂停下载，切换模式清理缓存。没有一次性解码或下载全部 841 张。
- 首次访问某个方向、网络较慢时保持上一张图直到加载完成，失败也保留完整图。
  插帧仍会有轻微毛纹/胸口拉伸，768px 导出比原图柔和，不声称修复所有素材差异。
- 完整版本可嵌入任意 section：`<CatGazeAtlas />`；支持 `faceAnchor`、`reach`、
  `idle` 和 `className`，以组件自身边界计算方向。原 `CatGaze` API 保持可用。
- 验证：841 张尺寸/hash、25 张源图未改、25 个锚点映射均通过；7 项自动测试
  覆盖方向数学、缓动反向、内存上限、过期解码、失败和暂停。浏览器回归覆盖
  原有 37 项及完整网格的九方向、29 个垂直角度、实际绘制的斜向中间帧、触控、
  空闲、减少动态效果、键盘、加载失败和模式切换。触屏为模拟 pointer 事件，
  未在真实手机上验证。记录与桌面/390px 截图在 `output/cat-atlas/`。
- 构建和猫组件 lint 通过；全仓旧 lint 问题仍存在。无 Figma 稿，参考仍是视频和
  用户确认的猫图；白底居中布局与上一版一致，保留用户批准的对比控件。

### Cat deformation / responsiveness refinement — 2026-09-23

- 用户反馈低头时头部鼓动、脸/身体大小变化、跟随迟缓和局部卡顿。已全量测量
  旧/新两组各 841 帧，放大检查异常帧和连续垂直扫视；记录在
  `output/cat-refinement/frame-audit.json` 及对比图。正中低头段头宽范围从
  7px 降到 2px（768px 素材测量），并非声称所有非刚性变形消失。
- `atlas-stable/` 是默认修正版：选原 25 张中的 9 个关键方向，用整体等比缩放和平移
  校正同一水平角度的头部尺寸/位置；固定躯干，颈部在 y=520–624 空间融合。
  RIFE 从 3×3 姿态重新生成 29×29，跳过原图中不一致的中间姿态。原 25 图与旧
  atlas 保留不动。生成脚本 `scripts/cat/refine_gaze_atlas.py`，详细来源和限制见
  `src/assets/cat/atlas-stable/README.md` / manifest。
- 下方 144px 使用独立固定 torso 图，每帧同样绘制，消除该区域有损编码的毛纹闪动。
  颈部与面部内部仍可能有少量柔化。新帧合计 32.36 MB，torso 83KB；按需加载。
- 主动跟随改用 30ms 缓动时间常数、0.018 units/ms 上限，空闲仍保持旧慢速；
  sensitivity 默认 1.25（显式 `reach` 优先）。绘制在 pointer rAF 内直接触发，
  不等待 React effect；邻近下载尽量完成、优先预取前进方向，缺帧时可用一个
  已解码的相邻角度临时代替，过期完成不能回跳。缓存仍 36 帧/4 并发。
- 默认按钮 `修正版`，也保留 `原版` / `柔和跟随` / `上版补帧`。上一版使用旧图和
  旧缓动/灵敏度参数，但共享改进后的安全缓存。切换会清理旧实例。
- 验证：10 项自动测试、52 项浏览器断言通过，包括下半身逐像素不变、完整29方向、
  快速反向、模拟触控、空闲、减少动态效果、错误回退、缓存上限。原25图与旧atlas
  hash未变，新841帧hash通过。构建/相关lint通过；全仓既存lint问题未改。
  本地响应对比日志在 `latency-before.json` / `latency-final.json`；不是远程网络保证。
  无 Figma，继续按用户视频/猫图的白底居中布局，新增修正版用于直接比较。

### Cat hold when pointer stops — 2026-09-23

- 用户最新偏好覆盖此前空闲模式方案：鼠标停止后保持最后方向，不再自动东张西望。
  `CatPage` 四种版本统一传 `idle={false}`；触屏松手、鼠标离开窗口也保持姿态。
  主动跟随的短缓冲保持，组件仍支持其他场景显式启用 idle。

### Cat neck silhouette lock — 2026-09-23

- 用户指出左下视角脖子突然收窄，要求转头时保持大小。检查所有 841 帧确认旧
  修正版 y=480–540 颈部宽度变化最多 38px；此前仅固定 y>=624 的躯干不够。
- 默认修正版 `CatGazeAtlas` 新增 `fixedNeck`，默认为 stable atlas 启用。`neckLock.js`
  从中心帧一次性建立共享画布，固定颈部两侧轮廓，沿 y=416–480 / 横向 44px
  接合，中心口鼻/下巴继续转动；y=584–624 接到固定胸部。原图和 841 素材未改，
  不做面部拉伸，无新增过渡动画。旧比较模式保持原样。
- 共享颈部层准备好后才启动帧缓存，避免邻帧先加载造成未修正帧闪现；中心素材
  失败则用原始正面图作参考，两者均失败就保留中心 poster。切换时释放引用和画布。
  多一个约 2.25MiB 共享画布，跟随时只绘制，不重新逐像素处理。
- 浏览器逐帧测量 841 张：y=480/500/520/540/560/580/600/624 的轮廓宽度变化均为
  0px；锁定两侧和躯干像素跨姿势完全一致。脸转动对上颈部的遮挡、接合带和毛发
  柔化仍属可动区域，不声称整只猫逐像素固定。详细记录在 `output/cat-neck/`。
- 无 Figma 稿，本轮对照用户两张问题截图检查；白底、猫的尺寸/位置及交互控件未改。
- 验证通过：24 条浏览器交互断言（加载门控、九方向颈部像素一致、缓存上限、
  静止保持、中心素材失败回退、版本切换），10 条现有单元测试，相关 lint 和构建。
  本机已缓存素材的九方向跟随耗时 104–126ms，不是慢网络保证。实际页面左下视角
  截图为 `output/cat-neck/page-left-down.png`；控制台无错误。

### Down-left head/neck alignment — 2026-09-23

- 用户否定上一次仅锁定轮廓的修复，要求这个角度头和脖子一起放大对齐。此前 0px
  轮廓测量只覆盖外缘，不能代表用户指出的整体比例，后续不要用它声称视觉问题已解决。
- 新增 `headNeckAlignment.js`：左下方向最多等比放大 7.5%，头和上颈参考层共用
  同一个变换，围绕 768px 图中的 (384,512) 定位。按方向平滑减小校正强度到相邻
  角度，正中/右侧和上方保持原尺寸；不做面部网格拉伸、不加时间淡化。
- 新增共享胸部接合层 y=560–624，放大上颈时下方肩膀/躯干仍保持原位。两个共享
  画布约 4.5MiB，只在初始化生成；逐帧仅绘制。原始图片和两套 atlas 都没有改。
- 用户明确要求现在上颈随头一起扩大，因此上一节“上颈像素完全固定”的测试结论
  只适用于旧版；新验收检查整体比例、相邻角度连续性和下方躯干保持不动。
- 验证：12 条单元测试（含 841 个方向的缩放范围/连续性检查）、31 条浏览器断言、
  相关 lint 和构建通过。下方躯干像素不变，左下实际缩放为 1.075，九方向本机
  已缓存素材跟随耗时 103–127ms。比较图和记录在 `output/cat-alignment/`。
  无 Figma 稿；对照本轮用户截图和正下方姿态目测，页面布局没有改变。

### Upper-left edge alignment — 2026-09-23

- 用户指出左上视角可动头颈与固定肩膀的边缘错位，要求可动部分向左上移动一点。
  参考截图与 atlas r00-c00 对应，已在原 768px 坐标中向左 10px、向上 8px。
  偏移作用于可动头颈组；固定胸部层和 torso 不移动。
- `headNeckOffset` 让修正随方向平滑减弱，正中/右侧和下方为零；保留左下 7.5%
  放大。绘制前清白底，避免负向偏移露出上一帧边缘。原图片和图集未改。
- 本轮参考用户截图，无 Figma；接合前后和邻近视角对照在 `output/cat-offset/`。
- 13 条单元测试、31 条浏览器断言、相关 lint 和构建通过；涵盖 841 个方向的
  位移连续性、按显示尺寸缩放位移、下方躯干不动、静止保持和既有左下放大。

### Continuous neck join replaces overlays — 2026-09-24

- 用户指出脖子整块凸出；本轮截图与 r28-c00 对应。根因是共享脖颈补片随头放大，
  再与固定胸部叠合，两套外轮廓错位。之前“采样宽度不变”的结果不能作为视觉验收。
- 已删除 `neckLock.js` 及额外颈部/胸部参考画布和加载门控。改为从当前姿态的同一张
  bitmap 连续取样：y<=512 保留完整头部缩放/位移，512–624 用平滑权重回到原躯干
  几何，y>=624 不变。端点位置/斜率连续，取样行单调；整数目标行防止细缝/残影。
- 保留左下脸部最多 7.5% 放大、左上 (-10,-8) 位移和方向间平滑变化；只在颈部让
  变换逐渐归零。固定底部 torso 小图仍覆盖 y>=624，原图和全部 atlas 未改。
- `fixedNeck` 保留为兼容开关，现在控制连续接合，`data-neck-join` 为 continuous；
  不再表示上颈像素固定。移除额外约 4.5MiB 画布和中心参考图请求，加载失败走原
  帧缓存的邻帧/保留上一帧回退。原有停鼠标即保持不动的偏好不变。
- 目测参考是本轮用户截图，无 Figma。放大的颈部衔接对照和测试记录位于
  `output/cat-continuous/`。并不声称原素材所有毛发柔化和形态变化都已消除。
- 验证通过：14 条单元测试（含全部 841 个方向的接合连续性/单调性）、32 条浏览器
  断言、相关 lint 和构建。九方向本机缓存下跟随耗时 104–130ms，固定下躯干像素
  一致；测试页等待首帧 React effect 订阅后再注入首个指针事件，避免测试启动竞争。
  两个截图问题角度均放大目测；无额外颈部参考图请求或残留叠层。

### Same rendering geometry on both halves — 2026-09-25

- 用户确认右侧效果满意，要求左侧使用同样效果，且左下→右下不能改变头部大小。
  最新要求覆盖之前的左下放大和左上偏移。定位到左侧独有的 7.5% 放大、(-10,-8)
  平移及 y=512–624 逐行变形：这些处理使左侧头部改变比例、胸颈发生扭曲。
- 删除 `headNeckAlignment.js`、`fixedNeck` 开关及相关诊断属性。所有方向直接把
  当前完整图片绘制到同一个画布边界，沿用已获认可的右侧绘制方式；保留 y>=624
  的同一固定 torso。`data-frame-geometry="source"` 标识直接绘制。无新增补片，
  无按方向缩放/平移/逐行扭曲。所有原照片和 atlas 未改。
- 删除 4 项断言旧放大/偏移/形变的测试；保留 10 项缓存和跟随测试并通过。相关 lint
  和构建通过，构建仍有既存 chunk 大小提醒。无 Figma，本轮按用户问题截图、原始
  姿态与已认可右侧进行目测；白底、位置、页面控件均保持。
- 浏览器跑过底部全部29列、左右两端各29行及12个内部点，共99次定位/257条断言。
  检查实际画布头颈与原图同坐标像素一致、右侧与修改前渲染像素一致、下方躯干
  固定、缓存限制、缺图回退、切换及静止3.2秒保持。耗时20–169ms为本地测试数据。
  记录与左右/下方/上方/实际页面截图：`output/cat-symmetric/`。
- 取消人为变换并不证明生成照片的解剖形态完全一致；源图仍有转头透视和生成差异。
  后续不要再次用局部缩放或固定颈部覆盖层补救，否则会重新引入被否定的比例变化
  和接缝。任何进一步处理应先在连续姿态中确认视觉结果，不能只凭轮廓测量宣称解决。

### Remove cat comparison controls — 2026-09-25

- 用户接受当前猫咪效果，暂停调整；按截图移除底部四个版本 Tabs 和说明文字。
  `CatPage` 直接显示 `<CatGazeAtlas idle={false} />`，删除比较状态、旧版导入及
  对应 CSS；猫咪尺寸、位置、动作和 Home 链接保留，等待用户后续页面安排。
- 无 Figma，按本轮用户截图核对：底部控件已完全消失。实际浏览器首帧加载正常，
  页面按钮数为0、比较区域不存在；相关 lint 和构建通过（原有 chunk 提醒仍在）。

### Homepage Retro / Cat Style — 2026-09-25

- 已获用户确认：给同一首页增加视觉风格切换，原风格命名 Retro，新增 Cat Style。
  `App` 的 `heroStyle` 与栏目 `activeId` 独立；默认 Retro。全局 Change Style 在
  Work / AI Playground / Analog 中均可用，切 Tab 保留风格，切风格保留 Tab 和滚动。
  没有增加路由切换，也没有更改下方作品内容或业务交互；独立 `#/cat` 仍保留。
- `FrameOverlay` 去掉 Feather 图标，保留 Wing Zeng 和原回首页动作，把原 LinkedIn
  按钮及链接移到名字右侧，右上角改为 Change Style。两种风格共用同一套导航和标题。
- Cat Style 复用已获认可的 `CatGazeAtlas idle={false}`；跨 Tab 不重挂猫咪，切回
  Retro 则卸载猫缓存与事件。原 MorphStage 保持挂载/解码，仅隐藏，避免切回时重载
  以及丢失当前栏目进度。原猫图、头颈绘制、灵敏度均未改。
- 白底只绘制在首屏 spacer，随首屏滚走。`LandingBackground` 保持原样，因为下面
  作品/画廊的透明镂空还要透出原 Retro 背景，不能全局替换为白色。猫沿用原 Hero
  的居中和滚动淡出，显示范围对应原图的0.8比例，并在矮窗口为原三行标题留出空间。
- 嵌入首页的猫区允许 `pan-y pinch-zoom`，保障纵向页面滚动；横向拖动继续跟随，
  原生纵向滚动接管时 pointercancel 释放拖动。独立猫页仍保持原来的自由拖动。
- 新按钮沿用现有字体/圆角/颜色。为保证完整导航不重叠，原窄屏底部栏目导航布局
  提前至700px启用；380px以下仅收紧导航间距和按钮内边距。标题字体规则不变。
- 本轮视觉依据为用户首页截图及确认规格，无新增 Figma 稿。文字内容、桌面标题及
  中间导航坐标与修改前对照一致；导航移动和 Hero 替换为用户明确要求的差异。
  验证截图与交互记录在 `output/home-style/`。
- 最终验证：1280×720 和390×844各66条浏览器断言通过；覆盖全部6种组合、标题/
  导航几何和字体颜色一致、作品DOM与页面高度保留、滚动位置保留、Curie侧栏状态
  不重置、快速切换、猫咪跟随/静止及标题留白。320px导航另行目测无重叠。
  10项猫咪缓存/跟随单元测试、相关lint及生产构建通过，仍有原有chunk大小提醒。
  触屏验证包含CSS滚动策略和模拟指针；未在真实手机硬件上验证。

### Cat hero visual size correction — 2026-09-25

- 用户指出首页猫咪明显小于 Retro 图案。原接入对猫图再次乘0.8，且为保持屏幕居中
  从上下两端各扣掉一份标题空间，导致矮窗口里额外缩小；猫图自身另有白边。
- 仅调整首页猫容器 CSS：使用原 Retro 画布尺寸，不再额外乘0.8；可用高度按
  导航下方64px到标题上方12px计算，仅扣一次标题区域。能居中时保持原中心，
  放大后接近标题时上移，保证文字/导航不移动且不被遮挡。原猫图、头颈比例、
  动作、独立猫页、Retro样式和下方内容全部保持。
- 尺寸验证：1280×720的猫从约292px增至442px；852×914从202px增至252px；
  390×844从192px增至240px。三个尺寸下分别检查三个栏目，猫均位于导航下方、
  标题上方，9组几何检查通过；构建及相关lint通过。参考仍为用户页面与已确认规格，
  本轮只改猫的外部显示范围，没有改文字/导航/Retro的布局与样式。

### User-controlled cat size — 2026-09-25

- 用户要求停止猜测尺寸，直接在当前页面提供带百分比的 slider。Cat Style 的
  Change Style 下方增加“猫咪大小”滑块，可从40%到100%逐1%调整；100%对应本轮
  开始时的现有尺寸。只缩放整只猫，缩放中心保持固定，文字/导航不移动。
- 百分比在首页各Tab/风格切换间保留，当前浏览器标签页刷新也通过sessionStorage
  保留。控件仅在Cat Style出现，随Hero滚走，不覆盖下方作品；独立猫页不受影响。
- 已验证滑块调到80%时显示80%，实测宽度按0.8变化且中心位置不变；切Tab、
  切换风格和刷新后数值均保留。相关lint与构建通过；仅按用户要求新增调节控件。

### Confirmed cat scale: 85% — 2026-09-25

- 用户最终选定85%（覆盖之前88%的选择），要求不再显示slider。首页猫容器固定 `--cat-scale: 0.85`，继续
  使用原缩放中心和响应式基准。删除滑块、对应CSS、临时大小state以及sessionStorage
  读写；旧的浏览器临时值不再影响结果。三个Tab的Cat Style均采用同一比例。

### Cat photo-to-title gap: 4px — 2026-09-25

- 用户要求猫图下移，图片底边与标题顶部只留4px。保留已确认85%大小和水平居中，
  用标题容器实测top定位猫图底边；ResizeObserver同步字体/标题高度变化，窗口尺寸
  变化使用原有rAF调度更新。原文字、导航、Retro和下方作品位置不变，无slider。
- 验证852×914、1280×720、390×844下三个栏目，共9组；实际间距4.00–4.01px
  （子像素舍入），尺寸仍为85%。相关lint与生产构建通过；按用户截图调整，无Figma。

### Drag and numeric scale editor for the cat hero — 2026-09-25

- 用户要求自己拖动猫图定位，并用百分比输入框调整大小，覆盖之前隐藏调节控件的
  决定。新增 `CatHeroEditor`，仅在首页 Cat Style 出现；默认85%，初始图片仍与
  标题相隔4px。缩放围绕稳定中心，20–200%且支持小数，整张画布等比缩放；原图、
  头颈绘制和独立猫页保持原样。右上角 Scale 输入框、拖动提示与 Reset 按钮。
- 指针捕获允许拖出原画布区域后继续移动；rAF 合并位置更新。拖动事件在捕获阶段
  与猫的视线跟随隔开，松开后继续鼠标跟随，仍无空闲自动动作。触摸猫图改为移动
  位置（touch-action:none），猫图外仍可滚动。聚焦定位框后方向键移动1px，Shift
  加方向键移动10px；Reset恢复85%及默认偏移。空输入恢复当前值，越界值提交时限幅。
- 局部状态避免拖动时反复渲染整个首页；sessionStorage `cat-hero-placement-v1`
  保留位置和比例，跨栏目、风格及同标签页刷新生效。默认首次加载仍是Retro。
  相对默认位置保存像素偏移，响应式基准尺寸沿用原规则，并非跨设备统一的绝对坐标。
- 实际浏览器验证：拖动80/-40px精确，缩放100%按比例且中心不变，文字/导航不动；
  三栏目、Retro往返和刷新保留；空值、250%限幅200%、Reset通过。390×844控件可见，
  拖出原区域仍持续移动，松开释放，页面未滚动。触摸硬件未验证。记录在
  `output/home-style/editor-checks.json`。相关lint和构建通过，原有chunk提醒仍在。
- 本轮无Figma，以用户明确的拖动/输入要求和现有页面为视觉依据；只新增调节控件
  与画布定位行为，保持文字、导航、Retro和下方内容的已有布局。

### Confirmed 130% cat, attached to the bottom edge — 2026-09-25

- 用户确认130%大小，要求猫图始终贴窗口最底部，水平居中稍偏右。读取当前浏览器
  时页面实际是Retro，切到Cat后得到85%/零偏移；没有读到用户口述的调整坐标。
  已向用户说明，按口述采用水平中心54%（中线向右4%），并非恢复了精确拖动坐标。
- 固化首页Cat为 `--cat-scale:1.3; left:54%; bottom:0`，沿用原调节器的100%尺寸
  基准，统一缩放完整画布。移除临时拖动/输入面板及其组件，旧sessionStorage值
  不再参与布局；不再依赖标题位置，删除对应测量和ResizeObserver。鼠标跟随、
  静止保持、原Hero滚动淡出、导航和内容继续原行为。触屏恢复pan-y pinch-zoom。
- 三个栏目×1280×720、852×914、390×844共9组测量均为底边0px、中心54%、
  130%且画布长宽一致。手机上继续保留原文字/底部导航位置，猫处在它们后方，
  因此文字会叠在猫上；本轮没有重新设计手机排版。截图与记录在
  `output/home-style/bottom-*`。相关lint和构建通过，仍有原有chunk提醒。
- 无Figma，本轮按用户口述的贴底/比例/轻微偏右要求核对，未改变图片内容。

### Bottom center correction — 2026-09-25

- 用户取消偏右，明确要求bottom居中。首页猫图改为 `left:50%; bottom:0`，
  保持130%大小及原有跟随行为；覆盖上节54%的定位。

### Shared headline percentage control — 2026-09-25

- 用户要求为左下角三行标题增加右上角Scale输入框，所有Tab统一字号。新增
  `HeroHeadline`，100%等于当前响应式字号，Text Scale实时调整25–200%（支持小数），
  Reset回100%。只将字号乘比例，沿用字体、颜色、字距、行高和左下锚点；不缩放
  导航、正文或猫图。Work / AI Playground / Analog及Retro / Cat共用同一设置。
- 设置保存在localStorage `hero-headline-scale-v1`，刷新恢复。输入中可暂时清空，
  空值失焦恢复当前比例，越界失焦限幅。控件在Change Style下方，内容区滚至顶部
  导航后隐藏；独立猫页不受影响。当前猫仍为130%、底部正居中。
- 浏览器验证80%在三个Tab字号一致且左右/底部锚点与导航字号不变；125%不改变猫图
  几何，刷新保留，空输入恢复。390×844下80%正确、控件完整可见。记录在
  `output/home-style/headline-scale-checks.json`；相关lint及构建通过（既存chunk提醒）。
- 无新增Figma稿，本轮按用户标注截图和明确的调节需求验证；100%保留原版式，新增
  白色圆角紧凑控件沿用之前猫图调节器的样式。

### Confirmed headline scale: 93% — 2026-09-25

- 用户选定93%，要求收起临时控件。标题容器统一固定 `--headline-scale:0.93`，
  桌面/手机基准字号均乘此比例，所有Tab及两种风格一致。移除Text Scale、Reset、
  临时状态与localStorage读写，旧保存值不再影响结果；猫图仍为130%底部正居中。

### LinkedIn icon and identity divider — 2026-09-25

- 按用户标注将LinkedIn图标从22px缩为17.6px（小20%），40px按钮点击范围保留。
  Wing Zeng与按钮的现有间隙内加入20px高竖线，使用和Change Style边框共用的
  `1px solid rgba(0,0,0,0.16)`；绝对定位不挤动导航，窄屏随4px间距居中。
  两种风格和全部Tab共用；本轮视觉依据为用户标注，无新增Figma。
