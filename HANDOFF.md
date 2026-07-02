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
