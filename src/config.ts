/**
 * 站点全局配置：改这里即可更新全站联系方式与身份信息。
 * ⚠️ 部署前核对：github / gitee 用户名与邮箱为占位符，替换后再部署。
 */
export const SITE = {
  /** 站点名（<title> 后缀） */
  title: '唐泽瀚 · 作品集',
  /** 首页主标题 */
  name: '唐泽瀚',
  /** 拼音名（英文场合） */
  nameEn: 'Tang Zehan',
  /** 一句话定位 */
  tagline: '嵌入式与信号处理方向 · 把想法做成能跑的实物',
  /** 二维码落地页的一句话（About 页复用） */
  intro:
    '电子/嵌入式方向学生工程师。主力方向：STM32H743 固件与 DSP 管线、FPGA 数字采集链、PC 端仪器自动化与 AI 工具链。习惯把每个项目做成"有原理图、有实测数据、有演示视频"的可验证交付物。',
  /** 邮箱（占位，部署前替换） */
  email: 'mailto:1815222138@qq.com',
  /** 外链（占位，T2 推送后替换为真实用户名） */
  github: 'https://github.com/TZH-user',
  gitee: 'https://gitee.com/bending-the-willow-branches',
  /** 备案前引导（微信内打开提示） */
  wechatTip: '本站直连国内节点；若微信内加载异常，点击右上角"在浏览器打开"。',
} as const;

export type SiteConfig = typeof SITE;
