# 隔离保护电路

电池与适配器之间的**同步降压充电控制器**。核心作用：

- 检测适配器插入/移除，控制 ACFET/BATFET 切换（适配器 ↔ 电池双路供电）
- CC (恒流) → CV (恒压) 充电电池
- 混合升压 (Turbo Boost)：适配器功率不足时电池辅助放电

---

## 经典型号

- [BQ24780S](https://www.ti.com/product/BQ24780S)（TI）
- [BQ24727](https://www.ti.com/product/BQ24727)（TI）
- [ISL88731A](https://www.renesas.com/us/en/products/power-power-management/battery-management/battery-charger-ics/isl88731a-narrow-vdc-battery-charger)（Renesas）
- [MP2617](https://www.monolithicpower.com/)（MPS）

---

## 主要信号（按功能分组）

**适配器 / 电池检测**

- **ACOK** —— 适配器有效指示
- **ACDET** —— 适配器检测电压输入（分压阈值 > 2.4V 有效）
- **BATPRES** —— 电池存在指示
- **TB_STAT** —— Turbo Boost / 混合升压 状态

**SMBus 通信**

- **SDA / SCL** —— EC ↔ 充电 IC 命令/状态
- **ALERT# / SMBus Alert** —— 从设备主动通知 EC 故障
- **CHRG_INHIBIT** —— 充电禁止（SMBus 寄存器位 REG0x12[0]）

**电流 / 功率检测**

- **SRP / SRN** —— 充电电流检测（跨检测电阻差分）
- **ACP / ACN** —— 适配器电流检测（差分）
- **IADP** —— 适配器电流缓冲输出（20x / 40x ACP-ACN）
- **IDCHG** —— 电池放电电流缓冲输出（8x / 16x SRN-SRP）
- **PMON** —— 系统总功率监测输出

**保护动作**

- **PROCHOT#** —— CPU 强制降频请求（充电 IC 检测到过流可触发）

**同步 Buck 主级**

- **HIDRV / LODRV / PHASE / BOOT** —— 上下管驱动 + 开关节点 + 自举
- **REGN** —— 内部 6V LDO 输出，栅极驱动 + 电荷泵电源（详见下方"REGN 深入"）
- **ACDRV** —— ACFET 电荷泵驱动（CMSRC + 6V）
- **BATDRV** —— BATFET 电荷泵驱动（BATSRC + 6V）

详见 [信号索引](signals.md)。

---

## 工作时序

```
适配器插入 → ACDET > 2.4V → ACOK 拉高（首次去抖 150ms）
      ↓
   ACFET/RBFET 导通 → 系统由适配器供电
      ↓
   EC 通过 SMBus 写 ChargeVoltage / ChargeCurrent
      ↓
   软启动：128mA 起步，64mA/400µs 步进
      ↓
   恒流 (CC) → 电池电压达标 → 恒压 (CV) → 充电完成
```

**保护动作：** 输入过压 / 输入过流 / 电池过压 / 充电过流 / 热关断 → ACFET/RBFET 关断或 PWM 停止

---

## REGN 深入

充电 IC 内部从 VCC (适配器 20V) 稳压出 **~6V** 的栅极驱动专用 LDO 输出。

**为什么是 6V：** 5V 不够完全打开 N-MOS（Rds(on) 特性未饱和，损耗大）；12V 会超过栅极长期安全裕量（Vgs_max ±20V 需留裕量）。6V 是"完全增强 + 安全裕量"的甜点。

**下游负载（两路）：**

```
VCC (~20V) ──内部 LDO──▶ REGN (~6V) ──┬─▶ HIDRV / LODRV 驱动级 (Buck 上下管栅极摆幅)
                                       └─▶ ACDRV / BATDRV 电荷泵电源
                                             （将 CMSRC/BATSRC 源极浮起 +6V，打通 N-MOS 隔离开关）
```

**外围电路：** REGN 脚对 PGND 接 **1µF 陶瓷电容**（滤波 + 瞬态电荷池，上管开通瞬间灌电流）。

**故障对照表：**

| 现象 | 可能原因 |
|------|----------|
| REGN = 0V | LDO 挂了 / 外接电容对地短 / IC 内部损坏 |
| REGN = 6V 但没 PWM | REGN 本身 OK，问题在别处（ACOK / SDA / EN 或 SMBus 未配置） |
| REGN 振荡 | 外接电容缺失或容量太小 |
| REGN ≈ 3V 拉不上去 | 后级重载或部分短路（栅极对地漏电 / 驱动损坏） |

**排查口诀：** 适配器插好 → ACOK 先高 → REGN 才起 6V。**REGN 没起，充电 / boost / Buck 全废，一颗都跑不起来。**
