# SF 方法检查报告（method_checks）

- 日期：2026-09-22 ｜ 对应：v3 计划步骤 5、协议 §9 之 7
- 脚本：`reproduction/checks/check_sf_method.py`（副本在 `~/forwardgnn-run/src/` 运行，未修改任何官方代码）
- 证据归档：`reproduction/reports/sf_method_checks.json`
- 结果：**18/18 断言全部通过**（CoraML、split 0、2 层 GCN、epochs=2 的最小训练）

## 1. 静态证据（源码位置）

| 断言 | 源码位置 | 实现说明 |
| --- | --- | --- |
| 虚拟类别节点 | `gnn_sf.py:287-293` | 虚拟节点 id = [N, N+C)，初始特征 `nn.Embedding(C,F).weight.clone().detach()`（随机初始化、非训练参数） |
| 类别边只由训练标签生成 | `gnn_sf.py:151, 332-343` | `augment(y, aug_node_mask=data.train_mask)`，只有 mask 内节点连虚拟节点 |
| 双向边 | `gnn_sf.py:335-337` | 每个训练节点加正反两条边 |
| logits = 点积 | `gnn_sf.py:65`（训练）、`244`（评估） | `torch.mm(node_emb, virtual_node_emb.t())`，temperature≠1 时除以 T |
| 局部损失 = 交叉熵 | `gnn_sf.py:39, 71` | 每层自带 `nn.CrossEntropyLoss` |
| 局部 backward | `gnn_sf.py:70-75` | `optimizer.zero_grad() → loss.backward() → step()`，仅本层参数 |
| 逐层优化器 | `gnn_sf.py:36-38` | 优化器只收 `gnn_layer.parameters()` |
| 逐层训练 + 逐层早停 | `gnn_sf.py:158-195` | 每层独立 EarlyStopping，恢复该层最佳状态后固定 |
| 传下层前 detach | `gnn_sf.py:212-215` | `node_feats = layer.forward(...).detach()`（第 57 行输入端再 detach 一次） |
| 推理概率融合 | `gnn_sf.py:236-255` | 各层 softmax 概率累加后 argmax |

## 2. 动态断言结果（18/18 通过）

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| 增强图节点数 = N+C | ✅ | 2995 + 7 = 3002 |
| 虚拟节点数 = C | ✅ | 7 |
| 虚拟边数 = 2×训练节点数（双向） | ✅ | 3832 = 2×1916 |
| 每个训练节点恰连自己类别的虚拟节点（双向各一条） | ✅ | 1916 个节点逐一核对，0 个不匹配 |
| 验证/测试节点不出现在任何虚拟边中 | ✅ | 全部虚拟边的真实端点 ⊆ 训练集 |
| 各类虚拟节点度 = 2×该类训练节点数 | ✅ | 如 class 4：553 训练节点 → 度 1106 |
| logits 形状 = (训练节点数, 类别数) | ✅ | (1916, 7) |
| logits 等于逐行点积 | ✅ | 与手工展开点积最大差 1.49e-08 |
| temperature = 1.0 | ✅ | 与论文 τ=1.0 一致 |
| 损失函数 = CrossEntropyLoss | ✅ | 层内 criterion 实例核对 |
| 优化器 0 只管第 1 层参数 | ✅ | 参数集相等（2 个张量） |
| 优化器 1 只管第 2 层参数 | ✅ | 参数集相等 |
| 两层优化器参数集不相交 | ✅ | 交集 0 |
| 成功拦截 layer1 首次前向 | ✅ | 运行时包装生效 |
| layer1 输入已 detach | ✅ | 首次前向输入 requires_grad=False |
| 第 1 层在自己阶段确实学习 | ✅ | 参数哈希改变 |
| **第 2 层训练期间第 1 层参数逐比特不变** | ✅ | 参数 SHA-256 前后一致（层间无梯度/无更新的直接证据） |
| 推理融合使用全部层 | ✅ | accumulated_probs = 2 份（epochs=2 时两层 acc 相同属正常） |

## 3. 检查过程中的两个发现

1. **forward hook 不触发**：官方代码用 `layer.forward(...)` 直接调用（`gnn_sf.py:56, 212, 239`），绕过了 PyTorch `Module.__call__`，因此标准 forward hook 拿不到数据。检查脚本改用运行时包装（替换 `layer1.forward` 后恢复），未修改官方代码。这也是一个实现细节记录：若日后做基于 hook 的显存/计时插桩，同样必须用包装而非 hook。
2. **调试训练的两层 acc 相同**：epochs=2 时 29.05% == 29.05%，是训练量太小所致，不代表融合失效——融合的机制性证据是 `accumulated_probs` 有 2 份且逐层计算（静态证据 + 检查 18）。

## 4. 结论

SF 的实现与论文 §3.2 / 算法 2 一致：虚拟类别节点、仅训练标签的类别边、逐层局部交叉熵、层间 detach 无反传、各层概率融合推理，全部有源码定位 + 运行时行为双重证据。**针对 SF/BP 主线的"方法复现"机制检查通过**，可进入步骤 6（E02/E03 正式对照）。

注：闸门 A3 的完整覆盖还要求对 FF-VN、FF-LA、Top2Input、Top2Loss 做同类检查——那些属于步骤 8 扩展前的门槛，不阻塞 E02/E03。
