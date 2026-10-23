# portfolio-site · 个人作品集网站

面向国内招聘场景的静态作品集：二维码 → 微信打开 → 项目详情。国内直连、移动端优先、纯静态输出。

## 技术栈

- **Astro 7**（静态输出）+ **Tailwind CSS v4**（`@tailwindcss/vite`，CSS-first 配置）
- Content Collections：新增项目 = 在 `src/content/projects/` 新增一个 `.md`，无需改组件
- 字体：系统字体栈（零外部请求）；图片全站 WebP；视频自托管 H.264 mp4

## 常用命令

```bash
npm run dev      # 本地开发 http://localhost:4321
npm run build    # 构建到 dist/（零警告基线）
npm run preview  # 本地预览 dist
npm run assets   # 从 F:/Zcode/GitHub/projects/ 压缩素材到 public/assets/
npm run deploy   # 构建 + 打包 dist.zip + EdgeOne Pages 上传（无凭据时打印控制台步骤）
```

## 维护指南

### 新增项目

1. `src/content/projects/<slug>.md`，frontmatter 参照现有文件（schema 见 `src/content.config.ts`）
2. 封面图放 `public/assets/covers/`，截图放 `public/assets/shots/`（WebP，<300KB）
3. `npm run build` 自动收录，URL 为 `/projects/<slug>/`

### 修改个人信息

`src/config.ts`——姓名、简介、GitHub/Gitee/邮箱。**当前为占位值，T2 推送后需替换。**

### 部署

见 `scripts/deploy-edgeone.mjs` 顶部注释。拿到默认域名后：
`astro.config.mjs` 的 `site` 或环境变量 `SITE=<域名>`（sitemap/canonical 随之启用）。

## 素材来源

`public/assets/` 全部由 `npm run assets` 从 `F:/Zcode/GitHub/projects/`（T0 产物）压缩生成，
不要手工改 `public/assets/`；改选素材请编辑 `scripts/compress-assets.mjs` 后重跑。

## 版权说明

桌宠项目页使用 AI 生成同人形象（基于"洛天依"二次创作），页面已附版权声明；
形象版权归上海禾念信息科技有限公司所有，本项目为个人学习非商用演示。
