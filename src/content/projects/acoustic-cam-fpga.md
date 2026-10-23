---
title: FPGA 声学相机 10 通道采集链
group: signal
tier: featured
weight: 20
period: 2026 夏 ~ 秋
tags: [Verilog, MAX 10, Cyclone IV, MATLAB, CIC, FIR, 定点化]
cover: /assets/covers/acoustic-cam.webp
coverAlt: 34 麦克风三臂螺旋阵列摆位图
summary: 10 通道 PDM 麦克风阵列采集链——RTL 与 MATLAB 定点金模型逐位一致，从 MAX 10 移植到 Cyclone IV 上板出 sof，支撑 34 麦 CBF 声学成像。
metrics:
  - { label: 采集通道, value: 10 ch × 24bit @ 16 kHz }
  - { label: 补偿 FIR, value: 72-tap 18×18bit }
  - { label: CIC 抽取, value: R=128 · N=4 }
  - { label: RTL↔金模型, value: 逐位一致 }
repoNote: 仓库整理后随 GitHub 开源计划（T2）公开。
---

## 背景与我的角色

声学相机项目里我负责数字采集链的全部 RTL 设计与定点化建模：把 PDM 麦克风比特流变成干净的多通道 24bit PCM，并用 MATLAB 建立逐位一致的定点金模型作为验收基准。项目先在 MAX 10（10M08SCE144）上调通，后移植到 Cyclone IV（EP4CE10）。

## 系统架构

```
PDM 1bit @2.048MHz（CPLD 同源扇出）
  → CIC 抽取 R=128 N=4（31bit 补码回卷）
  → 4 级差分（32bit 不回卷）
  → 舍入右移 12 位 + 饱和 → 18bit
  → 72-tap 补偿+抗混叠 FIR（18×18bit Q1.17，48bit 累加器）
  → 舍入右移 10 位 + 饱和 → 24bit PCM（Q1.23）
  → 一阶 DC 阻隔（≈20Hz @16k）
  → 16k × 24bit × 10 通道 → 串行帧上传
```

帧格式 288bit @9.216Mbps 源同步：`sync(0xA5C3) + id + fcnt + 10×24bit PCM + CRC8(poly 0x07)`，跨片对齐靠 CPLD 同源 PDM 时钟 + 同步复位 + 帧计数器。

## 技术亮点

### 1. 逐位一致的定点化规格

全部舍入约定 round-half-up、CIC 补码模 2^31 回卷、差分不回卷、FIR 整数累加无舍入、两级饱和——每个位宽与舍入点都写进《定点化规格》文档，RTL 与 MATLAB 金模型按同一约定实现，回归对比逐位一致，不靠"波形看起来差不多"。

### 2. 时分复用调度

clk_sys = 147.456 MHz = 72×PDM，每个 PDM 周期只有 18 拍计算窗。差分 50 拍 + FIR/DC 770 拍 ≈ 36% 计算窗占用；所有子调度器按跨间隙连续的 comp_cnt 排程，间隙内状态保持，tick 边界才复位。

### 3. 资源约束下的架构取舍

10M08SCE144（EQFP144）可用逻辑上限 504 LAB，N=5 的 CIC 放不下——主动降为 N=4，省出约 120 LAB，代价是第一镜像抑制 −76→−61dB；叠加 ΣΔ 噪声整形后带内混叠仍远低于麦克自噪底，满足"带内混叠不可见"。这是写在文档里的量化取舍，不是拍脑袋。

### 4. 上板与阵列验收

![34 麦三臂螺旋阵列摆位](/assets/covers/acoustic-cam.webp)

EP4CE10 移植后跑通位真/门级回归并出 sof 上板。34 麦克风（三臂螺旋）接线定稿后全扫验收 34/34 全通；中心轴音箱标定 34 麦 RMS 一致性 ±4.9dB，兼作 CBF 幅度补偿参考。

![34 路接线全通后的验收扫描](/assets/shots/acoustic-mic-check.webp)
![实时波形工具](/assets/shots/acoustic-live-scope.webp)

### 5. 成像链验证

合成 1kHz 源验证帧方位 120° 精确反演、坏麦门限自动剔除；1.5M 提速后真实抓帧，10 帧压力测试零丢失。

## 成果

- RTL 与 MATLAB 金模型逐位一致（位真回归归档）
- EP4CE10 上板 sof 交付
- CBF 相干成像链验证通过
- 全部定点约定、调度约束与帧格式有成文规格，可复现
