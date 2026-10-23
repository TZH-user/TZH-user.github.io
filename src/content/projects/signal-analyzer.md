---
title: 简易通信信号分析仪
group: signal
tier: featured
weight: 10
period: 2025 · 校电赛 C 题
tags: [STM32H743, FreeRTOS, LVGL, AD9959, 双ADC, CMake, DSP]
cover: /assets/covers/signal-analyzer.webp
coverAlt: 系统框图：IQ 混频 + AD9959 正交本振 + STM32H743 双 ADC 采集
summary: 从原理图到固件全链自研的通信信号分析仪——IQ 混频前端 + 1.024 MHz 双 ADC 同步采集 + 11 种调制识别解调，LVGL 触摸屏交互。
metrics:
  - { label: 双 ADC 同步采样, value: 1.024 MHz }
  - { label: 调制识别/解调, value: 11 种 }
  - { label: 触摸屏界面, value: 800×480 }
  - { label: 抗混叠低通, value: 4 阶 1 MHz }
repoNote: 仓库整理后随 GitHub 开源计划（T2）公开。
---

## 背景与我的角色

2025 年校级电子设计竞赛 C 题「简易通信信号分析仪」。我负责整体方案拆分、模拟前端原理图设计、STM32H743 固件架构与 DSP 管线实现——从 IQ 混频器的自绘原理图，到 FreeRTOS 任务编排，再到频谱/解调算法，全部自己动手。

## 系统架构

待测信号分两路：一路进检波电路送 ADC3 做包络辅助测量；另一路进 IQ 混频器，由 AD9959 输出正交本振（CH1=激励，CH2/CH3=LO）驱动混频，混频后的 I/Q 经运放、低通与电平抬升后，送入 STM32H743XIH6 的双 ADC 同步采样。

![系统框图：信号链与主控处理链路](/assets/covers/signal-analyzer.webp)

固件侧由 TIM6 触发双 ADC + DMA 循环搬运，DSP 管线输出波形、频谱、星座图、Bode/Smith 预览与调制识别结果，LVGL 界面呈现，控制层回调 DDS 参数，QSPI 存储器保存运行配置。

## 技术亮点

### 1. 自绘模拟前端原理图

IQ 混频 + 后级运放 + 4 阶 1 MHz 巴特沃斯低通一张图，I/Q 电平抬升与保护单独一张图——不是套参考设计，是按题目指标自己算出来的链路。

![IQ 混频器原理图](/assets/shots/signal-iq-mixer.webp)
![I/Q 电平抬升电路](/assets/shots/signal-level-shift.webp)

### 2. 双 ADC 同步采集管线

ADC1/ADC2 同时采样 I/Q，TIM6 触发、固定 1.024 MHz 采样率、DMA 循环搬运，软件侧再做去均值居中——采集不是占位接口，而是实装链路。

### 3. 完整 DSP 分析与调制识别

DSP 管线覆盖波形 / 频谱 / 星座图 / Bode / Smith 预览，解调识别实现 11 种调制类型：

```
CW · AM · FM · PM · ASK · FSK · PSK · DPSK · QPSK · DQPSK · 16QAM
```

支持自动识别与手动指定两种模式。

### 4. 参数持久化与工程化

QSPI Flash 双页轮换保存 + CRC 校验 + 上电恢复；CMake + 链接脚本完整工程，产出 `elf/hex/bin` 三种固件产物；串口 CLI 可运行时交互。

## 成果

- 固件编译产物齐备，工程可复现构建
- LVGL 定制六页面（Home / Wave / SDR / DDS / System / About），非示例改图
- SDRAM / QSPI 上电自检
- 异频接收扫描的软件接口已预留（BSP 弱符号）

## 相关说明

工程中两代架构并存的历史与取舍记录在项目文档中（`app_rtos.c` 主链路为现行版本），Bode/Smith 当前为预览能力，正式测量需后续校准闭环——这些边界在文档里写得很清楚，没有包装。
