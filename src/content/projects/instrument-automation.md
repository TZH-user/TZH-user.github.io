---
title: 实验室仪器自动化控制台与 AI Skill
group: pc
tier: secondary
weight: 50
period: 2026-04 ~ 05
tags: [Python, SCPI, VISA, HTTP API, AI Skill, DG4062, E8267D]
cover: /assets/diagrams/instrument-control.svg
coverAlt: 架构图：人工与 AI 双入口经统一后端驱动局域网仪器
summary: 一套让"人"和"AI"共用同一会话安全操作真实仪器的控制台——Web 界面给人工，CLI/HTTP API 给脚本，写操作走 prepare→确认→apply 门禁，质量判决内核给每次测量出 PASS/WARN/FAIL。
metrics:
  - { label: 接入仪器, value: 4 类 }
  - { label: 调制类型, value: AM/FM/PM/ASK/FSK/PSK }
  - { label: HTTP API, value: 20+ 端点 }
  - { label: 质量判决规则, value: 9 类 }
report: /assets/reports/e8267d-report-20260524.pdf
repoNote: 仓库整理后随 GitHub 开源计划（T2）公开。
---

## 背景与我的角色

实验室的 DG4062 波形发生器、DS4014E 示波器、MSO4104B 示波器、E8267D 矢量信号源都支持局域网 SCPI。我为它们建了一套统一控制台：人工用浏览器操作，AI/脚本走同一后端的 CLI 与 HTTP API——并给写操作设计了确认门禁，让大模型能安全地驱动真实仪器。

## 系统架构

![仪器控制台架构](/assets/diagrams/instrument-control.svg)

关键设计：**人工页面与 AI 共用同一个后端进程**——串口由本软件打开后，AI 通过本地 HTTP API 继续读状态、发命令、取日志；AI 操作前必须先 `GET /api/status` 确认当前状态，避免盲目覆盖上一次（人或 AI）留下的配置。

## 技术亮点

### 1. 写操作三级门禁

`prepare` 返回 `confirmation_required` → 必须逐字回填确认文本才执行 `apply` → 写后回读状态并检查 `system_error`。不暴露裸 SCPI 写入口；Skill 文档明确"不把『命令已发送』描述成『物理结果已验证』"。

### 2. 调制双层校验

AM/FM/PM/ASK/FSK/PSK 调制参数先过前端基础合理性检查，再按仪器实时 `MIN/MAX` 范围精确校验——不靠写死的参数表。

### 3. 数据质量判决内核

统一返回 `verdict: pass/warn/fail + summary + metrics + findings`，规则覆盖：VISA 打开失败、SCPI 非零错误、串口 TX 后无 RX、波形点数不足、全常数波形、ADC 边界削顶、频率/Vpp 偏离期望等 9 类。还会核对采样率是否够用（例如 `x_increment=50ns` 只有 20 MSa/s，不能可靠判断 40 MHz 波形）。

### 4. 诚实的上电策略验证

实测发现 DS4014E 接受 `PSTatus OPEN` 命令且回读一致，但**物理拔插电源后并不会自动开机**——于是在接口里明确区分 `command_state_only` 与 `physical_auto_start_verified: false`，不把命令回读当成物理结果。

### 5. AI Skill 化沉淀

控制经验沉淀为两个 AI Skill（`lab-instrument-control`、`tektronix-mso410b`）：按设备路由加载参考文档、标准流程（先读状态→计划写入→回读验证→检查错误队列）、逐字确认门禁。E8267D 数字调制验证产出了完整 PDF 报告。

## 成果

- 4 类真实仪器日常可用，控制台一键启动
- 20+ HTTP API 端点 + 完整 CLI
- 串口"拆散改进"：按换行分帧 + 短空闲窗口聚合，缓解日志碎片化
- E8267D ASK/PSK/FSK/Custom 数字调制实测验证报告（PDF 可下载）

## 相关资源

- [E8267D 数字调制验证报告 PDF](/assets/reports/e8267d-report-20260524.pdf)
