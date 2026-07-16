# 3/5V 系统供电

主板从 20V 公共点降压出 +3.3V / +5V 两路系统级电源，供 EC、PCH 待机域、USB 待机、内存 SPD 使用。典型是**双通道同步 Buck 控制器 + 内建双 LDO**。

## 三层 3/5V 电源

| 层级 | 常见名 | 来源 | 存活范围 |
|------|--------|------|----------|
| Always-on 常开 | **+3VAWL / +5VAWL**（V3A / V5A / +3V_ALW） | 控制器内建 LDO 从 VIN 直接线性稳压 | 只要 VIN 有电就有 |
| Suspend 待机 | **+3VSUS / +5VSUS**（+3VSB / +5VSB） | Buck 输出经 FET 门控（SLP_S3# 控制）| S3 保持，S5 关 |
| Runtime 运行 | **+3VS0 / +5VS0** | Buck 主输出，SLP_S3# 释放才有 | 仅 S0 |

> **常开 LDO 是上电起点：** 适配器一插，VIN 就位，LDO 立刻输出 +3VAWL / +5VAWL，EC 才能启动、才能检测 PWRBTN#、才能拉 EN 起主 Buck。主 Buck 尚未起时，AWL 已在跑。

---

## 经典型号

- [TPS51125](https://www.ti.com/product/TPS51125)（TI）
- [TPS51123](https://www.ti.com/product/TPS51123)（TI）
- [RT8206](https://www.richtek.com/)（Richtek）
- [MAX8734](https://www.analog.com/)（Maxim / ADI）

---

## 主要信号（按功能分组）

**Buck 主级**

- **EN / EN5 / EN3** —— 通道使能（EC 拉高）
- **VIN** —— 输入（20V 公共点）
- **PGOOD / VROK** —— 电源好输出，级联给下一级
- **UGATE / LGATE / PHASE** —— 上下管栅极驱动 + 开关节点
- **BOOT / BTST** —— 自举电容电源（浮动为上管驱动供电）
- **FB / COMP** —— 反馈 + 环路补偿
- **VDDP** —— 内部栅极驱动级供电
- **CS** —— 电流设置（外接电阻设过流阈值）
- **REF / SS** —— 内部参考 / 软启动（部分控制器外露）

**内建 LDO（常开路径）**

- **LDOIN / VBAT_IN** —— LDO 输入（直连 VIN 或电池）
- **LDO5 / V5A** —— 5V 常开 LDO 输出（+5VAWL 源头）
- **LDO3 / V3A** —— 3.3V 常开 LDO 输出（+3VAWL 源头）
- **V5FILT** —— 5V LDO 外接滤波 / 旁路电容脚

**Suspend 门控**

- **SLP_S3#** —— 决定 +3VSUS / +5VSUS 是否输出（PCH → EC → 门控 FET）

详见 [信号索引](signals.md)。

---

## 工作时序

```
20V 公共点就绪 → EC 拉高 EN
      ↓
   内部软启动（斜坡 1~5ms，避免涌流）
      ↓
   PWM 起振 → UGATE/LGATE 交替 → PHASE → 电感 → 输出电容
      ↓
   VOUT 稳定 → PGOOD 拉高 → EC/PCH 进入下一级
```

**保护动作：** 输出短路 / 过流 / 过温 → PWM 关断，PGOOD 拉低
