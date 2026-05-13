# SESSION_BRIEF.md

## 项目状态

15秒便利店监控记忆小游戏，原生 HTML/CSS/JavaScript 实现，主要文件为 `index.html`、`style.css`、`script.js`。核心玩法不变：玩家观察动态便利店监控画面约 15 秒，记住顾客、商品、灯光、门、收银台金额、时间、监控黑影等变化，然后回答一个基于本局真实事件的问题。答错扣生命，生命为 0 后进入结算。

当前冰柜主要作为场景区域和冰柜商品（水、牛奶等）的展示位置存在。不要在没有明确需求时恢复旧的独立“冰柜数量变化”事件或题目。

## 已有系统

- `DifficultyManager`：根据轮数控制事件数量、事件类型、问题类型和观察时长。
- `EventGenerator`：生成本轮事件。
- `QuestionGenerator`：只基于当前 `eventLog` 生成问题，已扩展第 15 轮后的高阶细节题。
- `SoundManager`：Web Audio API 音频系统，SFX 与 BGM 分开控制，并分别保存到 `localStorage`。
- `LeaderboardService`：本地排行榜，使用 `localStorage`，按完成轮数优先排序。
- `DebugPanel`：查看 `eventLog`、`sceneState`、`currentQuestion`、初始轮次快照等运行状态。
- 暂停、退出确认、结算评级、本地排行榜弹窗已存在。

## BGM 规则

已新增通用菜单 BGM。BGM 只用于首页 / 菜单 / 最终结算页，不在正式观察阶段或答题阶段持续播放；观察和答题阶段只保留事件音效、按钮音效、答对答错音效等 SFX。BGM 风格应保持“轻悬疑、耐听、有记忆小游戏菜单感”，可以有少量异常系统感点缀，但不要压抑、恐怖、持续低频嗡鸣或持续电流噪声。BGM 命名和风格不要绑定便利店，需适合未来多场景扩展。

## 重要约束

- 不要修改核心玩法规则。
- 不要重写 `DifficultyManager` / `EventGenerator` / `QuestionGenerator`。
- 不要破坏 `eventLog`、`sceneState`、`currentQuestion` 数据结构。
- 每个事件必须同时更新 `sceneState`、更新画面表现、写入 `eventLog`。
- 问题只能基于本局真实发生内容生成。
- UI 优化优先改 CSS 和展示层 DOM。
- 每次修改前先说明计划和涉及文件，修改后说明如何运行和验证。
