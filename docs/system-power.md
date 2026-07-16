# 3/5V 系统供电

主板从 20V 公共点降压出 +3.3V / +5V 两路系统级电源，供 EC、PCH 待机域、USB 待机、内存 SPD 使用。典型是**双通道同步 Buck 控制器**。

---

## 经典型号

- [TPS51125](https://www.ti.com/product/TPS51125)（TI）
- [TPS51123](https://www.ti.com/product/TPS51123)（TI）
- [RT8206](https://www.richtek.com/)（Richtek）
- [MAX8734](https://www.analog.com/)（Maxim / ADI）

---

## 主要信号（按常见程度）

1. **EN / EN5 / EN3** —— 通道使能
2. **PGOOD / VROK** —— 电源好输出
3. **VIN** —— 输入（20V 公共点）
4. **UGATE / LGATE / PHASE** —— Buck 驱动
5. **FB / COMP** —— 反馈 + 补偿

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
