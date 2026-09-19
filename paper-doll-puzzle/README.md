# 残纸归位 · 纸人拼合

这是一个可以独立运行的 HTML5 纸人拼合解谜小游戏，使用提供的像素素材。双击 `index.html` 即可预览。

## 操作
- 拖动部件到中央纸人轮廓；正确位置会吸附。
- 已归位部件点击可旋转 90°。
- 点击“验合”检查是否完成。
- `R` 未绑定快捷键，使用“重新打乱”按钮重置。
- `Esc` 退出谜题。

## UE 接入预留
小游戏会向父窗口发送 `postMessage`：
- `{ type: "ready", puzzleId: "paper_doll_01" }`
- `{ type: "completed", puzzleId, mistakes, routeHint: "right" }`
- `{ type: "exit", puzzleId, mistakes }`
- `{ type: "close", puzzleId, result: "success" }`

UE 侧只需要监听 `completed`，由主游戏负责打开保险柜、发放钥匙或解锁路线。小游戏本身不保存 UE 物品状态。

## 资源说明
当前部件从 `assets/paper-doll-parts.png` 中按裁剪区域读取；如果后续换成独立透明 PNG，只需要修改 `game.js` 中对应 piece 的 `src` 和移除 `crop`。

## 本轮修复
- 放置改为按部件目标优先命中，并扩大目标周围的吸附范围。
- 放置后先缩放再计算中心，减少透明画布造成的视觉偏移。
- 封纸目标框已扩大，且躯干不会阻止封纸继续放置。
- 查看提示会显示具体文字，同时高亮对应部件与目标区域。
