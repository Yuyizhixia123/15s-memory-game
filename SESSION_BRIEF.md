# SESSION_BRIEF.md

## 项目

15秒便利店监控记忆小游戏。

## 核心玩法

玩家观察便利店监控画面 15 秒，记住顾客、物品、灯光、门、收银台、时间、监控黑影等变化，然后回答一个基于本局真实事件的问题。答错扣生命，生命为 0 后进入结算。

当前冰柜主要作为场景区域和冰柜商品（水、牛奶等）的展示位置存在。不要在没有明确需求时恢复旧的独立“冰柜数量变化”事件或题目。

## 当前技术

原生 HTML/CSS/JavaScript。

主要文件：

- `index.html`
- `style.css`
- `script.js`

## 已有系统

- `EventGenerator`：生成本轮事件。
- `QuestionGenerator`：基于 `eventLog` 生成问题。
- `DifficultyManager`：根据轮数控制事件数量、事件类型、问题类型和观察时长。
- `SoundManager`：Web Audio API 轻量音效系统，带音效开关和 `localStorage` 状态保存。
- `DebugPanel`：查看 `eventLog`、`sceneState`、`currentQuestion` 等运行状态。
- 暂停功能：观察阶段和答题阶段可暂停/继续。
- 退出确认：暂停菜单中的重新开始、退出到首页使用自定义确认弹窗。
- 结算评级：生命为 0 后根据完成轮数展示评级。

## 重要约束

- 不要修改核心玩法规则。
- 不要破坏 `eventLog`、`sceneState`、`currentQuestion` 数据结构。
- 不要重写 `DifficultyManager` / `EventGenerator` / `QuestionGenerator`。
- UI 优化优先改 CSS 和展示层 DOM。
- 事件必须同时更新 `sceneState`、更新画面表现、写入 `eventLog`。
- 问题只能基于本局 `eventLog` 生成，不能问本局没有发生过的内容。
- 每次修改前先说明计划和涉及文件。

## 当前重点

继续优化便利店监控画面、美术细节、门和顾客动画、事件反馈、手机端布局。
