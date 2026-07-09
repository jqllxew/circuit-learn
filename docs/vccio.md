# VCCIO — I/O 供电

> 笔记待补充：Intel CPU I/O 接口供电轨分析，包括电压标准、与 VCCSA 的配合、常见故障。

## 概述

VCCIO（I/O Voltage）为 CPU 的 DDR 物理层 (PHY) 和部分 I/O 缓冲器提供供电。与 VCCSA 配合工作：VCCSA 管控制器逻辑，VCCIO 管物理层信号驱动力。内存频率越高，VCCIO 的需求越大。

## 关键参数

| 项目 | 典型值 | 说明 |
|------|--------|------|
| 电压范围 | 0.95V ~ 1.35V | 随内存频率增高 |
| DDR4 典型 | 1.0V ~ 1.2V | 2133MHz ~ 3200MHz |
| DDR5 典型 | 1.1V ~ 1.2V | 4800MHz ~ 5600MHz |
| 电流需求 | 2A ~ 6A | 取决于内存通道数和频率 |

## 供电来源

```
通常与 VCCSA 共享同一 PMIC/PWM 控制器
            ┌→ LDO1 → VCCSA
PWM Buck ──┤
            └→ LDO2 → VCCIO
```

## 与 VDDQ/VTT/VTTREF 的关系

```
VCCIO (CPU 侧) ──→ DDR PHY 接口 ──→ DRAM 颗粒
                                    ↓
                              VDDQ (1.2V) → VTTREF (0.6V) → VTT (0.6V)
```

VCCIO 在 CPU 端，VDDQ/VTT 在内存端——两端电压独立但需匹配。

## 待补充

- [ ] 具体主板 VCCIO 供电方案
- [ ] 电压调整与内存超频的对应关系
- [ ] 上下电时序要求
- [ ] 常见故障：VCCIO 异常导致内存不稳定/不开机
