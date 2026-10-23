---
title: aggregate-search MCP：多引擎聚合搜索
group: pc
tier: secondary
weight: 60
period: 2026-09 ~ 10
tags: [Python, MCP, RRF, 搜索引擎, uv, pytest]
cover: /assets/diagrams/aggregate-search.svg
coverAlt: 架构图：五引擎并行查询与健康黑名单下的加权 RRF 融合
summary: 把博查/智谱/Tavily/Serper/SearXNG 五个搜索引擎聚合成一个 MCP 工具——并行查询、URL 去重、加权 RRF 融合、健康黑名单容错，35 项离线测试不出网即可回归。
metrics:
  - { label: 接入引擎, value: 5 个 }
  - { label: 离线测试, value: 35 项 }
  - { label: RRF 常数 k, value: "60" }
  - { label: 健康黑名单 TTL, value: 300 s }
repoNote: 仓库整理脱敏后随 GitHub 开源计划（T2）公开。
---

## 背景与我的角色

日常用 AI 编程助手搜索资料时，单一引擎要么国内不稳、要么海外不通。我写了这个 MCP 服务器：一次查询并行打多个引擎，融合去重后返回 top-K，并让每个结果的 `engines` 字段标注命中来源——跨源命中的结果更可信。

## 系统架构

![聚合搜索架构](/assets/diagrams/aggregate-search.svg)

核心流程：**并行查询 → URL 规范化去重 → 加权 RRF（score = Σ w/(60+rank)）→ 跨源命中加分 → top-K**。中文 query 自动提升国内源权重（博查/智谱 ×1.3），英文反之。

## 技术亮点

### 1. 失败也要"体面"

海外引擎不可达时自动退回国内源：失败引擎进入 300s 健康黑名单，期间不再等它超时。每个失败都有可操作的死因分类——`quota_exhausted`（去充值）/ `auth_failed`（key 无效）/ `network_unreachable` / `timeout` / `rate_limited` / `server_error`，返回值里直接给 `hint`，不靠猜。

### 2. 出网代理探测不轻信

代理探测按"环境变量 → 常见端口 → Windows 注册表系统代理"回退，但**探测到 ≠ 能用**：必须通过一次 CONNECT + TLS 握手验证才采用；海外引擎走代理失败时自动降级直连重试。这个设计来自实测——本机 7897 端口就是"接受 CONNECT 却在 TLS 阶段掐断"的间歇性坏代理。

### 3. 小而精的工程质量

- 35 项离线 mock 测试（fusion / engines / orchestrator / 失败分类），不出网、不消耗额度
- `verify_e2e.py` 用 MCP stdio 客户端真连 server 做端到端验证
- 轻量 schema 校验器，不引入 `jsonschema` 依赖
- 新增引擎 = 加一个适配器文件 + 在注册表登记一行

## 成果

- 已注册进本人 ZCode 客户端日常使用
- 五引擎聚合 + 失败分类 + 健康黑名单全链可用
- 全部行为有测试锚定，改动按验收清单回归
