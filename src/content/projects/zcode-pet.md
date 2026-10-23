---
title: ZCode 桌宠：会话状态驱动的桌面宠物
group: ai
tier: featured
weight: 40
period: 2026-10
tags: [Electron 39, SQLite, 状态机, AI 动画, Python 管线]
cover: /assets/covers/zcode-pet.webp
coverAlt: 桌宠 idle 状态：趴在圆枕上打盹
summary: 一只悬浮在 Windows 桌面的 Q 版桌宠，实时读取本地会话数据库感知 AI 编程助手的工作状态——空闲打盹、全力工作、等待确认、出错提醒，动画全部由本地 AI 模型生成的帧序列驱动。
metrics:
  - { label: 规范 git 提交, value: 22 次 }
  - { label: 状态帧序列, value: 1192 帧 }
  - { label: 状态动画, value: 15 段 }
  - { label: 状态机状态, value: 6+ 种 }
repoNote: 仓库整理后随 GitHub 开源计划（T2）公开。
copyrightNote: 角色形象基于"洛天依"同人二次创作（AI 生成），洛天依形象及相关权利归上海禾念信息科技有限公司所有；本项目为个人学习性质的非商用演示，与官方无关。
---

## 背景与我的角色

个人项目，从零到可用桌面应用由我独立完成：需求定义、ZCode 会话接口的逆向分析、Electron 应用架构、素材生产管线与动画状态机设计。项目按阶段推进并全程规范提交。

## 系统架构

```
ZCode 本地 SQLite（session / tool_usage / tasks）
  → zcode_state.js 状态探针（只读）
  → 状态机映射 → 渲染进程切换动画
  → 透明无边框窗口 + 托盘
```

状态探针直接读 AI 编程助手的本地数据库：运行中会话数、未读数、错误会话——不侵入目标进程。

## 技术亮点

### 1. 会话接口逆向分析

定位 ZCode 公开源码，确认可实时监控的三类信号：`session` 表（含 `task_type`）、`tool_usage.status='running'`（正在跑的工具）、`tasks.unread_at`（未读，在第二个库）。分析结论成文于 `docs/01-zcode-source-analysis.md`。

### 2. 多 Agent 接入的架构规划

后期扩展方案确立了"状态与归属分离"原则：**状态 = f(所有 agent 活动总数)** 决定播哪个动画；**归属 = g(谁贡献了这些数)** 走独立文本通道，不污染状态。为此实测三家工具的数据库差异（表名、字段、有无运行中工具信号各不相同），据此规定 Snapshot 必须携带"信号质量"而不只是数值——避免"文档说有、实际没有"。

### 3. pose-first 动画生产管线

不逐帧手绘，而是搭了一条 AI 动画流水线：

```
参考图 → EditPlus 生成动作关键帧 → H3 fl2va 首尾帧驱动 → 抽帧键控 → 768×768 帧序列
```

首尾帧策略分两类：循环态（idle/waiting/error/notification/sleeping）首帧=末帧；一次性态（celebrate）起始姿态→定格姿态播一次回落。沉淀出提示词三原则：动作"小摆幅"、明确"无运动残影/边缘干净"、首尾姿态完全一致。

### 4. 状态机与动画语义

每个状态有明确的动作语义：idle 趴在淡蓝圆枕上打盹（浅睡随时可被叫醒）、waiting 坐地托腮仰望、error 焦急原地碎步跺脚（"出错了快来看看我"）、notification 好奇张望——不是简单的换皮。

<video src="/assets/videos/pet-idle.mp4" autoplay muted loop playsinline controls preload="metadata" class="w-full rounded-lg border border-ink-700"></video>

<video src="/assets/videos/pet-working.mp4" autoplay muted loop playsinline controls preload="metadata" class="w-full rounded-lg border border-ink-700 mt-4"></video>

<p class="text-center text-xs mt-2">演示：idle 打盹（左上）/ working 工作中的循环动画，均为本地模型生成帧序列</p>

## 成果

- 22 次规范提交，文档、素材、代码三线齐备（5 篇阶段文档）
- 15 段状态动画 + 1192 帧处理后的 sprite 资产
- Electron 39 应用可日常使用：透明窗口、状态机驱动、托盘常驻
- 素材管线脚本化：抠图、状态衍生、manifest 全流程可重跑
