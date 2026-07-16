# CPU 平台供电

CPU 需要 4 组独立电源域：

| 电压轨 | 作用 | 典型电压 | 拓扑 |
|--------|------|----------|------|
| **VCore** | CPU 核心，动态调节 | 0.6~1.4V | 多相 Buck (2~5 相) |
| **VCCSA** | System Agent (内存控制器/PCIe) | ~1.05V | 单相 Buck |
| **VCCIO** | I/O 电路 | ~1.05V | 单相 Buck |
| **VCCGT** | 核显 (Intel HD) | 0.6~1.2V | 单/双相 Buck |

VCore 电流几十到上百 A，必须**多相 Buck**分担；其余单相即可。CPU 通过 **SVID 总线** 动态告诉 VRM 目标电压。

---

## 经典型号

- [LTC3735](https://www.analog.com/en/products/ltc3735.html)（ADI / Linear）
- [ISL95820](https://www.renesas.com/)（Renesas）
- [RT3624BE](https://www.richtek.com/)（Richtek）
- [MAX17510](https://www.analog.com/)（Maxim / ADI）

---

## 主要信号（按常见程度）

1. **VR_ON** —— VRM 使能，EC 拉高触发上电
2. **VR_PWRGD / PWROK** —— VRM 电源好，PCH 释放 PLTRST# 的前置
3. **SVC / SVD / ALERT#** —— SVID 三线，CPU ↔ VRM 动态调压
4. **PSID / BOOT_VID** —— 平台 ID / 起始电压，上电前读取选参数表
5. **IMON / IOUT** —— 输出电流监测（模拟电压 ∝ I）
6. **PROCHOT#** —— CPU 强制降频请求（VRM / 充电 IC / EC 可触发）
7. **PGOOD (各路)** —— VCCSA / VCCIO / VCCGT 各支路电源好
8. **UGATE / LGATE / PHASE / BOOT** —— 多相 Buck 上下管驱动 + 开关节点 + 自举
9. **FB / COMP** —— 反馈 + 环路补偿（每相独立）

详见 [信号索引](signals.md)。

---

## 工作时序

```
所有前级电压 (3V/5V/1V05_SUS) 就绪 → EC 拉高 VR_ON
      ↓
   VRM 读 PSID / BOOT_VID → 输出 boot 电压 (如 0.7V)
      ↓
   VR_PWRGD 拉高 → PCH 释放 PLTRST# → CPU 上电
      ↓
   CPU 通过 SVID 发送目标电压 → VRM 动态调节 VCore
      ↓
   运行中：SVID 持续更新 VID / VRM 上报电流 (IMON)
```

**保护动作：** OVP / OCP / OTP → VR_PWRGD 拉低 → CPU 保护性关断

**排查提示：** 换 CPU 后 VCore 不对 → 优先查 PSID 电平配置和 SVID 三线波形。
