# PROJECT_CONTEXT.md

本文档面向后续 Codex / Cursor / Claude Sonnet 开发，用于快速理解当前项目状态、已有系统、当前视觉状态、已知问题和开发注意事项。

更新时间：2025-01-XX（最近更新）

## 1. 当前项目目标

《15秒记忆现场》是一个手机竖屏网页小游戏原型。

核心玩法：

1. 玩家观察 15 秒便利店监控画面。
2. 画面中自动播放若干动态事件。
3. 观察结束后，玩家回答一道关于刚才画面细节的问题。
4. 问题必须来自本局真实发生过的事件。

当前阶段目标仍是最小可运行、可试玩原型，不追求商业级完整度。优先保证：

- 核心流程稳定。
- 场景是分层 DOM 元素，不是一张整图。
- 事件能同步更新 `sceneState`、画面和 `eventLog`。
- 问题只基于本局 `eventLog`。
- 手机竖屏体验可用。
- 前端视觉逐步优化，但不要破坏玩法系统。

## 2. 当前文件结构

```text
15s-memory-game/
  AGENTS.md
  PROJECT_CONTEXT.md
  FRONTEND_REVIEW.md
  README.md
  index.html
  style.css
  script.js
```

文件说明：

- `AGENTS.md`：项目长期开发约束。
- `PROJECT_CONTEXT.md`：当前文件，面向后续开发的项目上下文。
- `FRONTEND_REVIEW.md`：面向 Cursor / Claude Sonnet 的前端美术优化审查和任务边界。
- `README.md`：面向普通读者的项目说明，可能滞后于最新代码。
- `index.html`：页面结构，包括首页、观察页、答题页、反馈页、结算页和 Debug 面板容器。
- `style.css`：手机竖屏布局、监控录像风 UI、便利店场景、人物/商品/动画/反馈样式。
- `script.js`：当前所有核心 JS 逻辑。模块尚未拆分，所有对象仍集中在单文件中。

## 3. 已完成的功能

页面流程：

- 首页
- 观察页
- 答题页
- 反馈页
- 结算页
- Debug 面板

核心玩法：

- 点击开始进入观察阶段。
- 观察阶段 15 秒倒计时。
- 按时间播放事件。
- 每轮开始清空 `eventLog`。
- 每轮开始重置 `sceneState`。
- 观察结束后生成一道四选一问题。
- 答对加 10 分。
- 答错扣 1 条生命。
- 生命为 0 进入结算页。
- 可以重新开始。
- 已加入快速点击防护，避免重复结算、重复跳轮。

视觉和交互：

- 暗色监控录像风格。
- REC / CAM 标识。
- 监控时间戳。
- 扫描线、暗角、轻微雪花效果（已修复伪元素渲染问题）。
- 监控 HUD 文字有绿色发光效果。
- 观察结束淡出变暗，避免继续偷看画面。
- 顾客离店有向门移动并淡出的动画。
- 门自动开合事件已有动画。
- 门把手位置已修正为左边（符合向右开门的物理逻辑）。
- 物品变化时对应物品本体高光闪烁两次。
- 物品高光闪烁速度随难度提升而加快，第 6 轮以后保持最高速度。
- 底部事件文字提示已取消，避免抢玩家注意力。
- 异常黑影已从单椭圆升级为剪影，并且显示位置与题目答案一致。

## 4. 当前游戏流程

入口：

- `DOMContentLoaded`
- 初始化 `UIController`
- 初始化 `SceneRenderer`
- 初始化 `DebugPanel`
- 初始渲染 `sceneState`
- 绑定开始、下一轮、重新开始按钮

开始游戏：

1. `startGame()`
2. `GameState.reset()`
3. `startObservePhase()`

观察阶段：

1. 清理旧计时器和旧时间线。
2. `resetSceneState()`
3. `resetEventLog()`
4. 设置倒计时为 `DifficultyManager.getObserveDuration(round)`，当前仍为 15 秒。
5. `EventGenerator.generate(round)` 生成事件列表。
6. `TimelinePlayer.start(events)` 按时间播放。
7. 倒计时结束后播放淡出变暗过渡。
8. 进入 `showQuestionPhase()`。

答题阶段：

1. `QuestionGenerator.generate(eventLog, sceneState, round)` 生成问题。
2. `UIController.renderQuestion(question)` 渲染四个选项。
3. 玩家点击选项后 `handleAnswer()` 判断对错。
4. 答对加分，答错扣生命。
5. 进入反馈页。

反馈和结算：

- 如果生命大于 0，点击下一轮进入新一轮。
- 如果生命为 0，进入结算页。
- 结算评级由 `RatingManager` 根据成功完成轮数计算。

## 5. 当前 UI 和场景风格

当前 UI 是轻微诡异的便利店监控录像风：

- 手机竖屏优先。
- 暗色背景，有压迫感但保持可读。
- 便利店场景由 DOM 分层组成。
- 场景仍是原型风，不使用真实素材。
- 有 REC、CAM、时间戳、扫描线、雪花噪点和暗角。
- 答题页背景变暗，不能继续偷看观察画面。
- 反馈页和结算页保持小游戏风格。

场景分层：

- `backgroundLayer`：墙面、地面、门、入口垫、货架、冰柜、收银台。
- `itemLayer`：水、牛奶、饭团、薯片、便当、糖果等商品。
- `characterLayer`：门口通道、店员、顾客、离店动画顾客。
- `infoLayer`：时钟、收银金额、监控屏文字、门口招牌。
- `anomalyLayer`：灯光闪烁、异常影子、噪点。

当前视觉状态：

- 人物已经从简单圆圈升级为头、身体、手臂、腿和标签组成的简化人物。
- 商品已经从“文字 x 数量”升级为实际多个简化图形。
- 商品本体内部不再显示文字。
- 商品名称标签目前显示在物品下方。
- 水和牛奶显示在冰柜区域。
- 饭团、薯片、便当、糖果显示在货架区域。
- 饭团和便当位于货架第三排。
- 商品高亮作用于物品本体，名称标签不参与高亮。
- 货架标题位于货架右上角，避免靠近第一排物品名称。
- 收银金额显示在收银台右半部分附近。

## 6. 已有系统

### `DataConfig`

集中配置：

- 难度段 `difficultyTiers`
- 事件类型标签
- 区域标签
- 顾客数据
- 商品数据
- 时钟可选值
- 收银金额可选值
- 异常影子位置
- 调试/反馈文案

注意：

- 仍有历史字段 `eventsPerRound`，但当前事件数量主要由 `DifficultyManager.getEventCount(round)` 控制。
- `sceneState.fridgeCount` 和虚拟状态里的 `fridgeCount` 仍存在，用于兼容现有结构和冰柜商品逻辑。但当前已经没有 `fridge_count_change` 事件，也没有“冰柜最后剩几瓶饮料？”题目。不要在没有明确需求的情况下恢复该事件或题目。

### `DifficultyManager`

根据轮数返回：

- `getEventCount(round)`
- `getAllowedEventTypes(round)`
- `getAllowedQuestionTypes(round)`
- `getObserveDuration(round)`
- `getItemFlashDuration(round)`

当前难度：

- 第 1-2 轮：3 个事件，允许 `customer_enter`、`item_taken`、`light_flash`、`door_auto_open`。
- 第 3-5 轮：5 个事件，加入 `customer_exit`、`shelf_item_disappear`、`clock_change`、`cashier_amount_change`。
- 第 6 轮以后：7 个事件，加入 `monitor_shadow` 和更细问题。

### `EventGenerator`

生成本轮事件列表。

当前特点：

- 根据 `DifficultyManager` 获取事件数量和允许事件类型。
- 事件时间按观察时长分段生成，并排序播放。
- 使用虚拟状态避免明显不合理事件。
- 第一件事件不再强制为 `customer_enter`，时钟、收银台、货架、灯光、门等也可能先变化。

当前支持生成的事件：

- `customer_enter`
- `customer_exit`
- `item_taken`
- `shelf_item_disappear`
- `clock_change`
- `cashier_amount_change`
- `light_flash`
- `door_auto_open`
- `monitor_shadow`

### `TimelinePlayer`

按时间播放事件。

每个事件处理函数必须同时：

1. 更新 `sceneState`
2. 调用 `SceneRenderer.render(sceneState)`
3. 写入 `eventLog`

还负责：

- 清理时间线计时器。
- 清理短暂状态。
- 顾客离店动画状态清理。
- 物品高光闪烁状态清理。
- 门自动开合短暂状态清理。
- 黑影位置短暂状态清理。

### `sceneState`

当前场景状态对象，包括：

- `customers`
- `departingCustomers`
- `items`
- `changedItemIds`
- `itemFlashDuration`
- `fridgeCount`
- `clockTime`
- `cashierAmount`
- `lightState`
- `monitorState`
- `lightFlashCount`
- `lightFlashActive`
- `doorAutoOpenActive`
- `monitorShadowActive`
- `monitorShadowLocation`
- `activeTip`
- `lastCustomerId`
- `lastTakenItemId`
- `lastDisappearedItemId`
- `highlightedInfo`

每轮开始通过 `resetSceneState()` 重置。

注意：不要随意删除或改名 `sceneState` 字段。即使某些字段看起来是历史遗留，也可能被 Debug 面板、渲染逻辑或旧烟测依赖。

### `eventLog`

本局真实播放过的事件日志。

每轮开始通过 `resetEventLog()` 清空。`QuestionGenerator` 只能基于本局 `eventLog` 生成问题。

新增事件或修改事件时，必须保证写入 `eventLog` 的字段足够支持问题生成。

### `QuestionGenerator`

根据 `eventLog` 和当前轮数生成问题。

当前支持问题包括：

- 最后进店的顾客穿什么颜色？
- 哪个商品被拿走了？
- 刚才灯闪了几次？
- 刚才门自动开合了几次？
- 最后店里有几名顾客？
- 哪个商品从货架消失了？
- 时钟最后显示几点？
- 收银台最后显示多少钱？
- 异常影子出现在哪里？
- 第一个进店的人是谁？
- 第一个发生变化的区域是什么？
- 最后发生的事件是什么类型？
- fallback：本轮记录到了多少个事件？

当前不再支持：

- 冰柜最后剩几瓶饮料？

### `SceneRenderer`

根据 `sceneState` 渲染 DOM 场景。

主要方法：

- `renderBackground(state)`
- `createShelf(className)`
- `renderItems(items)`
- `renderCharacters(customers)`
- `createPersonElement(role, label, classNames)`
- `renderInfo(state)`
- `renderAnomalies(state)`
- `getShadowLocationClass(location)`

注意：

- 场景不是图片。
- 顾客、商品、时钟、收银金额、监控屏、灯光效果、门动画、黑影都是独立元素。
- 商品变化通过 `product-rack.item-highlight .product-unit` 高亮本体。
- 黑影问题的答案与 `monitorShadowLocation` 对应，不要让视觉位置和事件日志脱节。

### `GameState`

保存游戏状态：

- 分数
- 生命
- 轮数
- 阶段
- 倒计时
- 当前问题
- 答题锁
- 延迟回调计时器

已加入防快速点击逻辑。

### `UIController`

负责：

- 页面切换
- 状态栏更新
- 监控 HUD 文本更新
- 问题渲染
- 反馈页渲染
- 结算页渲染
- 观察结束淡出过渡

### `RatingManager`

根据成功完成轮数返回结算评级：

- 0-4：刚摸到门
- 5-8：手感预热
- 9-12：节奏入门
- 12-15：反应在线
- 15-19：记忆高手
- 20-25：极限挑战者
- 25-30：人类高玩
- 30+：非人类反应

### `DebugPanel`

右下角 Debug 面板，默认隐藏。

展开后显示：

- 当前阶段
- 当前轮数
- 当前分数
- 当前生命
- 当前 `sceneState`
- 当前 `eventLog`
- 当前 `currentQuestion`

开发时很有用，发布试玩版时可以删除对应 HTML、CSS 和 JS。

## 7. 当前支持事件

- `customer_enter`
- `customer_exit`
- `item_taken`
- `shelf_item_disappear`
- `clock_change`
- `cashier_amount_change`
- `light_flash`
- `door_auto_open`
- `monitor_shadow`

已移除：

- `fridge_count_change`

## 8. 当前前端视觉已知问题

详细前端审查见 `FRONTEND_REVIEW.md`。这里保留开发时最容易踩坑的问题：

- 商品坐标和货架层板坐标仍是分散维护，后续调整货架时容易导致商品穿模或悬空。
- 商品名称标签有助于识别，但仍像 UI 标注，后续可弱化为更自然的价签样式。
- 冰柜、货架、收银台、门口通道已经比早期更具体，但整体仍像 DOM 组件拼贴，不够像真实便利店空间。
- 手机窄屏下元素较密，后续改动必须检查 360px 左右宽度。
- 桌面端只是竖屏容器放宽，不是独立桌面布局。
- `sceneState.fridgeCount` 是历史兼容字段，不代表当前有独立饮料数量玩法。
- README 和旧上下文可能滞后，开发时优先相信当前代码和本文件。

## 9. 下一步建议

优先级较高：

- 继续修商品与货架层板对齐，最好建立统一的货架行/列视觉映射。
- 弱化商品名称标签，让它更像货架价签，不要像 UI 浮层。
- 优化冰柜内部层架和冷光，让水/牛奶更自然地属于冰柜。
- 优化收银金额，让金额更像收银屏，而不是浮动标签。
- 继续增强黑影和监控异常，但必须保持位置题答案与画面一致。

中期：

- 拆分 `script.js`，例如拆成配置、状态、事件、问题、渲染、UI。
- 建立更可靠的商品陈列/库存视觉模型。
- 增加更多简单事件，例如店员移动、价格牌变化。
- 增加更多基于 `eventLog` 的问题模板。
- 增加音效开关和轻量音效。
- 增加每日挑战模式，使用固定随机种子。
- 增加结算分享图。

长期：

- 迁移到微信小游戏或抖音小游戏。
- 替换为正式美术资产。
- 增加关卡、成就、排行榜等平台能力。

## 10. 后续开发注意事项

- 必须遵守 `AGENTS.md`。
- 不要把便利店场景做成一张整图，继续使用分层 DOM 元素。
- 新增事件时必须同时更新 `sceneState`、画面表现和 `eventLog`。
- 新增问题时必须只基于本局 `eventLog`。
- 新增配置优先放入 `DataConfig`。
- 新增画面元素优先通过 `SceneRenderer` 渲染。
- 不要引入后端、登录、广告、排行榜或平台 SDK，除非用户明确要求。
- 不要引入真实美术素材，当前阶段继续用 DOM、CSS、文字标签、色块等原型表现。
- 手机竖屏优先，修改样式时注意窄屏可读性和点击区域。
- 避免大规模重构。若需要重构，先提出小范围方案再执行。
- 修改后需要说明改了哪些文件、如何运行、如何验证。

## 11. 修改边界提醒

前端视觉优化允许：

- 修改 `style.css`。
- 修改 `index.html` 中展示层相关结构。
- 修改 `script.js` 中 `SceneRenderer` 的纯视觉 DOM 结构、className 和视觉状态 class 切换。
- 做响应式媒体查询。
- 做 CSS 图形和动画优化。

前端视觉优化禁止：

- 修改 `DifficultyManager` 核心逻辑。
- 修改 `EventGenerator` 核心逻辑。
- 修改 `QuestionGenerator` 核心逻辑。
- 修改 `eventLog` 数据结构。
- 修改 `sceneState` 数据结构。
- 修改 `currentQuestion` 数据结构。
- 修改分数、生命、轮数逻辑。
- 修改答题正确/错误判断逻辑。
- 修改游戏阶段切换逻辑。
- 修改观察时间、事件数量、问题类型配置，除非用户明确要求。

## 12. 推荐验证流程

每次修改后建议至少执行：

```bash
node --check script.js
```

并进行以下手动或自动烟测：

1. 打开 `http://127.0.0.1:8000/` 或 `http://localhost:8000/`。
2. 连续试玩 5 轮以上。
3. 检查每轮 `eventLog` 有事件。
4. 检查问题来自本局真实事件。
5. 检查商品高亮、门动画、黑影位置、收银金额、时钟变化是否可见。
6. 检查手机窄屏和桌面测试宽屏没有明显重叠。

## 13. 最近更新记录（2025-01）

### 前端视觉优化批次

#### 批次 1：修复监控效果和清理代码（已完成）

**P0-0：修复扫描线/噪点伪元素**
- 问题：`.scene::before` 和 `.scene::after` 缺少基础声明，导致扫描线和噪点不显示
- 修复：添加了 `content: ""`、`position: absolute`、`inset: 0`、`z-index: 24`、`pointer-events: none`
- 文件：`style.css`
- 影响：监控扫描线和噪点动画现在可以正常显示

**P1-3：清理媒体查询重复样式**
- 问题：窄屏和宽屏媒体查询中完整复制了 `.camera-hud`、`.fridge`、`.store-door` 样式
- 修复：只保留必要的差异覆盖，删除重复的完整样式块
- 文件：`style.css`
- 影响：提升 CSS 可维护性，避免基础样式和响应式样式分叉

#### 批次 2：收银金额位置优化（已完成）

**收银金额移到时钟下方**
- 问题：时钟在左上角，收银金额在右下角，距离太远，变化不易观察
- 修复：
  - CSS：收银金额从 `right: 26px; bottom: 90px;` 改为 `top: 110px; left: 24px;`
  - JavaScript：显示文本从 `state.cashierAmount` 改为 `收银金额: ${state.cashierAmount}`
- 文件：`style.css`、`script.js`
- 影响：收银金额和时钟集中在左上角，变化更容易被注意到

#### 批次 3：便利店场景颜色和门把手优化（已完成）

**场景颜色从绿色改为灰色**
- 问题：整个便利店背景都是绿色（墙面 `#314936`，地板 `#526648`），不像真实便利店
- 修复：
  - 墙面：从绿色调改为深灰蓝色调 `#3a4045`
  - 地板：从绿色调改为深灰色调 `#5a5e62`
- 文件：`style.css`
- 影响：场景更像真实便利店监控画面，诡异感通过 HUD、扫描线、噪点等保留

**门把手位置修正**
- 问题：门把手在右边 `right: 10px`，但门向右开（`transform-origin: right center`），物理上不合理
- 修复：门把手从 `right: 10px` 改为 `left: 10px`
- 文件：`style.css`
- 影响：门把手在左边，门向右开，符合物理逻辑

### 当前视觉状态更新

- ✅ 监控扫描线和噪点效果已修复并正常显示
- ✅ 收银金额显示在时钟下方（左上角），带有"收银金额:"标签
- ✅ 墙面颜色为深灰蓝色调（`#3a4045`），地板为深灰色调（`#5a5e62`）
- ✅ 门把手位置在左边，符合开门逻辑
- ✅ 诡异感通过监控 HUD 绿色发光、扫描线、噪点、暗角和低饱和度滤镜保留
- ✅ CSS 媒体查询已清理，避免重复样式维护问题

### 待优化项（参考 FRONTEND_REVIEW.md）

**P1 级别（强烈建议）**：
- P1-1：增强便利店空间感（统一光源、投影关系）
- P1-2：优化冰柜内部层次（层架、玻璃遮罩）
- P1-4：监控异常黑影效果增强（信号撕裂、色偏）

**P0 级别（仍需关注）**：
- P0-1：商品与货架坐标统一（建立注释或映射系统）
- P0-3：手机端拥挤风险（持续关注窄屏适配）

### 开发注意事项补充

- 扫描线和噪点效果依赖 `.scene::before` 和 `.scene::after` 伪元素，修改时注意保留基础声明
- 收银金额位置已从右下角移到左上角，修改布局时注意不要与时钟、灯光提示冲突
- 场景颜色已从绿色改为灰色，如需调整氛围，优先通过滤镜、HUD 颜色、扫描线等实现
- 门把手位置已修正，门相关动画和事件逻辑不需要修改
