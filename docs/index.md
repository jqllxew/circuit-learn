# 电路学习笔记

主板电路分析笔记。核心是**信号 ↔ 电路 ↔ IC 双向索引**：

- 遇到信号名 → [信号索引](signals.md) 查释义和典型 IC
- 想修某个电路 → 对应电路页看主要信号和经典型号外链
- 芯片作为标签存在（型号 + 数据手册外链），不做详细介绍

## 导航

- **[信号索引](signals.md)** ⭐ —— 所有信号一览，按类别分组，可 Ctrl+F 检索
- **信号与供电基础** —— [RTC 相关信号](rtc-signals.md)、[20V 供电公共点](20v-power-rail.md)
- **[隔离保护电路](isolation-protection.md)** —— 电池/适配器切换 + 充电控制
- **PWM 供电电路** —— [3/5V 系统供电](system-power.md)、[CPU 平台供电](cpu-power.md)、[内存供电](memory-power.md)、[Buck 电路实例](buck-examples.md)
- **待机与开机时序** —— [待机供电轨](standby-power-rails.md)、[EC 待机架构](ec-standby.md)、[上电时序](power-on-sequence.md)
- **[名词扫盲](embedded-glossary.md)** —— 嵌入式术语按修板/协议/生产/工具场景分类
