# MODULE_MAP.md

本文档用于帮助后续 Codex / Cursor 快速定位模块。当前项目仍使用原生 HTML/CSS/JavaScript，不使用打包工具；`index.html` 通过普通 `<script>` 标签按顺序加载 `js/` 下的文件。

## 当前 JS 文件结构

```text
script.js                  # 兼容说明：真实逻辑已拆到 js/
js/
  config.js
  difficultyManager.js
  state.js
  ratingManager.js
  leaderboardService.js
  eventGenerator.js
  questionGenerator.js
  animationManager.js
  sceneRenderer.js
  audioManager.js
  uiManager.js
  debugPanel.js
  main.js
```

加载顺序由 `index.html` 控制。不要随意调整顺序：后面的文件依赖前面的全局对象。

## 文件职责

- `js/config.js`：集中配置和通用工具函数。包含顾客、商品、事件类型、区域标签、难度分层配置、反馈文案，以及 `randomFrom()`、`randomTime()`、`shuffleList()`、`buildUniqueOptions()` 等工具。
- `js/difficultyManager.js`：`DifficultyManager`。根据轮数返回事件数量、允许事件类型、允许问题类型、观察时长和物品闪烁速度。
- `js/state.js`：全局运行状态。包含 `eventLog`、`sceneState`、初始场景快照函数、`GameState`。
- `js/ratingManager.js`：`RatingManager`。根据完成轮数返回结算评级文案。
- `js/leaderboardService.js`：`LeaderboardService`。负责本地排行榜的 `localStorage` 读写、排序、统计、清空。
- `js/eventGenerator.js`：`EventGenerator`。根据当前轮次和虚拟状态生成本轮事件列表。
- `js/questionGenerator.js`：`AdvancedQuestionState`、`QuestionGenerator`。只基于本局 `eventLog` 和当前 `sceneState` 生成问题。
- `js/animationManager.js`：`TimelinePlayer`。按时间播放事件，处理门动画、顾客进入/离开、商品高亮、灯光闪烁、黑影等事件视觉反馈。
- `js/sceneRenderer.js`：`SceneRenderer`。根据 `sceneState` 渲染分层便利店画面，包括背景层、商品层、人物层、信息层、异常层。
- `js/audioManager.js`：`SoundManager`。管理 SFX、菜单 BGM、音效开关、音乐开关和本地偏好保存。
- `js/uiManager.js`：`UIController`、`LeaderboardUI`、`ConfirmDialog`、`PauseManager`。负责页面切换、按钮状态、题目/结果/结算渲染、排行榜弹窗、确认弹窗、暂停/继续。
- `js/debugPanel.js`：`DebugPanel`。显示当前 `GameState`、`sceneState`、`eventLog`、`currentQuestion`、初始场景快照。
- `js/main.js`：初始化入口和主流程函数。包含 `startGame()`、`startObservePhase()`、`showQuestionPhase()`、`handleAnswer()`、`showResult()`、`resetGame()`、`goToNextRound()`、`DOMContentLoaded` 初始化绑定。

## 主要对象 / 函数位置

- `DataConfig`：`js/config.js`
- `DifficultyManager`：`js/difficultyManager.js`
- `eventLog`：`js/state.js`
- `sceneState`：`js/state.js`
- `GameState.currentQuestion`：`js/state.js`
- `createInitialSceneState()` / `resetSceneState()`：`js/state.js`
- `resetEventLog()`：`js/state.js`
- `captureInitialRoundSceneState()` / `getInitialRoundSceneState()`：`js/state.js`
- `RatingManager`：`js/ratingManager.js`
- `LeaderboardService`：`js/leaderboardService.js`
- `EventGenerator`：`js/eventGenerator.js`
- `QuestionGenerator`：`js/questionGenerator.js`
- `TimelinePlayer`：`js/animationManager.js`
- `SceneRenderer`：`js/sceneRenderer.js`
- `SoundManager`：`js/audioManager.js`
- `UIController`：`js/uiManager.js`
- `LeaderboardUI`：`js/uiManager.js`
- `ConfirmDialog`：`js/uiManager.js`
- `PauseManager`：`js/uiManager.js`
- `DebugPanel`：`js/debugPanel.js`
- `startGame()` / `startObservePhase()` / `handleAnswer()` / `goToNextRound()`：`js/main.js`

## 常见开发任务入口

- 修改难度规则：优先看 `js/config.js` 的 `DataConfig.difficultyTiers`，再看 `js/difficultyManager.js`。不要重写 `DifficultyManager`。
- 新增事件：优先看 `js/config.js` 的事件类型配置、`js/eventGenerator.js` 的事件生成、`js/animationManager.js` 的事件播放和写日志、`js/sceneRenderer.js` 的画面表现。新增事件必须同时更新 `sceneState`、画面表现、`eventLog`。
- 新增问题类型：优先看 `js/config.js` 的 `questionTypes` 配置和 `js/questionGenerator.js`。问题只能基于本局真实发生的 `eventLog` 内容。
- 修改场景画面：优先看 `js/sceneRenderer.js` 和 `style.css`。展示层 DOM 和样式优先，不要改玩法逻辑。
- 修改门/顾客动画：优先看 `js/animationManager.js` 的 `TimelinePlayer` 事件处理，再看 `js/sceneRenderer.js` 和 `style.css` 的对应 DOM/class。
- 修改商品显示或高亮：优先看 `js/sceneRenderer.js`、`style.css`，涉及事件时再看 `js/animationManager.js`。
- 修改音效/BGM：看 `js/audioManager.js`。BGM 只用于首页 / 菜单 / 最终结算页，观察和答题阶段不持续播放 BGM。
- 修改排行榜：数据读写看 `js/leaderboardService.js`，弹窗 UI 看 `js/uiManager.js` 的 `LeaderboardUI`。
- 修改暂停、继续、退出确认：看 `js/uiManager.js` 的 `PauseManager` 和 `ConfirmDialog`。
- 修改结算评级文案：看 `js/ratingManager.js`。
- 修改 Debug 面板：看 `js/debugPanel.js`。需要显示的新字段应来自现有状态结构，不要为 Debug 破坏主数据结构。
- 修改主流程或按钮绑定：看 `js/main.js`，但不要随意改变分数、生命、轮次、阶段切换规则。

## 不要随便改的文件 / 系统

- `js/difficultyManager.js`：控制轮次难度，不要重写。
- `js/eventGenerator.js`：控制事件生成，不要重写。
- `js/questionGenerator.js`：控制问题生成，不要重写。
- `js/state.js`：保存核心状态，字段不要随意删除、改名或改变类型。
- `js/main.js`：控制主流程、分数、生命、轮次、阶段切换，除非用户明确要求，否则不要改规则。

视觉优化通常优先改 `style.css` 和 `js/sceneRenderer.js`。不要为了视觉效果改事件真实性、问题来源或核心玩法。

## 不能破坏的数据结构

### `eventLog`

本局真实播放过的事件日志。每轮开始清空，事件播放时写入。`QuestionGenerator` 只能基于当前 `eventLog` 生成问题。

新增或修改事件时，必须保证日志字段足够支持题目生成；不能询问本局没有真实发生过的内容。

### `sceneState`

当前画面状态对象，包含顾客、离店顾客、商品、时钟、收银金额、灯光、门、黑影、短暂高亮等字段。每个事件必须同步更新 `sceneState`，然后由 `SceneRenderer.render(sceneState)` 反映到画面。

不要随意删除、改名或改变字段含义。历史兼容字段如 `fridgeCount` 即使暂时不作为独立玩法，也不要无需求移除。

### `currentQuestion`

当前题目对象，保存在 `GameState.currentQuestion`。通常包含：

- `text`
- `options`
- `answer`
- `sourceEventId`
- 可选的 `questionType`

不要改变答题判断依赖的 `answer` / `correctAnswer` 兼容逻辑。

## 新增新场景建议

新增新场景时，建议按以下顺序扩展：

1. `js/config.js`：新增场景配置、物品、角色、事件标签、区域标签。
2. `js/state.js`：只在确有必要时扩展 `sceneState` 字段，保持向后兼容。
3. `js/sceneRenderer.js`：新增或分支渲染场景层，保持背景层、人物层、商品层、信息层、异常层独立。
4. `style.css`：补充新场景视觉样式，手机竖屏优先。
5. `js/eventGenerator.js`：新增该场景可发生的事件。
6. `js/animationManager.js`：为新事件实现画面表现，并写入 `eventLog`。
7. `js/questionGenerator.js`：新增基于 `eventLog` 的问题类型。
8. `js/main.js` / `js/uiManager.js`：只有当新场景需要入口、切换或 UI 控件时再改。

不要把新场景做成一整张静态图片。顾客、商品、时钟、收银金额、监控文字、灯光、门、黑影等仍应保持独立可更新。
