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

---

# 20V 供电公共点

## 名称

- **20V 公共供电点** / **20V 供电公共点**
- 也称: **Vin 公共点**、**上管 Drain 公共点**

## 位置

多路 Buck 变换器上管 MOSFET 的 Drain 极汇合点，统一接至 20V 公共供电轨。

```
20V 公共供电轨 ──┬── 上管(MOSFET) Drain ──┬── 电感 → 输出 → [Buck 1: VCore]
                 │                         │
                 ├── 上管(MOSFET) Drain ──┼── 电感 → 输出 → [Buck 2: VCCSA]
                 │                         │
                 ├── 上管(MOSFET) Drain ──┴── 电感 → 输出 → [Buck 3: VCCIO]
                 │
                 └── ... (其他 Buck 路)
```

> 主板上几乎所有 Buck 电路的上管 Drain 都挂在这条 20V 公共轨上，它不是某个单路 Buck 的专属节点，而是整板统一的功率供电母线。

## 特征

| 项目 | 说明 |
|------|------|
| **电压** | 典型 19V~20V DC（适配器输入或电池升压后），笔记本主板通常 19V |
| **性质** | 直流供电轨，不随 PWM 开关动作翻转 |
| **电流** | 各路 Buck 上管导通电流的总和，峰值可达数十安培 |
| **纹波** | 各路上管开关时从公共点抽取脉冲电流，会在 20V 轨上产生纹波，需靠前级电容滤波 |

## Layout 要点

| 要点 | 说明 |
|------|------|
| **铜皮宽度** | 20V 轨承载整板总功率，走线 / 铜皮需足够宽，或使用大面积内层 Plane 供电 |
| **滤波电容** | 每路上管 Drain 就近放置 MLCC 滤波电容（典型 10µF~22µF × N），为开关瞬间提供低阻抗电流回路 |
| **电流路径** | 确保 20V → 上管 Drain → 上管 Source(SW) → 电感 的大电流回路面积尽量小 |
| **远离敏感信号** | 虽为直流，但上管开关时 Drain 节点仍有高频 di/dt 脉冲电流，滤波电容的布局决定噪声耦合强度 |
| **过孔数量** | 若 20V 走线换层，需足够过孔载流，避免过孔发热烧断 |

## 常见故障

| 现象 | 可能原因 | 检查点 |
|------|----------|--------|
| 20V 公共点对地短路 | 某路上管击穿（D-S 短路） | 逐路断开电感/上管，分段排查短路 |
| 20V 输入电压偏低 | 适配器功率不足 / 前级供电异常 | 断开后级负载测 20V 是否恢复 |
| 多路输出同时异常 | 20V 公共轨纹波过大 | 示波器 AC 耦合测 20V 轨纹波，检查公共点滤波电容 |
| 上管批量烧毁 | 20V 轨过压冲击 | 检查适配器输出电压、TVS 保护管是否失效 |
| 局部铜皮烧断 | 20V 铜皮载流不够 / 过孔不足 | 红外热像看热点，计算铜皮截面积是否满足电流需求 |

---

# BQ24780S 充电控制器

> 数据来源: TI bq24780S 数据手册 ZHCSG48C (2015.04 – 2017.03修订)
> SMBus 地址: 0x12H (7-bit: 0b00010010)
> ManufacturerID: 0x0040H | DeviceID: 0x0030H
> 封装: WQFN-28 (RUY), 4.00 × 4.00 mm²

---

## 概述

bq24780S 是一款高效同步降压电池充电控制器，支持**混合动力升压模式** (Hybrid Power Boost Mode，原称 Turbo Boost Mode)。适用于 1~4 节串联锂电池充电，通过 SMBus 与 EC/Host 通信，具有高精度电流/功率监视和 CPU PROCHOT 功能。

### 核心特性

| 项目 | 参数 |
|------|------|
| **输入电压** | 4.5V ~ 24V (绝对最大值 30V) |
| **充电电压** | 1.024V ~ 19.2V (16mV 步长, ±0.4% 精度) |
| **充电电流** | 最大 8.128A (64mA 步长, ±2% 精度) |
| **放电电流** | 最大 8.192A (512mA 步长, ±2% 精度) |
| **输入电流** | 最大 8.064A (128mA 步长, ±2% 精度) |
| **支持电池** | 1~4 节 Li-Ion/Li-Polymer/LiFePO4/PbA/NiCd/NiMH |
| **开关频率** | 600kHz / 800kHz (默认) / 1MHz |
| **控制接口** | SMBus (slave only) |
| **待机电流** | 0.65mA (适配器待机, 符合 Energy Star) |
| **充电拓扑** | 同步降压 (Synchronous Buck) |
| **温度范围** | -40°C ~ +85°C |

---

## 引脚排列 (WQFN-28, Top View)

```
                       VCC  PHASE  HIDRV  BTST  REGN  LODRV  GND
                       28    27     26     25    24    23     22

     ACN          1                                                21    ILIM
     ACP          2                                                20    SRP
     CMSRC        3                                                19    SRN
     ACDRV        4                     Thermal                    18    BATDRV
     ACOK         5                      Pad                       17    BATSRC
     ACDET        6                                                16    TB_STAT
     IADP         7                                                15    BATPRES

                       8      9      10     11    12    13     14

                      IDCHG  PMON  PROCHOT  SDA  SCL  CMPIN  CMPOUT
```

---

## 引脚功能详解

### 电源与系统侧

| 引脚 | 名称 | 类型 | 功能说明 |
|------|------|------|----------|
| 28 | **VCC** | 电源输入 | IC 供电输入，来自适配器或电池。通过二极管 OR 连接。建议用 10Ω + 1µF 低通滤波 |
| 1 | **ACN** | 模拟输入 | 输入电流检测电阻负端，对地接 0.01µF 共模滤波电容 |
| 2 | **ACP** | 模拟输入 | 输入电流检测电阻正端，对地接 0.1µF 共模滤波电容。ACN-ACP 之间接 0.1µF 差模滤波 |
| 3 | **CMSRC** | 输入 | ACDRV 电荷泵源端输入，接 ACFET(Q1) 和 RBFET(Q2) 的共源极。串 4kΩ 电阻限流 |
| 17 | **BATSRC** | 输入 | BATFET 源极连接。BATDRV 电压 = BATSRC + 6V |
| 22 | **GND** | 地 | IC 地。Layout 时接模拟地平面，仅通过 IC 底部 PowerPAD 与功率地星形连接 |

### 栅极驱动

| 引脚 | 名称 | 类型 | 功能说明 |
|------|------|------|----------|
| 4 | **ACDRV** | 输出 | ACFET/RBFET 电荷泵驱动输出。ACOK 有效时 = CMSRC + 6V。串 4kΩ 到栅极 |
| 18 | **BATDRV** | 输出 | BATFET 电荷泵驱动输出。导通时 = BATSRC + 6V，关断时短路到 BATSRC。串 4kΩ 到栅极 |
| 26 | **HIDRV** | 输出 | 上管 (High-side) N-MOSFET 栅极驱动 |
| 27 | **PHASE** | 输入 | 上管驱动源极，接上管 N-MOSFET 源极 (即 SW 节点) |
| 23 | **LODRV** | 输出 | 下管 (Low-side) N-MOSFET 栅极驱动 |
| 25 | **BTST** | 电源 | 上管驱动自举电源，接 47nF 电容到 PHASE。REGN 到 BTST 的二极管已集成在 IC 内 |
| 24 | **REGN** | 输出 | 6V LDO 输出 (由 VCC 产生)。接 ≥ 2.2µF 0603 陶瓷电容到 GND。ACDET > 0.6V 且 VCC > UVLO 时有效 |

### 充电电流检测

| 引脚 | 名称 | 类型 | 功能说明 |
|------|------|------|----------|
| 20 | **SRP** | 模拟输入 | 充电电流检测电阻正端。SRP-SRN 之间接 0.1µF 差模滤波 |
| 19 | **SRN** | 模拟输入 | 充电电流检测电阻负端 (兼电池电压检测)。对地接 0.1µF 共模滤波 |
| 21 | **ILIM** | 模拟输入 | 充电/放电电流实时限制。V_ILIM = 20×(VSRP-VSRN) 充电, = 5×(VSRN-VSRP) 放电。用电阻分压器从 3.3V 设定。最小值 120mV 使能 |

### 适配器检测

| 引脚 | 名称 | 类型 | 功能说明 |
|------|------|------|----------|
| 6 | **ACDET** | 模拟输入 | 适配器检测输入。用电阻分压器设定阈值。> 0.6V 开启偏置电路，> 2.4V 且 VCC 正常则 ACOK 变高 |
| 5 | **ACOK** | 开漏输出 | 适配器存在指示 (高有效)。外接 10kΩ 上拉电阻。ACDET > 2.4V、VCC 在 UVLO 和 ACOVP 之间、VCC > BAT 时变高 |

### 监视输出

| 引脚 | 名称 | 类型 | 功能说明 |
|------|------|------|----------|
| 7 | **IADP** | 模拟输出 | 适配器电流缓冲输出。V = 20x 或 40x × V(ACP-ACN)。接 ≤100pF 退耦电容。不用可悬空 |
| 8 | **IDCHG** | 模拟输出 | 电池放电电流缓冲输出。V = 8x 或 16x × V(SRN-SRP)。接 ≤100pF 退耦电容。不用可悬空 |
| 9 | **PMON** | 模拟输出 | 系统总功率监视。输出电流 ∝ (适配器功率 + 电池功率)。外接电阻转电压。接 ≤100pF 退耦电容 |

### 逻辑与控制

| 引脚 | 名称 | 类型 | 功能说明 |
|------|------|------|----------|
| 11 | **SDA** | I/O 开漏 | SMBus 数据线。接 10kΩ 上拉电阻。VCC > UVLO 后通信开始 |
| 12 | **SCL** | 输入 | SMBus 时钟线。接 10kΩ 上拉电阻 |
| 10 | **PROCHOT** | 开漏输出 | 处理器热量指示 (低有效)。监视适配器电流/放电电流/系统电压等事件，触发后最少 10ms 脉冲 |
| 13 | **CMPIN** | 模拟输入 | 独立比较器输入。基准/极性/去抖时间由 SMBus 设定。不用时接 GND |
| 14 | **CMPOUT** | 开漏输出 | 独立比较器输出。接 10kΩ 上拉。不用时悬空 |
| 15 | **BATPRES** | 输入 | 电池存在指示 (低有效)。低=电池存在，高=电池不在。变高时退出 LEARN，100µs 内开启 ACFET/RBFET |
| 16 | **TB_STAT** | 开漏输出 | 升压模式指示 (低有效)。IC 处于混合动力升压模式时拉低。接 10kΩ 上拉 |

---

## 内部框图要点

```
VCC ──→ UVLO ──→ REGN LDO (6V)
ACDET ──→ 0.6V Wakeup / 2.4V ACOK 比较器
ACP/ACN ──→ 20x/40x IADP 缓冲器 ──→ IADP 引脚
SRP/SRN ──→ 16x IDCHG 缓冲器 ──→ IDCHG 引脚
ACP/ACN + SRP/SRN ──→ PMON 功率计算 ──→ PMON 引脚
SDA/SCL ──→ SMBus 接口 ──→ 寄存器组 (ChargeOption/Current/Voltage)
PWM 控制 ──→ HIDRV/LODRV 栅极驱动
电荷泵 ×2 ──→ ACDRV (CMSRC+6V) / BATDRV (BATSRC+6V)
保护: ACOVP(26V) / ACOC / BATOVP(104%) / CHGOCP / TSHUT(155°C) / MOSFET短路
```

---

## 关键电气参数

| 参数 | 条件 | 最小值 | 典型值 | 最大值 | 单位 |
|------|------|--------|--------|--------|------|
| VCC 工作电压 | - | 4.5 | - | 24 | V |
| VCC UVLO 上升阈值 | VCC 上升 | 2.4 | 2.6 | 2.8 | V |
| ACOK 上升阈值 | ACDET 上升 | 2.375 | 2.4 | 2.425 | V |
| ACOVP 阈值 | VCC 上升 | 24 | 26 | 28 | V |
| REGN 输出 | VCC > UVLO | 5.7 | 6.0 | 6.3 | V |
| 充电电压精度 | -10~85°C | -0.4% | - | +0.4% | - |
| 充电电流精度 | 4A 档 | -2% | - | +2% | - |
| 输入电流精度 | 4A 档 | -2% | - | +2% | - |
| 放电电流精度 | 8A 档 | -2% | - | +2% | - |
| IADP 增益 | REG0x12[4]=0 | - | 20 | - | V/V |
| IDCHG 增益 | REG0x12[3]=1 | - | 16 | - | V/V |
| 开关频率 | REG0x12[9:8]=01 (默认) | 680 | 800 | 920 | kHz |
| 热关断 | 上升 | - | 155 | - | °C |
| 热关断回滞 | 下降 | - | 20 | - | °C |
| 适配器待机电流 | 充电禁止 | 0.65 | 0.8 | - | mA |
| 电池模式电流 | Low Power Mode | - | 5 | - | µA |

---

## SMBus 寄存器一览

| 地址 | 寄存器名 | 读写 | 说明 | 默认值 |
|------|----------|------|------|--------|
| 0x12H | ChargeOption0() | R/W | 充电选项 0 (低功耗/看门狗/频率/LEARN/增益/禁充) | 0xE108H |
| 0x14H | ChargeCurrent() | R/W | 充电电流设定 (7-bit) | 0x0000H |
| 0x15H | ChargeVoltage() | R/W | 充电电压设定 (11-bit) | 0x0000H |
| 0x39H | DischargeCurrent() | R/W | 放电电流限制 (6-bit) | 0x1800H (6144mA) |
| 0x3FH | InputCurrent() | R/W | 输入电流限制 (6-bit) | 0x1000H (4096mA) |
| 0x37H | ChargeOption3() | R/W | 充电选项 3 (Boost使能/ACOC等) | 0x1A40H |
| 0x38H | ChargeOption2() | R/W | 充电选项 2 | 0x0384H |
| 0x3BH | ChargeOption1() | R/W | 充电选项 1 (电池耗尽/PMON/比较器) | 0xC210H |
| 0x3CH | ProchotOption0() | R/W | PROCHOT 选项 0 (ICRIT/INOM阈值等) | 0x4A54H |
| 0x3DH | ProchotOption1() | R/W | PROCHOT 选项 1 (IDCHG阈值等) | 0x8120H |
| 0x3AH | ProchotStatus() | R | PROCHOT 触发状态 | 0x0000H |
| 0xFEH | ManufacturerID() | R | 制造商 ID | 0x0040H |
| 0xFFH | DeviceID() | R | 器件 ID | 0x0030H |

---

## ChargeOption0() (0x12H) 位详解

| 位 | 名称 | 说明 |
|----|------|------|
| [15] | EN_LWPWR | 电池模式下低功耗使能 (默认 1: 最低静态电流) |
| [14:13] | WDTMR_ADJ | 看门狗定时器: 00=禁, 01=5s, 10=88s, 11=175s (默认) |
| [9:8] | PWM_FREQ | 开关频率: 00=600k, 01=800k (默认), 10=1MHz |
| [5] | EN_LEARN | 电池 LEARN 模式使能 |
| [4] | IADP_GAIN | IADP 增益: 0=20x (默认), 1=40x |
| [3] | IDCHG_GAIN | IDCHG 增益: 0=8x, 1=16x (默认) |
| [0] | CHRG_INHIBIT | 充电禁止: 0=使能 (默认), 1=禁止 |

---

## ChargeOption1() (0x3BH) 位详解

| 位 | 名称 | 说明 |
|----|------|------|
| [15:14] | BAT_DEPL_VTH | 电池耗尽阈值: 00=59%, 01=63%, 10=67%, 11=71% 充电电压 (默认) |
| [13:12] | RSNS_RATIO | 输入/充电检测电阻比: 00=1:1(默认), 01=2:1, 10=1:2 |
| [11] | EN_IDCHG | 放电电流输出使能 |
| [10] | EN_PMON | 功率监视输出使能 |
| [9] | PMON_RATIO | PMON 增益: 0=0.25µA/W, 1=1µA/W (默认, 10mΩ) |
| [7] | CMP_REF | 独立比较器基准: 0=2.3V(默认), 1=1.2V |
| [6] | CMP_POL | 比较器极性: 0=CMPIN>阈值时CMPOUT=LOW(默认) |
| [5:4] | CMP_DEG | 比较器去抖: 00=禁, 01=1µs(默认), 10=2ms, 11=5s |
| [3] | EN_FET_LATCHOFF | 比较器触发时锁存关断 ACFET/RBFET |
| [1] | EN_SHIP_DCHG | SRN 放电 5mA/140ms (用于出货模式) |

---

## ChargeOption3() (0x37H) 位详解

| 位 | 名称 | 说明 |
|----|------|------|
| [15] | EN_IDCHG_REG | 放电电流调节使能 |
| [12] | ACOK_DEG | ACOK 去抖: 0=150ms, 1=1.3s (默认) |
| [11] | ACOK_STAT | 适配器存在状态 (只读) |
| [10] | EN_ACOC | ACOC 保护使能 |
| [9] | ACOC_VTH | ACOC 阈值: 0=125% ICRIT, 1=200% ICRIT (默认) |
| [7] | IFAULT_HI | 上管 VDS 短路检测: 0=禁, 1=750mV |
| [6] | IFAULT_LO | 下管 VDS 短路检测: 0=禁, 1=250mV (默认) |
| [5] | FDPM_VTH | 快速 DPM 阈值: 0=107%(默认), 1=115% |
| [4:3] | FDPM_DEG | 快速 DPM 去抖: 00=150µs(默认), 01=250µs, 1X=50µs |
| [2] | EN_BOOST | 混合动力升压模式使能 |
| [1] | BOOST_STAT | 升压模式状态 (只读) |

---

## 工作模式

### 1. 电池充电模式 (Buck)
- 恒流 (CC) → 恒压 (CV) 标准充电曲线
- 使能条件: ACOK 有效、ILIM > 120mV、寄存器有效值、ACFET/RBFET 导通、无 BATOVP、无 TSHUT
- 内置软启动: 128mA 起步, 64mA/400µs 步进

### 2. 混合动力升压模式 (Hybrid Power Boost)
- 系统功率需求 > 适配器能力时，电池放电补充
- 进入升压模式瞬态响应: 150µs
- 适配器电流被限制在 InputCurrent() 设定值
- REG0x37[2] 使能, TB_STAT 引脚指示状态
- 输入电流需 > 1536mA (10mΩ 检测电阻) 才能支持

### 3. 电池 LEARN 模式
- REG0x12[5] 使能，ACFET/RBFET 关闭，BATFET 开启
- 电池放电至耗尽阈值后自动退出
- 用于电池电量计校准

---

## 系统电源选择逻辑

```
适配器插入 ──→ ACDET > 2.4V ──→ ACOK 变高 ──→ ACFET/RBFET 导通 ──→ 系统由适配器供电
电池模式   ──→ ACOK 低 ──→ BATFET 导通 ──→ 系统由电池供电
LEARN 模式 ──→ ACFET/RBFET 关断 + BATFET 导通 ──→ 电池放电
ACFET 快速导通: 100µs (BATPRES 变高时)
ACOK 上升去抖: 首次 150ms, 后续 1.3s
```

**ACFET/RBFET 关断条件:**
- ACOK 低
- LEARN 模式下电池电压 > 耗尽阈值
- ACOVP (VCC > 26V)
- 7 次导通失败锁存 (90s 内)

**BATFET 导通条件:**
- VCC > UVLO
- ACN < SRN + 200mV
- ACFET/RBFET 关断

---

## 保护功能汇总

| 保护类型 | 阈值 | 响应 |
|----------|------|------|
| **ACOVP** (适配器过压) | VCC > 26V | ACOK 拉低, ACFET/RBFET 关断, BATFET 导通 |
| **ACOC** (输入过流) | 1.25x 或 2x ICRIT | 12ms 去抖后 ACFET/RBFET 锁存关断 |
| **BATOVP** (电池过压) | SRN > 104% 充电电压 | PWM 停止, SRP 6mA 下拉放电, 超30ms 彻底禁充 |
| **CHGOCP** (充电过流) | 60/90/120mV (SRP-SRN) | 逐周期限流 |
| **BATLOWV** (电池低压) | SRN < 2.5V | 充电电流限制 0.5A (10mΩ), LSFET 仅刷新 BTST |
| **TSHUT** (热关断) | Tj > 155°C | 转换器关断, REGN 限流 14mA, 降至 135°C 恢复 |
| **MOSFET 短路** | HS: 750mV, LS: 250mV Vds | 7 次后锁存关断 |
| **看门狗** | 175s 未收到 ChargeVoltage/ChargeCurrent 写 | 转换器暂停 |

---

## PROCHOT 触发事件

| 事件 | 说明 | 寄存器 |
|------|------|--------|
| **ICRIT** | 适配器峰值电流 (默认 150% 输入电流限制) | REG0x3C[15:11] |
| **INOM** | 适配器平均电流 (默认 110% 输入电流限制) | REG0x3C[10:8] |
| **IDCHG** | 电池放电电流 | REG0x3D[15:11] |
| **VSYS** | 系统电压 (SRN, 2s-4s 电池) | REG0x3C[7:6] |
| **ACOK** | 适配器移除 (ACOK 高→低) | 单次触发 |
| **BATPRES** | 电池移除 (BATPRES 低→高) | 单次触发 |
| **CMPOUT** | 独立比较器输出 (CMPOUT 高→低) | 可编程去抖 |

PROCHOT 脉冲最小宽度: 10ms (默认 REG0x3C[4:3]=10)

---

## 典型应用电路要点

### 功率级
```
适配器 ──→ ACFET ──→ RBFET ──→ 检测电阻 RAC ──→ SYS (系统电源轨)
                                          │
                                     BATFET ──→ 检测电阻 RSR ──→ 电池
                                          │
                                    Buck 上管 ──→ 电感 ──→ 电池
                                          │
                                    Buck 下管 ──→ GND
```

### 检测电阻
- RAC (输入检测): 典型 10mΩ
- RSR (充电检测): 典型 10mΩ
- 可配比: 1:1, 2:1, 1:2 (REG0x3B[13:12])

### 建议元件值 (800kHz)

| 充电电流 | 电感 Lo | 输出电容 Co | 检测电阻 |
|----------|---------|-------------|----------|
| 2A | 6.8/8.2µH | 20µF | 10mΩ |
| 3A | 5.6/6.8µH | 20µF | 10mΩ |
| 4A | 3.3/4.7µH | 20µF | 10mΩ |
| 6A | 3.3µH | 30µF | 10mΩ |
| 8A | 2.2µH | 40µF | 10mΩ |

### Layout 要点
- 大电流路径 (VCC→ACFET→RBFET→RAC→电感→电池) 铜皮要宽
- SRP/SRN 开尔文连接直接到检测电阻两端，差分走线
- PowerPAD 必须焊接到底层散热焊盘，打孔连接到模拟地和功率地
- 模拟地和功率地仅在 PowerPAD 处星形连接
- BTST 电容 (47nF) 尽量靠近 BTST 和 PHASE 引脚
- REGN 电容 (≥2.2µF) 靠近 REGN 引脚
- ACDRV/CMSRC/BATDRV 各串 4kΩ 限流电阻

---

## 常见故障排查

| 现象 | 可能原因 | 检查点 |
|------|----------|--------|
| 不充电 | CHRG_INHIBIT 置 1 | REG0x12[0] 是否为 0 |
| 不充电 | ILIM < 120mV | ILIM 分压电阻是否正常 |
| 不充电 | ACOK 未变高 | ACDET 分压 > 2.4V? VCC > UVLO? |
| 不充电 | 看门狗超时 | EC 是否 175s 内写 ChargeVoltage/ChargeCurrent |
| ACFET 不导通 | ACOK 去抖未完成 | 首次 150ms, 后续 1.3s |
| ACFET 锁存关断 | 7 次导通失败或 ACOC | 检查 Cgs/Cgd 比例, 去除适配器复位 |
| 充电电流小 | BATLOWV 触发 | SRN < 2.5V? 电池深度放电? |
| PROCHOT 一直触发 | 适配器功率不足 | 检查 IADP 电压、INOM/ICRIT 阈值设定 |
| 升压模式不工作 | REG0x37[2] 未使能 | 写 1 到 REG0x37[2] |
