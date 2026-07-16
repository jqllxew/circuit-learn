# 内存供电

DDR 内存需要 3 组配套电压：

| 电压 | 作用 | DDR3 / DDR4 / DDR5 |
|------|------|--------------------|
| **VDDQ** | 主供电（存储阵列 + I/O） | 1.5V / 1.2V / 1.1V |
| **VTT** | 数据线终结电压 | VDDQ / 2 |
| **VTTREF** | 参考电压 | VDDQ / 2 |

VDDQ 由 **Buck 控制器**产生；VTT 由 **Sink/Source LDO**（吸/放电流）跟随 VTTREF 产生；VTTREF 从 VDDQ 精密分压得到。

---

## 经典型号

- [RT8231](https://www.richtek.com/)（Richtek，VDDQ Buck + VTT LDO 双输出）
- [TPS51116](https://www.ti.com/product/TPS51116)（TI，DDR2/3）
- [TPS51216](https://www.ti.com/product/TPS51216)（TI，DDR3/3L）
- [RT9214](https://www.richtek.com/)（Richtek）

---

## 主要信号（按常见程度）

1. **VDDQ_EN** —— 主供电使能（S3 必须保持）
2. **VTT_EN** —— 终结电压使能（S3 时关断）
3. **VTTREF** —— 参考电压输出
4. **PGOOD** —— 电源好
5. **UGATE / LGATE / PHASE** —— VDDQ Buck 驱动

详见 [信号索引](signals.md)。

---

## 工作时序

```
主板上电 → S5_PWROK → EC 拉高 VDDQ_EN
      ↓
   VDDQ Buck 软启动 → VDDQ 稳定 → VTTREF 分压建立
      ↓
   [S3 睡眠]：VDDQ 保持，VTT 关断（内存 self-refresh）
      ↓
   [S3 → S0]：EC 拉高 VTT_EN → VTT LDO 跟随 VTTREF 输出
      ↓
   PGOOD 拉高 → DDR 训练开始 → 正常读写
```

**S3 关键点：** VDDQ 一旦掉电，内存数据丢失。

**排查提示：** VTT 电压不等于 VDDQ/2 → 查 VTTREF 分压电阻 / VTT LDO 环路。
