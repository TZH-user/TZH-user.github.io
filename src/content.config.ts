import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 项目集合：新增项目 = 在 src/content/projects/ 新增一个 .md 文件，无需改组件。
 * slug 即文件名（不含扩展名），URL 为 /projects/<slug>/。
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** 展示分组：signal = 嵌入式与信号处理，pc = PC 工具与自动化，ai = AI 工具链 */
    group: z.enum(['signal', 'pc', 'ai']),
    tier: z.enum(['featured', 'secondary']),
    /** 列表排序权重，越小越靠前 */
    weight: z.number().default(50),
    period: z.string(),
    tags: z.array(z.string()),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    summary: z.string(),
    sourceRepo: z.string().optional(),
    sourceRepoCN: z.string().optional(),
    report: z.string().optional(),
    /** 量化指标条：详情页头部与首页卡片共用 */
    metrics: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
    /** 洛天依等第三方形象版权声明（有则详情页底部展示） */
    copyrightNote: z.string().optional(),
    /** 代码仓库尚未公开时显示的说明 */
    repoNote: z.string().optional(),
  }),
});

export const collections = { projects };
