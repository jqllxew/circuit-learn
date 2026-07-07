# RTC 相关信号整理

> **引脚固定性**: 对于同一颗南桥/PCH 型号，以上 5 个信号（RTCRST、SRTCRST、RTC_X1、RTC_X2、RTCVCC_3P3）的 Ball/Pin 位置由芯片 Datasheet 精确定义，是固定不变的。Layout 时直接按 datasheet 给出的 pin map 扇出即可，不同主板之间这部分接线完全一致。

---

## RTCRST

- **全称**: RTC Reset
- **功能**: RTC 电路复位信号，用于将 RTC 寄存器恢复为默认值
- **类型**: 输入信号 (Input)
- **有效电平**: 通常低电平有效
- **说明**:
  - 当此信号被拉低时，RTC 内部逻辑（除 RTC 电池备份域外）被复位
  - 通常连接到板上的 RTC 复位跳线或按键，用于清除 CMOS/BIOS 设置
  - 在正常运行时由 RTC 电池 (VBAT) 域上拉保持高电平
  - 触发 RTCRST 等同于 "CLR_CMOS" 操作

---

## SRTCRST

- **全称**: Secondary RTC Reset / Suspend RTC Reset
- **功能**: 辅助 RTC 复位信号
- **类型**: 输入信号 (Input)
- **有效电平**: 通常低电平有效
- **说明**:
  - Intel PCH 系列中引入的辅助 RTC 复位
  - 与 RTCRST 配合使用，在深度休眠或异常状态下提供更完整的 RTC 复位路径
  - 部分平台中作为 Intel Management Engine (ME) 的复位触发源之一
  - 在 S5/G3 状态下仍有效，确保 RTC 彻底复位

---

## RTC_X1

- **全称**: RTC Crystal Input 1
- **功能**: 32.768 kHz 晶振输入端
- **类型**: 模拟信号 (Analog)
- **说明**:
  - 连接外部 32.768 kHz 石英晶振的一个引脚
  - 与 RTC_X2 共同构成皮尔斯振荡器 (Pierce Oscillator)
  - 需要外接匹配电容（通常 10~18pF）到地
  - 走线应尽量短，包地处理，远离高速数字信号

---

## RTC_X2

- **全称**: RTC Crystal Input 2
- **功能**: 32.768 kHz 晶振输出端
- **类型**: 模拟信号 (Analog)
- **说明**:
  - 连接外部 32.768 kHz 石英晶振的另一个引脚
  - 与 RTC_X1 配对使用
  - 同样需要匹配电容
  - 晶振频率精度直接影响 RTC 走时准确性（典型偏差 ±20ppm）

---

## RTCVCC_3P3

- **全称**: RTC Voltage Supply 3.3V
- **功能**: RTC 核心电路 3.3V 供电
- **类型**: 电源 (Power)
- **电压**: 3.3V
- **说明**:
  - 系统 S0 状态下为 RTC 数字逻辑部分供电
  - 当系统进入 G3 (机械断电) 状态时，RTC 由 VBAT（纽扣电池）接管供电
  - 通常由主板 3.3V 待机电源轨 (3V3_SB/3V3_AUX) 产生
  - 供电切换逻辑确保在电源状态切换时 RTC 不掉电

---

## 供电架构总结

```
S0 状态:     RTCVCC_3P3 (3.3V) -> RTC 数字逻辑
G3/S5 状态:  VBAT (3.0V 纽扣电池) -> RTC 备份域 (仅保持时间和 CMOS 数据)

复位路径:    RTCRST / SRTCRST -> RTC 寄存器复位 (不影响备份域数据)
             CLR_CMOS 跳线 -> 同时清除 RTC 寄存器和 CMOS 校验和
```

## 常见故障排查

| 现象 | 可能原因 | 检查点 |
|------|----------|--------|
| 系统时间不准 | 晶振偏差大 | RTC_X1/X2 匹配电容、晶振本身 |
| CMOS 校验和错误 | RTC 掉电 | VBAT 电压、RTCVCC_3P3 切换电路 |
| 无法保存 BIOS 设置 | RTCRST 常低 | RTCRST 上拉电阻、跳线帽 |
| 开机卡 RTC 初始化 | 晶振不起振 | 晶振焊接、RTC_X1/X2 短路/开路 |
