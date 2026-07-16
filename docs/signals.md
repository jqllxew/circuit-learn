# 信号索引

主板常见信号双向查询表：**信号名 ↔ 释义 ↔ 常见电路 ↔ 典型 IC**。

- 想查某个信号是什么意思 → 在下面用 Ctrl+F 搜信号名
- 想知道某类电路有哪些信号 → 跳"常见电路"列的链接到电路页
- 想知道某颗 IC 涉及哪些信号 → 在下面搜 IC 型号

**约定：** `#` 结尾表示低有效 (Active Low)；同一信号在不同厂商 datasheet 里的别名放在括号里。

---

## A. 使能 / 开关

| 信号 | 释义 | 有效电平 | 常见电路 | 典型 IC |
|------|------|----------|----------|---------|
| **PWRBTN#** | 用户按下电源键，EC 检测后转给 PCH | 低 | [上电时序](power-on-sequence.md) | EC → PCH |
| **VR_ON** | CPU VRM 使能，EC 拉高开启核心供电 | 高 | [CPU 平台供电](cpu-power.md) | LTC3735, ISL95820 |
| **EN / EN5 / EN3** | 通用使能引脚，Buck 控制器开关 | 高 | [3/5V 系统供电](system-power.md) | TPS51125, RT8206 |
| **VDDQ_EN** | 内存主供电使能，S3 睡眠仍需保持 | 高 | [内存供电](memory-power.md) | RT8231, TPS51116 |
| **VTT_EN** | 内存终结电压使能，S3 关断 | 高 | [内存供电](memory-power.md) | RT8231, TPS51116 |
| **S4_ON / S3_EN** | 电源状态转换命令（EC → 各路 Buck） | 高 | [上电时序](power-on-sequence.md) | EC 输出 |
| **CHRG_INHIBIT** | 充电禁止（SMBus 寄存器位 REG0x12[0]） | 位=1 | [隔离保护](isolation-protection.md) | BQ24780S, BQ24727 |

## B. 电源好 (Power Good / OK)

| 信号 | 释义 | 有效电平 | 常见电路 | 典型 IC |
|------|------|----------|----------|---------|
| **PGOOD** | 通用电源好，Buck 输出稳定后拉高 | 高 | 所有 PWM 电路 | 几乎所有 Buck |
| **VR_PWRGD** | CPU VRM 电源好，PCH 释放 PLTRST# 的前置条件 | 高 | [CPU 平台供电](cpu-power.md) | LTC3735 等 |
| **ALLPWRPG** | 所有次级电源就绪（EC 综合信号） | 高 | [上电时序](power-on-sequence.md) | EC 输出 |
| **S4_PG / S3_PG** | 深/浅睡眠电源稳定 | 高 | [上电时序](power-on-sequence.md) | 分级 PowerGood |
| **DSW_PWROK** | PCH 深睡域电源好 | 高 | [EC 待机架构](ec-standby.md) | PCH 输入 |
| **PCH_PWROK** | PCH 总电源好，所有主域 OK | 高 | [上电时序](power-on-sequence.md) | PCH 输入 |

## C. 睡眠 / 复位

| 信号 | 释义 | 有效电平 | 常见电路 | 典型 IC |
|------|------|----------|----------|---------|
| **SLP_S3# / SLP_S4# / SLP_S5#** | PCH 输出的睡眠状态，EC 据此开关对应供电 | 低=睡 | [上电时序](power-on-sequence.md) | PCH → EC |
| **SLP_SUS# / PM_SLP_SUS#** | 挂起状态许可 | 低=挂起 | [EC 待机架构](ec-standby.md) | PCH → EC |
| **RSMRST#** | 待机复位，EC 通知 PCH 待机供电就绪后释放 | 低=复位 | [EC 待机架构](ec-standby.md) | EC → PCH |
| **PLTRST#** | 平台复位，PCH 拉低时全平台保持复位 | 低=复位 | [上电时序](power-on-sequence.md) | PCH 输出 |
| **CPU_RESET#** | CPU 复位，16 步上电最后一步释放 | 低=复位 | [上电时序](power-on-sequence.md) | PCH → CPU |
| **RTCRST** | RTC 复位（触发即 CLR_CMOS） | 低=复位 | [RTC 信号](rtc-signals.md) | PCH RTC |
| **SRTCRST** | 辅助 RTC 复位，S5/G3 仍有效 | 低=复位 | [RTC 信号](rtc-signals.md) | PCH RTC |

## D. 通信

| 信号 | 释义 | 常见电路 | 典型 IC |
|------|------|----------|---------|
| **SDA / SCL** | SMBus/I2C 数据/时钟，EC 读写充电/电池/电源 IC | [隔离保护](isolation-protection.md) | BQ24780S, ISL88731A, 智能电池 |
| **SVC / SVD / ALERT#** | SVID 三线，CPU ↔ VRM 动态调压 | [CPU 平台供电](cpu-power.md) | LTC3735, ISL95820, RT3624BE |
| **ESPI (CS# / CLK / RST# / IO0-3)** | EC ↔ PCH 专用总线 | [EC 待机](ec-standby.md) | EC + PCH |
| **PSID / BOOT_VID** | 平台 ID / 起始 VID，VRM 上电前读取选参数表 | [CPU 平台供电](cpu-power.md) | LTC3735 等 |
| **SMBus Alert** | 从设备主动拉低 ALERT#，通知 EC 有故障 | [隔离保护](isolation-protection.md) | 充电 IC / 智能电池 |

## E. 反馈 / 检测

| 信号 | 释义 | 常见电路 | 典型 IC |
|------|------|----------|---------|
| **FB** | 输出电压反馈（分压后进比较器） | 所有 PWM | 几乎所有 Buck |
| **COMP** | 环路补偿引脚（外接 RC） | 所有 PWM | 电压模式 Buck |
| **SRP / SRN** | 充电电流检测（跨检测电阻的差分输入） | [隔离保护](isolation-protection.md) | BQ24780S, ISL88731A |
| **ACP / ACN** | 适配器电流检测（差分） | [隔离保护](isolation-protection.md) | BQ24780S, ISL88731A |
| **IMON / IOUT** | 输出电流监测（模拟电压 ∝ I）| [CPU 平台供电](cpu-power.md) | 多数 VRM |
| **IADP** | 适配器电流缓冲输出（20x 或 40x ACP-ACN）| [隔离保护](isolation-protection.md) | BQ24780S |
| **IDCHG** | 电池放电电流缓冲输出（8x 或 16x SRN-SRP） | [隔离保护](isolation-protection.md) | BQ24780S |
| **PMON** | 系统总功率监测输出 | [隔离保护](isolation-protection.md) | BQ24780S |
| **VTTREF** | 内存参考电压（≈ VDDQ/2）| [内存供电](memory-power.md) | RT8231, TPS51116 |

## F. 驱动 / 功率

| 信号 | 释义 | 常见电路 | 典型 IC |
|------|------|----------|---------|
| **UGATE / HIDRV** | 上管 N-MOS 栅极驱动输出 | 所有同步 Buck | 所有 Buck 控制器 |
| **LGATE / LODRV** | 下管 N-MOS 栅极驱动输出 | 所有同步 Buck | 所有 Buck 控制器 |
| **PHASE / SW** | 开关节点（上下管中点，接电感） | 所有同步 Buck | 所有 Buck 控制器 |
| **BOOT / BTST** | 自举电容电源（浮动为上管驱动供电） | 所有同步 Buck | 所有 Buck 控制器 |
| **REGN** | 内部 6V LDO 输出（栅极驱动用） | [隔离保护](isolation-protection.md) | BQ24780S, ISL88731A |
| **ACDRV** | ACFET 电荷泵驱动（CMSRC + 6V） | [隔离保护](isolation-protection.md) | BQ24780S, ISL88731A |
| **BATDRV** | BATFET 电荷泵驱动（BATSRC + 6V） | [隔离保护](isolation-protection.md) | BQ24780S, ISL88731A |
| **VDDP** | 内部栅极驱动级供电 | [3/5V 系统供电](system-power.md) | RT8209 等 |

## G. 保护 / 状态

| 信号 | 释义 | 有效电平 | 常见电路 | 典型 IC |
|------|------|----------|----------|---------|
| **PROCHOT#** | CPU 强制降频请求（可由 CPU / 充电 IC / EC 触发）| 低 | [隔离保护](isolation-protection.md) / [CPU 平台供电](cpu-power.md) | 充电 IC + Intel CPU |
| **ACOK** | 适配器有效指示 | 高=有 | [隔离保护](isolation-protection.md) | BQ24780S, ISL88731A |
| **ACDET** | 适配器检测电压输入（分压设阈值） | > 2.4V 有效 | [隔离保护](isolation-protection.md) | BQ24780S, ISL88731A |
| **BATPRES** | 电池存在指示 | 低=在 | [隔离保护](isolation-protection.md) | BQ24780S, ISL88731A |
| **TB_STAT** | Turbo Boost / 混合升压 状态 | 低=激活 | [隔离保护](isolation-protection.md) | BQ24780S |
| **CS** | 电流设置（外接电阻设过流阈值） | 阻值决定 | [3/5V 系统供电](system-power.md) | RT8209 系 |

## H. 时钟

| 信号 | 释义 | 常见电路 | 典型 IC |
|------|------|----------|---------|
| **RTC_X1 / RTC_X2** | 32.768kHz 晶振输入/输出（皮尔斯振荡器） | [RTC 信号](rtc-signals.md) | PCH RTC |
| **CLK_EN** | 时钟芯片使能，PCH_PWROK 后拉高 | [上电时序](power-on-sequence.md) | 时钟 Buffer/PLL |
| **PCI_CLK / CPU_CLK** | 平台时钟输出 | [上电时序](power-on-sequence.md) | 时钟芯片 |

## I. 供电域名（非引脚信号，作为电压轨查询）

| 供电域 | 作用 | 典型电压 | 由什么电路产生 |
|--------|------|----------|----------------|
| **VCC / VIN** | 通用输入 | 依芯片 | 上一级 |
| **20V 公共点** | 整板 Buck 上管 Drain 母线 | 19~20V | 适配器 / 电池升压 |
| **VDDQ** | 内存主供电 | 1.5V (DDR3) / 1.2V (DDR4) / 1.1V (DDR5) | [内存供电](memory-power.md) |
| **VTT** | 内存终结电压 | VDDQ/2 | [内存供电](memory-power.md) |
| **VTTREF** | 内存参考电压 | VDDQ/2 | [内存供电](memory-power.md) 分压 |
| **VCore** | CPU 核心供电（动态） | 0.6~1.4V | [CPU 平台供电](cpu-power.md) |
| **VCCSA** | System Agent（内存控制器/PCIe） | ~1.05V | [CPU 平台供电](cpu-power.md) |
| **VCCIO** | I/O 电路 | ~1.05V | [CPU 平台供电](cpu-power.md) |
| **VCCGT** | 核显 (Intel HD) | 0.6~1.2V | [CPU 平台供电](cpu-power.md) |
| **VCCST** | PCH 保持供电（S3 时保留） | 1.05V | [待机供电轨](standby-power-rails.md) |
| **VCCPRIM** | PCH 主域供电（S0 时激活） | 1.05V / 1.8V / 3.3V | [待机供电轨](standby-power-rails.md) |
| **VCCDSW** | PCH 深睡域供电 | 3.3V | [EC 待机架构](ec-standby.md) |
| **RTCVCC_3P3** | RTC 数字逻辑供电（S0 状态下） | 3.3V | [RTC 信号](rtc-signals.md) |
| **VBAT** | RTC 电池备份（纽扣电池） | 3.0V | [RTC 信号](rtc-signals.md) |
