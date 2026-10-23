// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// `site` 留空时用相对路径（本地开发/未部署）；
// 部署到 EdgeOne Pages 后，通过环境变量 SITE 或改这里填默认域名，
// 例如 'https://<project-id>.edgeone.app'。sitemap 仅在 site 存在时启用。
const site = process.env.SITE || '';

export default defineConfig({
  site: site || undefined,
  integrations: [mdx(), ...(site ? [sitemap()] : [])],
  vite: {
    plugins: [tailwindcss()],
  },
});
