export const GROUPS = {
  signal: {
    label: '嵌入式与信号处理',
    desc: 'STM32H743 / FPGA / DSP：固件、采集链与信号分析',
  },
  pc: {
    label: 'PC 工具与自动化',
    desc: '仪器控制、MCP 服务与开发者工具',
  },
  ai: {
    label: 'AI 工具链',
    desc: '本地模型部署、素材生产管线与 AI 协作系统',
  },
} as const;

export type GroupKey = keyof typeof GROUPS;
