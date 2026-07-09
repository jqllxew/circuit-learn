# 待机供电轨

> 待机供电轨是主板在 S3/S5 休眠状态下仍然维持的电压通道，确保 EC/PCH/RTC/内存等关键模块在系统"关机"时仍具备唤醒能力。

---

## 概述

现代笔记本主板中，即使系统处于 S5（软关机）或 S3（睡眠），仍有多条供电轨保持输出。这些"待机轨"由 **AC 适配器 → 隔离保护电路 → 待机电源控制器**（如 TPS51125/TPS51123 的 3.3V/5V 待机 LDO）产生，是整板开机时序的起点。

| 待机轨 | 电压 | 供电对象 | 状态 |
|--------|------|----------|------|
| **VCCST** | 1.05V | PCH Standby Well (RTC/ME/SPI) | S0/S3/S5 均有效 |
| **VCCPRIM** | 1.0V / 1.05V | PCH Primary Well | S0/S3/S5 均有效 |
| **VCCIO_STBY** | 1.0V | I/O Standby Logic | S3 |
| **VDDQ_STBY** | 1.2V | DDR PHY Standby | S3 |
| **VCCPLL** | 1.8V | 时钟 PLL | S0/S3 |

> **说明**：具体电压值取决于平台代际（Intel 6th~14th Gen 各有差异），本表以笔记本维修常见值列出。

---

## 供电链路

```
AC 适配器 (19V)
    ↓
隔离保护 (ACFET/RBFET)
    ↓
20V 公共供电轨
    ↓
待机电源控制器 (LDO 3.3V/5V)
    ↓                   ↓
3V_S5 (VA)          5V_S5
    ↓                   ↓
VCCST 稳压器       VCCPRIM 稳压器
(1.05V)             (1.05V)
```

---

## 关键信号

### VCCST (CPU Standby)

- **电压**：1.05V（典型）
- **供电对象**：PCH 待机域 — RTC、ME Firmware、SPI Flash
- **特征**：S5 状态下仍保持 → 说明 AC 适配器正常 → 隔离电路正常 → 待机 LDO 正常
- **无 VCCST**：EC 无法读取 BIOS → 无法触发上电

### VCCPRIM (Primary Standby)

- **电压**：1.0V ~ 1.05V
- **供电对象**：PCH Primary Well
- **与 VCCST 关系**：VCCST 先有 → PCH 内部 LDO 再产生 VCCPRIM（部分平台）
- **无 VCCPRIM**：PCH 核心逻辑不上电 → 开机时序停在 PCH 待机阶段

### VDDQ_STBY

- **电压**：1.2V
- **供电对象**：DDR PHY 待机逻辑（非 DRAM 颗粒本身）
- **仅在 S3 有效**：S5 状态下通常关断，由 SLP_S4/SLP_S5 控制

### VCCIO_STBY

- **电压**：1.0V
- **供电对象**：PCH I/O 待机逻辑
- **与 VCCIO 主供电区别**：主 VCCIO 在 S0 才上电，STBY 版本在 S3 即有效

---

## 开机逻辑中的角色

```
S5 状态：
  VCCST ✓ → VCCPRIM ✓ → PCH 待机域就绪
    → 等待 EC 发送 RSMRST#
    → PCH 返回 SUS_PWR_ACK
    → 释放 SLP_S5# → 释放 SLP_S4#
    → 进入 S3
    → 释放 SLP_S3#
    → 进入 S0
    → VCCIO(主) / VCCSA / VCore 等依次上电
```

---

## 常见故障排查

| 现象 | 可能原因 | 检查点 |
|------|----------|--------|
| 插电无反应、无待机电流 | 待机 3.3V/5V 无输出 | 隔离电路是否导通？TPS51125 LDO 是否起振？ |
| 有 3V/5V 待机但不开机 | VCCST 或 VCCPRIM 缺失 | 测 VCCST=1.05V？VCCPRIM=1.05V？ |
| RSMRST# 不释放 | VCCST 正常但 PCH 不应答 | 查 PCH 晶振、SPI Flash 通信 |
| 上电瞬间掉电 | SLP_S3 释放后某路供电异常 | 按上电时序逐路测电压 |

---

## 待补充

- [ ] 各代际 PCH（6th ~ 14th Gen）VCCST/VCCPRIM 实际电压参考表
- [ ] 典型待机电源控制器（TPS51125/RT8206）LDO 输出波形图
- [ ] EC 与 PCH 的 RSMRST# → SUS_PWR_ACK 时序波形
- [ ] 待机功耗实测（S5 正常 < 0.01W）
