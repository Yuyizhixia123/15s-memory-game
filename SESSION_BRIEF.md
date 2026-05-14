# SESSION_BRIEF.md

项目已经完成 JS 模块化拆分，原 `script.js` 的主要逻辑已拆入 `js/` 目录并通过 `index.html` 按顺序加载。

详细文件职责、主要对象位置、常见修改入口和受保护数据结构请读 `MODULE_MAP.md`。

后续新窗口如果涉及代码修改，优先读取 `SESSION_BRIEF.md` + `AGENTS.md`，必要时再读 `MODULE_MAP.md`。

核心约束仍不变：不要擅自修改核心玩法，不要重写 `DifficultyManager` / `EventGenerator` / `QuestionGenerator`，不要破坏 `eventLog`、`sceneState`、`currentQuestion`。
