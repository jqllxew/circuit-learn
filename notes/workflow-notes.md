# 姐妹流水线踩坑笔记

> 不写大流程文档。就记"踩过的坑 + 为什么这么改"。
> 新任务上手直接看，不用口头传。

---

## 1. 路径双写坑（/d/d/workspace vs /d/workspace）

**症状：** write_file 路径写 `/d/workspace/...` 后工具显示成功，但文件实际落在 `/d/d/workspace/...`，git 仓库里看不到。

**根因：** Hermes 的路径解析把 `/d/` 当相对路径拼接到了当前工作目录上。

**不会踩的人：** 用 `D:/workspace/...` 绝对路径。

**教训：** 写仓库文件一律用 `D:/workspace/circuit-learn/...`，别用 `/d/` 前缀。写完立刻 `git status` 验证。

---

## 2. 叙事完成感——脑子里写完了，工具没调用

**症状：** 把改动内容在脑子里过了一遍、用文字描述了一遍，然后就以为"做完了"。实际 write_file 或 patch 根本没执行。

**不会踩的人：** 写完立刻读文件验证行数/内容。commit 前 git diff。

**案例：**
- 2号声称"改好了 lightbox.js"——实际没改
- 3号声称"commit b0c8a8a"——实际没落盘

---

## 3. 写-推之间的上下文切换成本

**症状：** 写完 → commit → 构建通过 → 再叫4妹推。4妹收到消息后才开始切上下文、热 SSH tunnel、git fetch。

**优化：** 3妹动笔前预先通知4妹——"大概5分钟后来推，先别跑远"。4妹提前 git fetch + 热 tunnel，commit 下一秒就能 push。

**量化：** 省掉每次 30-60 秒的上下文切换。

---

## 4. 图片路径事后替换

**症状：** 先写 `assets/xxx.jpg`，等 TOS 上传完再批量 replace 成 `https://bytep102...`。

**优化：** 上传 TOS 的瞬间就出 URL，直接把 URL 给写文档的人——markdown 里从第一行就用 TOS URL，不需要事后替换。

**什么时候保留 assets/ 本地引用：** 不用 TOS 的项目、纯本地 mkdocs serve 预览。

---

## 5. 代理推大文件超时

**症状：** 2号 git push over HTTPS proxy 大文件（>100KB 图片）必然超时。curl 秒通 GitHub，git push 就是不通。

**当前方案：** 4号 SSH+SOCKS5 推。小 commit（纯文本）2号可以自己推，含图片的交给4号。

**备用方案：** 好运宝宝本地 git pull && git push，绕过代理。

---

## 流水线标准姿势（当前最优）

```
好运宝宝发图/需求
  ↓
2号分活（谁写什么、给什么资源）
  ↓                ↓
3号动笔          同时通知4号预热 SSH tunnel
  ↓
commit → 4号收到信号立刻 push + gh-deploy
  ↓
站点上线
```

- 图片走 TOS：上传时直接出 URL → 写文档的人直接用
- 路径用 `D:/workspace/` 绝对路径
- 写完立刻 git status + 读文件验证
