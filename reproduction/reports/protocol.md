# ForwardGNN 复现协议（protocol）

- 版本：v1.1（2026-09-22，对齐复现计划 v3；变更明细见 CHANGELOG 同日条目）
- 状态：步骤 1 产出。环境、数据、训练均未开始；本文所有"目标数值"均来自论文原文，"复现值"一栏均为空。
- 有效范围：本协议是当前唯一有效的复现执行依据。总体计划的验收框架（复现三层级、逐步验收清单）继续沿用；计划中与 LR 路线相关的内容已作废。

---

## 1. 目标论文与代码材料

| 项目 | 内容 |
| --- | --- |
| 论文 | Forward Learning of Graph Neural Networks，Namyong Park et al., ICLR 2024 |
| 论文 PDF | `forwardgnn-main/ICLR-2024-forward-learning-of-graph-neural-networks-Paper-Conference.pdf` |
| 官方代码 | https://github.com/facebookresearch/forwardgnn （论文 Reproducibility Statement 给出的地址） |
| 代码快照 | `forwardgnn-main/the-source-code-of-forwardgnn-main/`（只读，不修改） |
| 快照校验 | `reports/source_snapshot.sha256`，46 个代码文件 + PDF，对应 git 提交 `b702c871cbf7e32c8e0925a068c539554e418a3a` |
| 论文用数据划分 | https://github.com/NamyongPark/forwardgnn-datasplits （官方 README 指明需手动下载放入 `datasplits/`） |

**决策记录：** 2026-09-21 确定以 ForwardGNN 为复现对象；LR 路线作废（`复现计划_旧版LR路线_已作废_20260921.md` 仅留档）。若联邦阶段（总体计划步骤 7）仍需无反向传播训练方法，届时另行评估，不影响本协议。

## 2. 复现范围与优先级

论文共有三类结果，按"官方代码能否完整覆盖"排定优先级：

### P0 —— 节点分类主结果（官方代码可完整复现）

- 论文位置：**Table 3**（五个数据集 × GCN/SAGE/GAT × 1–4 层 × 各方法准确率）、**图 2a 与图 5**（准确率 vs 显存）。
- 覆盖方法：BP、FF-LA、FF-VN、SF、SF-Top-To-Loss、SF-Top-To-Input（共 6 种，官方代码与脚本齐全）。
- 首轮最小对照链（详见 §8 与登记表）：E01 短跑跑通（SF-GCN/CoraML/2 层）→ E02 BP 正式基线 → E03 SF 正式对照，均为 CoraML、GCN、2 层。

### P1 —— 链接预测主结果（官方代码基本可复现）

- 论文位置：**Table 5**（ROC-AUC）、**图 2b 与图 6**。
- 覆盖方法：BP、ForwardGNN-CE、ForwardGNN-FF（有实现、无现成脚本，见 §7）、ForwardGNN-CE-Top-To-Input。
- 例外：ForwardGNN-SymBa、CaFo 不在官方代码中（归入 P2）。

### P2 —— 论文有、官方代码没有的基线（暂不复现，需另行引入）

- 节点分类：SymBa-GCN/SAGE/GAT（FF-SymBa 改造版）、CaFo、PEPITA（Table 3 中相应行；图 3 中相应方法）。
- 链接预测：CaFo、ForwardGNN-SymBa（Table 5 中相应行；图 4 中相应方法）。
- 处理原则：P0/P1 结果不依赖它们。若后续需要，从原始仓库引入并适配（PEPITA: `github.com/GiorgiaD/PEPITA`；CaFo: arXiv:2303.09728；SymBa: arXiv:2303.08418），单独登记实验、单独成表，不与 P0/P1 数字混排。

### 可选扩展（论文附录，均不在首轮范围）

- F.4 小训练样本（Planetoid-Cora/CiteSeer/PubMed）：需要额外数据集，暂缓。
- F.5 虚拟节点边方向性（`--aug-edge-direction unidirection`）：代码参数现成，P0 完成后可作为消融。

## 3. 复现层级判定（沿用总体计划）

1. **运行复现**：官方代码在本机完成训练、评估、结果保存（对应 E01 短跑）。
2. **方法复现**：SF 与 BP 在相同协议下得到统计上合理、趋势与论文一致的结果（对应 E02/E03）。
3. **结果复现**：使用论文官方 datasplits + 全部协议（§6），多种子均值±标准差与 Table 3/Table 5 数字对齐（对齐判据见 §8.2，**在看测试结果之前约定**）。

## 4. 论文实验 ↔ 官方代码映射（已逐一静态核对）

### 4.1 节点分类（`--task node-class`）

| 论文方法 | 论文定义 | 实现文件（src/ 下） | 启动脚本（exp/nodeclass/） | 模型名 |
| --- | --- | --- | --- | --- |
| BP | 4.2 节对照 | `train_backprop.py` | `nodeclass-bp.sh` | `GNN-GCN` / `GNN-SAGE` / `GNN-GAT` |
| FF-LA（标签拼接） | §3.1 Eq.(4)，Alg.1 | `forward_learning/nodeclass/gnn_ff_with_label_appending.py` | `nodeclass-ff-label_appending.sh` | `GNN_LA-{GCN,SAGE,GAT}` |
| FF-VN（虚拟节点） | §3.1 Eq.(5)，Alg.1 | `forward_learning/nodeclass/gnn_ff_with_virtual_nodes.py` | `nodeclass-ff-virtual_nodes.sh` | `GNN_VNLA-{GCN,SAGE,GAT}` |
| SF（单前向，核心方法） | §3.2 Eq.(6)，Alg.2 | `forward_learning/nodeclass/gnn_sf.py` | `nodeclass-sf.sh` | `GNN_SingleForward-{GCN,SAGE,GAT}` |
| SF-Top-To-Loss | §3.3 Eq.(8)，Alg.3 | `forward_learning/nodeclass/gnn_top2loss_sf.py` | `nodeclass-sf-top2loss.sh` | `GNN_Top2Loss_SingleForward-{...}` |
| SF-Top-To-Input | §3.3 Eq.(7)，Alg.3 | `forward_learning/nodeclass/gnn_top2input_sf.py` | `nodeclass-sf-top2input.sh` | `GNN_Top2Input_SingleForward-{...}` |

### 4.2 链接预测（`--task link-pred`）

| 论文方法 | 论文定义 | 实现文件（src/ 下） | 启动脚本（exp/linkpred/） | 模型名 |
| --- | --- | --- | --- | --- |
| BP | — | `train_backprop.py` | `linkpred-bp.sh` | `GNN-{GCN,SAGE,GAT}` |
| ForwardGNN-CE | §3.4 Eq.(9)，Alg.4（BCE 目标） | `forward_learning/linkpred/gnn_forward.py` | `linkpred-fl.sh` | `GNN_FL-CE-{GCN,SAGE,GAT}` |
| ForwardGNN-FF | §3.4（FF 目标，Eq.3） | `forward_learning/linkpred/gnn_forward.py` | **无现成脚本**：复制 `linkpred-fl.sh`，模型名改为 `GNN_FL-FF-*`（`train_forward.py:192` 按名称识别 FF 类型） | `GNN_FL-FF-{GCN,SAGE,GAT}` |
| ForwardGNN-CE-Top-To-Input | §3.3 信号路径 | `forward_learning/linkpred/gnn_topdown_forward.py` | `linkpred-fl-topdown.sh` | `GNN_FL-CE-TopDown-{GCN,SAGE,GAT}` |

### 4.3 官方代码缺失的方法（P2，见 §2）

FF-SymBa、CaFo、PEPITA、ForwardGNN-SymBa 在官方仓库中无实现（已在 `src/` 全文检索确认）。

## 5. 数据与划分

| 项目 | 协议 |
| --- | --- |
| 数据集（5 个） | `CitationFull-CiteSeer`、`CitationFull-Cora_ML`、`CitationFull-PubMed`、`Amazon-Photo`、`GitHub`（脚本中的名称）。统计见论文 Table 2；来源论文 App. A：CitationFull 系列出自 Bojchevski & Günnemann (2018)，Amazon-Photo 出自 Shchur et al. (2018)，GitHub 出自 Rozemberczki et al. (2021) |
| 数据获取 | 官方代码首次运行时经 PyTorch Geometric 自动下载到 `data/`；**不用手动准备 Cora 文本文件** |
| 数据版本注意 | `CitationFull-Cora_ML`（2,995 节点、2,879 维、7 类）≠ Planetoid-Cora（2,708 节点、1,433 维）。与旧 LR 路线使用的数据版本不同，任何结果不可跨版本比较 |
| 划分机制（已核对 `src/datasets/datasplit.py`） | 节点：KFold 5 折（`random_state=101, shuffle=True`）定出 train+val 与 test（各 split 的 test 占 20%），再用 `train_test_split(test_size=0.2, random_state=split_i*127)` 从 train+val 中切出验证集 → 整体 64% / 16% / 20%，与论文 §4.1 一致。共 5 个 split |
| 划分来源 | **论文对齐实验必须使用官方 datasplits**（从 `forwardgnn-datasplits` 下载放入 `datasplits/`）。代码在划分文件缺失时会自行随机生成（可复现但与论文划分不同），因此步骤 2 必须核实"下载的划分确实被加载"（记录于协议 §9 待核对项 1） |
| 边划分（链路预测） | 同目录机制，随 datasplits 仓库一并下载 |

## 6. 超参数协议（"论文值 ↔ 脚本/代码值"逐项核对）

来源缩写：**[P-B]** 论文 App. B；**[P-4.1]** 论文 §4.1；**[S]** 官方实验脚本实参；**[C]** 官方代码默认值/硬编码。

| 参数 | 值 | 来源与核对结果 |
| --- | --- | --- |
| 隐藏维度 | 128 | [P-B] = [S] `NUM_HIDDEN=128` ✅ |
| 优化器 | Adam，lr=0.001，weight decay=0.0005 | [P-B]；lr=[S] `LR=0.001` ✅；wd=5e-4 为代码硬编码（`train_forward.py` 各 build 函数）✅ |
| 最大轮数 | 1000 | [P-B] = [S] `EPOCHS=1000` ✅（注意 `train_forward.py` argparse 默认 300，**必须显式传 1000**，脚本已传） |
| 验证频率 | 每 2 个 epoch | [S] `VAL_EVERY=2`（论文未写明该值，以脚本为准，记为脚本补充信息） |
| 早停耐心 | 100，按**验证次数**计（val-every=2 → 约 200 epoch 无改善才停） | [P-B] = [S] `PATIENCE=100` ✅；计数语义见 `train_utils.py` EarlyStopping（每次验证步进一次） |
| 重复次数 | `--num-runs 5 --seed 100` ↔ **5 个官方划分（split 0–4）**：run_i 即 split_i，每 run 种子 = seed×101 + run_i×3（10100/10103/10106/10109/10112） | [P-4.1]（五个随机划分）= [C] `SeedManager`（train_utils.py:40）、两入口 `split_i=run_i` ✅ 2026-09-22 代码核实；**num-runs>5 不等于更多独立种子**（v3 §七） |
| GNN 层数 | Table 3 覆盖 1/2/3/4 层 | [P]；BP 脚本已含 1–4 层循环，**SF 等前向脚本只写了 4 层，复现 Table 3 需自行扫描层数** |
| GCN 归一化 | 加自环 + 对称归一化 | [P-B]（步骤 3 核对实现，§9 待核对项 3） |
| SAGE 聚合 | mean | [P-B]（同上待核对） |
| GAT | 4 头、拼接、LeakyReLU 负斜率 0.2、自环 | [P-B]；heads=4 已核对 `src/gnn/gnn_conv.py:30` ✅；其余待核对 |
| FF 阈值 θ | 2.0 | [P-B] = [C] `--ff-theta` 默认 2.0 ✅ |
| FF 负样本数 | 每节点 K−1 个 | [P-B]；脚本 `NUM_NEGS=100`（注释：use all negatives），代码按 `min(num_negs, K−1)` 截断 → 等价 ✅ |
| 温度 τ | 1.0 | [P-B] = [C] `--temperature` 默认 1.0 ✅ |
| 虚拟节点边方向 | 双向 | [P 主文] = [S] `--aug-edge-direction bidirection` ✅（F.5 消融用 unidirection，首轮不做） |
| 梯度裁剪 | max-norm 1.0 | [C] `--grad-max-norm` 默认 1.0（论文未提；记为代码补充信息，步骤 3 核对是否对结果敏感） |
| epochs 语义 | SF：**每层**最多 1000 次局部更新（两层 ≈ 2000 次）；BP：全网共 1000 次更新上限 | [C] gnn_sf.py 逐层训练循环；相同 epochs 不代表相同更新量或耗时（v3 计划 §3.1） |
| GAT 确定性 | GCN/SAGE 确定性训练；GAT 代码显式关闭确定性 | [C] `set_seed(deterministic="gat" not in model.lower())`，2026-09-22 核实 |
| 显存口径 | 模型参数 + 激活 + 梯度 + Adam 一/二阶矩 | [P-B]；论文用 H100/CentOS。本机数值只做**相对趋势**比较（SF 恒定 vs BP 随层数增长），绝对值必须连同硬件一起报告 |

## 7. 论文与官方代码的差异/缺失清单（步骤 1 结论）

| # | 差异或缺失 | 影响 | 采取的版本与原因 |
| --- | --- | --- | --- |
| 1 | FF-SymBa、CaFo、PEPITA、ForwardGNN-SymBa 无官方实现 | Table 3、图 3、图 4、Table 5 部分行无法用官方代码复现 | 列为 P2；P0/P1 不受影响。如需复现，从各方法原始仓库引入并单独登记 |
| 2 | ForwardGNN-FF 有实现但无启动脚本 | Table 5 该行需自建脚本 | 复制 `linkpred-fl.sh` 改模型名（§4.2），改动记入 CHANGELOG |
| 3 | 前向学习脚本只跑 4 层（BP 脚本 1–4 层齐全） | 复现 Table 3 各层需自行扫描层数 | 复制脚本修改 `num_layers` 循环，原脚本不动 |
| 4 | `train_forward.py` epochs 默认 300，与论文 1000 不符 | 忘传参数会得到错误协议 | 一律走脚本/显式 `--epochs 1000` |
| 5 | 论文未写明验证频率与梯度裁剪 | 协议以代码实参为准 | `VAL_EVERY=2`、`grad-max-norm=1.0`，已在 §6 标注为脚本/代码补充信息 |
| 6 | 论文实验硬件（H100/CentOS）与本机不同 | 显存绝对值不可直接比 | 只比较相对趋势，硬件信息随每次运行记录 |
| 7 | 官方安装脚本 PyG 经 conda 通道安装且注释标明 Linux/OSX | 本机为 Windows，安装可能失败 | 已改用 WSL2，官方脚本原样安装成功（environment.json）；差异已销号 |
| 8 | 官方代码**不落盘** best.pt：早停最佳参数仅保留在内存（`EarlyStopping.best_model_state_dict`） | 旧计划"保存和加载模型文件"类验收不适用 | 短跑验收 = 进程正常退出 + stdout + 结果 JSON；模型持久化属后补功能（v3 计划 §6.3） |
| 9 | 结果文件按 `task-model-num_layers-run_i-seed` 命名，已存在即跳过（除非 `--overwrite-result`）；文件名不含 lr/epochs/hidden | 改超参会静默复用旧结果 | 每套配置使用独立 exp-setting（命名规范：`smoke-bp-coraML-L2-v1`、`paper-bp-coraML-L2-v1` 等，v3 计划 §五） |

已排除的疑点（核对过、无差异）：FF 负样本数（#7 条目上方 §6 已述）、GAT 头数、权重衰减、θ、τ、划分比例。

## 8. 评价指标与对照数字

### 8.1 指标

- 节点分类：测试 Accuracy（%），报告 5 个划分（split 0–4）的均值±标准差。
- **单位差异（2026-09-22 代码核实）**：SF 返回百分数（gnn_sf.py:259 `acc = 100.0 * ...`），BP 的 `eval_node_classification` 返回 0–1 比例（eval_utils.py:14）。汇总时统一新增 `accuracy_pct` 字段，原始值保留不改写。
- 链接预测：测试 ROC-AUC（%）。
- 显存与耗时：按 v3 计划步骤 7 要求另行测量记录（本协议先固定口径为论文 App. B 口径 + 本机硬件说明）。

### 8.2 与论文对齐的判据（在看任何测试结果之前约定）

- E02/E03（最小对照）：以 Table 3(e) CORAML `#Layers=2` 为锚点。
- **对齐标准**：复现均值与论文均值的绝对差 ≤ 1.0 个百分点，且复现值落在论文均值 ±2 个标准差范围内，视为"与论文一致"；差值在 1–3 个百分点之间视为"趋势一致但未完全对齐"，需列差异来源；> 3 个百分点视为"未对齐"，先排查协议（划分、层数、轮数）再下结论。
- 该判据由本协议 v1.0 预先固定，之后不得因结果不理想而回改；如确需修改，记入 CHANGELOG 并说明。

### 8.3 关键对照数字（论文原文，尚未复现）

| 实验 | 论文位置 | 论文值 |
| --- | --- | --- |
| BP-GCN，CoraML，2 层 | Table 3(e) | 86.84 ± 1.0 |
| SF-GCN，CoraML，2 层 | Table 3(e) | 87.95 ± 1.4 |
| （扩展参考）BP-GCN，CoraML，3 层 | Table 3(e) | 88.65 ± 1.4 |
| （扩展参考）SF-GCN，CoraML，3 层 | Table 3(e) | 88.15 ± 1.5 |

其余所有数据集×方法×层数的论文值，在做对应实验时从 Table 3 / Table 5 原表抄录并登记，不提前填写。

## 9. 待核对清单（不阻塞步骤 2，逐项带证据销号）

| # | 待核对项 | 计划处理时机 |
| --- | --- | --- |
| 1 | 官方 datasplits 下载后确实被加载（而非本地重新随机生成）；划分×种子组合方式 | ✅ 2026-09-21/22 关闭：划分加载自 datasplits 目录且比例精确吻合（environment.json）；组合方式 = run_i↔split_i、种子 10100+3·run_i（§6） |
| 2 | 评估实现与论文一致（Accuracy / ROC-AUC 计算方式，`src/utils/eval_utils.py`） | 步骤 3 |
| 3 | BP 路径与 App. B 一致性（GCN 归一化、SAGE mean、GAT 0.2 负斜率与自环） | 步骤 3 |
| 4 | 显存测量：论文口径在官方代码中如何体现，本机如何测量 | 步骤 6 之前 |
| 5 | Windows 下 PyTorch 1.13.1 + PyG 2.2.0 可安装性；不可行时的替代版本 | ✅ 2026-09-21 关闭：改用 WSL2，官方脚本原样安装成功（environment.json） |
| 6 | CoraML 5 组划分互斥性与全节点覆盖 + 划分文件校验值 | ✅ 2026-09-22 关闭：`reports/split_manifest_cora_ml.json`（15 个文件，全部互斥、并集 = 2995） |
| 7 | SF 方法断言：虚拟节点 N+C、类别边仅由 train_mask 生成、双向模式边数、逐层优化器、层间 detach、逐节点 L2 归一化、虚拟节点初始特征 nn.Embedding→detach、概率融合推理 | ✅ 2026-09-22 关闭（SF 部分）：`reports/method_checks.md`，18/18 断言通过；FF-VN/FF-LA/Top2Input/Top2Loss 同类检查留到步骤 8 前（闸门 A3 完整版） |

## 10. 与总体计划的衔接

| v3 计划步骤 / 闸门 | 在本协议下的内容 | 状态 |
| --- | --- | --- |
| 步骤 1 / 闸门 A0（协议锁定） | 本文档 + CHANGELOG + 登记表 + 快照校验 | ✅ 2026-09-21，v1.1 于 09-22 对齐 v3 |
| 步骤 2（兼容环境） | WSL2 conda 环境、依赖（含 torch_sparse/torch_scatter）、--help、device、硬件记录 | ✅ 2026-09-21/22（environment.json） |
| 步骤 3（数据与划分） | 数据下载、官方划分加载、互斥/覆盖审计、划分校验值 | ✅ 2026-09-21/22（split_manifest_cora_ml.json） |
| 步骤 4 / 闸门 A1（官方代码通路） | E01a BP smoke + E01b SF smoke（20 epochs、1 run、独立 exp-setting） | 未开始 |
| 步骤 5 / 闸门 A3（方法完整性） | SF 方法检查（§9 之 7）；随后覆盖 FF-VN/FF-LA/Top2Input/Top2Loss | 未开始 |
| 步骤 6 / 闸门 A2（核心 SF/BP） | E02 BP 正式 + E03 SF 正式（5 个划分对照，accuracy_pct 统一）；附未训练/多数类诊断基线 | 未开始 |
| 步骤 7（显存/时间/深度） | 1–4 层显存与时间扩展，M(L)/M(1) 相对比例 | 未开始 |
| 步骤 8 / 闸门 A4（论文主结果） | P0/P1 范围扩展（§2）：多数据集、多骨干、FF/TopDown、链接预测 | 未规划 |
| 联邦扩展（v3 §九，阶段 C） | 不在本协议范围（另立协议） | 未开始 |
