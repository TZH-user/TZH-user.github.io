---
title: STM32H743 模板体系与自动测量基建
group: signal
tier: featured
weight: 30
period: 2026-07
tags: [CMake, Ninja, FreeRTOS, LVGL, CMSIS-DSP, Python, 单元测试]
cover: /assets/covers/stm32-infra.webp
coverAlt: MSO4104B 示波器实测波形与自动测量
summary: 让新固件项目"三步起步"的工程基建——5 套 H743 模板 + 克隆/自检/翻译三件套工具 + 13 硬件驱动与 9 组算法模块库，配套 JSON 计划驱动的自动测量台与 PC 端算法回归仿真台。
metrics:
  - { label: 硬件驱动库, value: 13 个 }
  - { label: 算法模块组, value: 9 组 }
  - { label: 工程模板, value: 5 套 }
  - { label: AutoBench 单元测试, value: 10 项通过 }
repoNote: 仓库整理后随 GitHub 开源计划（T2）公开。
---

## 背景与我的角色

这是我给自己搭的"第二个项目就不从零开始"体系：把验证过的显示、通信、算法代码沉淀成可克隆、可自检、可同步的模板与模块库，再把测量与回归做成机器可读的计划驱动工具。全部由我设计并实现，AI 协作完成初版文档与部分脚本。

## 系统架构

三层结构：

1. **模板区**——最小点亮底座、全功能仪器（中/英双界面）、LTDC 显示系统模板、STM32H743↔ZYNQ 双 SPI 页协议模板；只作克隆源，严禁直接开发。
2. **模块库**——Hardware 13 个硬件驱动 + Algorithm 9 组算法模块，新项目驱动优先取库。
3. **工具链**——`projclone.py`（克隆时排除缓存 + 三处改名 + 校验）、`template_selftest.py`（模板冒烟自检）、`translate_ui.py`（EN 界面翻译重刷）。

新项目三步：模板派生（dry-run 过目）→ CMake 编译烧录基线 → git init 提交基线。

## 技术亮点

### 1. JSON 计划驱动的自动测量台（AutoBench）

测量方案是一份机器可读的 JSON（v1 schema 校验），而不是一串手敲 SCPI：

- DG4062 激励双层限幅：计划上限 + **5 Vpp 不可提高的全局硬上限**
- `--dry-run` 零 socket 打印逐频点计划
- 离线阶段对 scope 分支硬拒绝（退出码 4），错误前缀 `[安全拒绝]` / `[离线硬门禁]`
- PC 端自算 Vpp 比值、幅频平坦度、THD、SNR、频率精度（Hann 窗 FFT + 抛物线插值），输出 CSV / Markdown / JSON / 曲线 PNG
- 10 项单元测试覆盖计划展开、硬上限拒绝、dry-run 无 socket、算法正确性

模拟验证数值：20 点幅频平坦度 0.0432 dB；1 kHz THD 0.113%、SNR 67.96 dB、频率误差 5.49 ppm。

### 2. PC 端算法回归仿真台（SignalHost）

"合成激励 → 外部 SignalCore 源码 → CSV/JSON → 三联图 → 自动验收"：CMake 用 `SIGNALHOST_CORE_DIR` 引用算法正本，不复制源码；自带 CMSIS API 最小兼容层，主机端一键跑双音、扫频、SNR 退化三组用例，末行 `PASS:` 才算过。

![MSO4104B 实测：双通道波形与自动测量](/assets/covers/stm32-infra.webp)
![MSO4104B 实测：电流方向验证](/assets/shots/autobench-scope-current.webp)

### 3. 协议模板的工程纪律

H743↔ZYNQ 双 SPI 页协议模板（v0.3）：六层解耦（协议/会话/传输/端口/业务/RTOS）、CRC32C、ACK/NACK、Credit 流控、重传与 Reset Epoch；协议层不依赖 HAL，主机侧单元测试不依赖 STM32 环境。

## 成果

- 模板克隆 → 编译 → 提交三步可复现，CN/EN 双模板成对同步
- 13 驱动 + 9 算法组持续回流：结项改进 diff 回库
- AutoBench / SignalHost 均有验收记录与单元测试
- 维护三条铁律成文：改模板必跑自检、新项目只从模板派生、构建产物永不入库
