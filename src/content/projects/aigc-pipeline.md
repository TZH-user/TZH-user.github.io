---
title: 本地 AIGC 部署与素材生产管线
group: ai
tier: secondary
weight: 80
period: 2026-09
tags: [ComfyUI, RTX 4060 Ti, Flux, Wan2.2, MiniMax-H3, GGUF]
cover: /assets/diagrams/aigc-pipeline.svg
coverAlt: 架构图：模型下载 → 模型库 → ComfyUI 工作流 → QC 闸门 → 成品
summary: 在 RTX 4060 Ti 16GB 上把生图与生视频模型跑通并横向评测——9 项部署测试全通过，并搭出"下载→部署→工作流→QC→成品"的完整素材生产线。
metrics:
  - { label: 部署测试, value: 9 项全通过 }
  - { label: 工作流 JSON, value: 165 个 }
  - { label: 模型库, value: 191 GB / 36 文件 }
  - { label: 显存峰值, value: ≤ 15.8 GB }
repoNote: 仓库整理后随 GitHub 开源计划（T2）公开。
---

## 背景与我的角色

目标很简单：验证消费级显卡（RTX 4060 Ti 16GB）能否撑起一套可用的本地生图/生视频工作流。我完成了从环境评估、模型下载校验、逐项部署测试到画质横向对比的全过程，并把结论沉淀成可复跑的管线。

## 系统架构

![AIGC 素材生产管线](/assets/diagrams/aigc-pipeline.svg)

## 技术亮点

### 1. 九项部署测试，全数据说话

| 编号 | 模型 | 任务 | 耗时 | 显存峰值 |
|------|------|------|------|----------|
| I0 | SDXL base 1.0 | 生图 1024² | 170 s | 12.5 GB |
| I1 | Flux.1-dev FP8 | 生图 1024² | 237 s | 15.4 GB |
| I2 | Qwen-Image Q4_K_M | 中文海报 1328² | 305 s | 15.8 GB |
| V1/V2 | Wan2.2-TI2V-5B | 41 / 121 帧 | 547 s / 20m36s | ~15 GB |
| V3 | Wan2.2-T2V-14B Q4 | 832×480×49f | 22m49s | 15.4 GB |
| V4 | LTX-Video 2B | 768×512×97f | 235 s | 12.5 GB |
| M1 | MiniMax-H3 fl2va int8 | 含原生音频 T2V | 155 s | ~15.0 GB |

横向结论同样有依据：Flux 细节光影最强、Qwen-Image 是图内中文渲染冠军、Wan2.2-14B 质量首选 / 5B 性价比首选、LTX-Video 只配当草稿。

### 2. 踩坑记录变成避坑文档

- Qwen-Image 必须用 `ModelSamplingAuraFlow`（shift 3.1），用 SD3 采样节点直接出纯噪声图——首跑翻车后定位修复
- Wan2.2 5B 配新 VAE（48ch）、14B 配 wan_2.1_vae，不可混用
- 14B 双模型在 32GB 内存机器上内存低点 0.6GB（Q5×121 帧曾直接崩掉 ComfyUI）——由此定下"帧数优先压到 65 帧内 + 盯内存空闲"的红线规则

### 3. 舞蹈视频管线（人物 × 动作复刻）

主路线 MiniMax-H3 R2V（20.97GB int8，turbo 4 步 LoRA），兜底 Wan2.1-VACE 14B Q4：一张人物照片 + 一段参考舞 → "这个人跳这段舞"。3 参考图实测约 30 分钟/条，首批出片身份/服装/动作全过 QC。后处理（BiRefNet 抠图 → RIFE 补帧 → Real-ESRGAN 超分）全部 ComfyUI 原生节点，不依赖 Photoshop。

### 4. 素材获取通道的实测技巧

- Pexels：www 页面限流 ~1 分钟，但 CDN 不限流且文件名规律 → 直接对 CDN 做 Range 探测取片
- B 站：buvid3 → 搜索接口 → cid → dash 流（未登录上限 480p），下载必须带 Referer
- 自写 `dance_qc.py`：候选素材抽 8 帧拼图 + 全帧差分切镜检测，QC 不过的素材不进管线

## 成果

- 六个生图方案五个一次通过，Qwen-Image 修复后全通过；视频四方案全部通过
- 165 个工作流 JSON + `ui2api.py` 转换器（UI ↔ API 格式互转，含 Autogrow 扁平键等 4 个坑的处理）
- 下载脚本全部支持断点续传 + sha256 校验 + 重跑跳过
