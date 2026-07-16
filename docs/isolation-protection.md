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

## 主要信号（按常见程度）

1. **ACOK / ACDET** —— 适配器检测
2. **SDA / SCL** —— SMBus 通信（EC ↔ 充电 IC）
3. **PROCHOT#** —— 过流保护，触发 CPU 降频
4. **SRP / SRN** —— 充电电流检测（差分）
5. **HIDRV / LODRV / PHASE** —— Buck 同步驱动

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
