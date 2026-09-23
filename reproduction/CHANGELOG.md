# 变更记录（CHANGELOG）

格式：每条记录包含日期、类别、内容、影响范围。倒序排列。

---

## 2026-09-23 ｜ 闸门 A2 通过 ｜ E02/E03 正式对照完成，双双对齐论文

**E02（BP-GCN，CoraML，2 层，1000 epochs，5 官方划分）：** 逐 split 84.98 / 87.31 / 87.15 / 87.15 / 87.81 → **86.88 ± 0.98**；论文 Table 3(e) 86.84±1.0，差 +0.04 pp。原始 perf 为 0–1 比例，汇总时 ×100（accuracy_pct 约定）。

**E03（SF-GCN，同协议）：** 逐 split 86.48 / 89.65 / 88.31 / 89.15 / 86.98 → **88.11 ± 1.22**；论文 87.95±1.4，差 +0.16 pp。SF > BP 的排序及约 +1.1 pp 的差距与论文一致。

**判定：** 按协议 §8.2 预先约定判据（差 ≤1.0 pp 且落在论文 ±2σ 内），**两个子实验均判定"与论文一致"**。结论边界：这是"CoraML + GCN + 2 层"子实验的结果对齐，不等于整篇论文复现完成。实验由用户手动执行，命令与 exp-setting（paper-bp/sf-coraML-L2-v1）已登记。

**状态：** 闸门 A2 通过。下一步二选一：步骤 7（1–4 层显存/时间扩展，论文核心卖点）或步骤 8（扩展数据集/骨干/方法）。

**影响范围：** 登记表 E02/E03 置 ✅ 并录入数值；协议 §10 闸门 A2 行更新；无代码修改。

---

## 2026-09-22（夜） ｜ v3 步骤 5（SF 部分）完成 ｜ 方法检查 18/18 通过

**产出：** `checks/check_sf_method.py`、`reports/method_checks.md`、`reports/sf_method_checks.json`。

**结论：** SF 实现与论文 §3.2 / 算法 2 一致，全部断言有"源码定位 + 运行时行为"双重证据：增强图 3002 = 2995+7 节点；虚拟边 3832 = 2×1916 且每个训练节点只连自己类别的虚拟节点（双向）、验证/测试节点无类别边、各类虚拟节点度 = 2×该类训练数；logits 为节点表示与类别表示的点积（误差 1.49e-08）、交叉熵局部损失、τ=1.0；两层优化器参数集互不相交且各管本层；**第 2 层训练期间第 1 层参数 SHA-256 逐比特不变**（层间无梯度/更新的直接证据）；layer1 输入 requires_grad=False（detach 链闭合）；推理 accumulated_probs 覆盖两层。

**过程发现：** 官方代码以 `layer.forward(...)` 直接调用（gnn_sf.py:56/212/239），绕过 `Module.__call__`，标准 forward hook 不触发——检查脚本改用运行时包装拦截（未改官方代码）。此细节对日后 hook 类插桩（显存/计时）同样适用。

**状态更新：** 协议 §9 之 7 的 SF 部分销号（FF-VN/FF-LA/Top2Input/Top2Loss 的同类检查留到步骤 8 扩展前，不阻塞 E02/E03）。下一步 = v3 步骤 6：E02/E03 正式对照（1000 epochs、5 划分、对照 Table 3(e)）。

**影响范围：** 无代码修改；新增一个检查脚本与两份报告。

---

## 2026-09-22（晚） ｜ 闸门 A1 通过 ｜ E01a/E01b 短跑完成（v3 步骤 4）

**范围确认：** 按用户指示，当前仅执行阶段 A（论文复现）；B（LR 扩展）/ C（联邦）保持挂起，阶段闸门隔离不变，协议无需改动。

**E01a（BP smoke，先跑）：** CoraML / GCN / 2 层 / 1 run / 20 epochs，GPU。退出码 0；结果 JSON perf = 0.290484（BP 原生 0–1 比例，即 29.05%；官方汇总打印会在这个小数后面直接拼 "%" 字样，再次印证 v3 的单位警告）；显著高于 7 类随机水平 14.3%，学习确认。BP 的 best_val_epoch 字段是代码里从未回填的静态 -1 占位（train_backprop.py:60）；选模型功能本身正常——验证每 2 epoch 一次，EarlyStopping 在内存保存最佳验证状态并在测试前恢复（train_backprop.py:160-165）。

**E01b（SF smoke）：** 同配置，每层 20 epochs。退出码 0；两层均跑满 20 epochs（train_epochs "19-19"，此前 stdout 中"第二层停在 epoch 9"是 tqdm 与 stdout 缓冲交错的显示假象，以 JSON 为准）；单层 35.73% → 两层概率融合 62.44%；SF 按层结束各写出一个结果文件（num_layers1 / num_layers2），最终结果以 num_layers2 为准。

**新环境要求（实测确认，影响所有后续 GPU 运行）：** 必须先 `export CUBLAS_WORKSPACE_CONFIG=:4096:8`。官方代码对 GCN/SAGE 启用 `torch.use_deterministic_algorithms(True)`，CUDA ≥ 10.2 下 cuBLAS 不设此变量会直接抛 RuntimeError（已用最小用例复现确认）。已写入 environment.json；此为环境变量要求，未修改任何官方代码。

**状态：** 闸门 A1（官方代码通路）通过——原样入口运行成功，数据/划分/日志/结果 JSON 可重复产出。下一步：v3 步骤 5 方法检查（协议 §9 之 7），随后步骤 6 正式对照（E02/E03）。

**影响范围：** 登记表 E01a/E01b 置 ✅ 并录入结果；environment.json 增加必需环境变量；无代码修改。

---

## 2026-09-22 ｜ 计划 v3 对齐审查 ｜ 判定：已完成步骤 1–2 可行，已小幅对齐

**审查结论：** 新计划（`图神经网络无反向传播联邦学习_复现计划_v3.md`，三阶段 A 论文复现 / B LR 扩展 / C 联邦，含闸门 A0–A4/B/C）与已执行的路线**一致**，无返工项。协议更新至 v1.1。

**v3 关键代码断言逐一核实（全部为真）：**

- 种子公式 `seed×101 + run_i×3`（train_utils.py SeedManager）→ 10100/10103/10106/10109/10112 ✅
- `num_runs` ↔ `split_i` 一一对应：5 次运行 = 5 个官方划分，非同划分多种子 ✅
- 指标单位差异：SF 返回百分数（gnn_sf.py:259），BP 返回 0–1 比例（eval_utils.py:14）✅ → 汇总统一 `accuracy_pct`
- 官方代码不落盘 best.pt（EarlyStopping 仅内存保存）✅ → E01 验收口径已改
- 结果文件已存在即跳过、文件名不含 lr/epochs/hidden ✅ → 采纳 v3 的独立 exp-setting 命名规范
- SF epochs 为每层语义；patience 按验证次数计；GAT 显式非确定性 ✅

**运行时依赖补查（WSL2）：** torch_sparse 0.6.17、torch_scatter 2.1.1、torch_cluster 1.6.1 已随 pyg 2.2.0 安装；torch_spline_conv、pyg_lib 缺失但 GCN/SAGE/GAT 不需要；两入口 `--help` 正常；`args.device=cuda:0`；GATConv GPU 前向正常（v3 步骤 2 清单全部满足）。

**数据审计补齐：** `reports/split_manifest_cora_ml.json`——CoraML 5 组划分两两互斥、并集 = 2995 全节点，15 个划分文件 SHA-256 已记录。

**文档变更：**

- `protocol.md` → v1.1：§6 补充重复方式（split↔run↔种子）、epochs/早停/GAT 确定性语义；§7 新增 best.pt 与结果复用两条差异；§8.1 补充单位差异与 accuracy_pct；§9 销号 1、5，新增 6（已闭）、7（步骤 5 待做）；§10 改为对齐 v3 步骤 1–8 与闸门 A0–A4。
- `experiment_registry.md`：E01 拆为 E01a（BP smoke，先跑）+ E01b（SF smoke），采用 v3 的 exp-setting 命名。

**结构差异说明（判定为等效偏离，保留现状）：** v3 §6.2 建议 reproduction/ 放在代码根目录内；本仓库代码根目录是只读快照（有逐文件校验），故 reproduction/ 位于仓库根，WSL 运行副本 `~/forwardgnn-run` 承担 v3 中"代码根目录"的运行角色。功能映射：protocol.md↔protocol.md、source_snapshot.sha256↔source_manifest.json、environment.json↔environment.txt+hardware.json、reports/↔reports/、checks/↔checks/。

**其他备注：** v3 文档内的路径（D:/创新实践/forwardgnn-main/…）为旧目录布局；本仓库实际根为 D:\创新实践\The-reproduction-of-forwardgnn，代码快照位于 forwardgnn-main/the-source-code-of-forwardgnn-main/。执行时一律以 environment.json 的 locations 为准。

**影响范围：** 无返工；E01a/E01b 具备执行条件。

## 2026-09-21 ｜ 步骤 2 完成 ｜ WSL2 环境与数据就绪

**环境（记录见 `reports/environment.json`）：**

- 环境路线确定为 **WSL2 Ubuntu 26.04**（用户机器有 RTX 4060 8GB + 驱动 560.94，且 WSL2 Ubuntu 已存在；VM 无 CUDA 直通、原生 Windows 环境偏差大，均不采用）。
- conda（~/miniconda3, v26.3.2）创建环境 `ForwardLearningGNN`：Python 3.8.20、PyTorch 1.13.1（CUDA 11.7 运行时）、PyG 2.2.0、tqdm 4.67.1——与官方 `install/install_packages.sh` 一致。
- **GPU 实测通过**：`torch.cuda.is_available()=True`；matmul kernel 在 4060（sm_89）上经 PTX JIT 正常执行——协议此前标记的 sm_89 兼容性风险解除。

**数据：**

- 官方划分仓库 `NamyongPark/forwardgnn-datasplits` 克隆至 `~/forwardgnn-datasplits`，150 个划分文件装入运行副本 `~/forwardgnn-run/datasplits/`。
- CitationFull-Cora_ML 经官方加载器自动下载并加载成功：2,995 节点 / 2,879 特征 / 7 类 / 16,316 边，与论文 Table 2 一致；split 0 实测 1916/480/599 = 64.0%/16.0%/20.0%，特征全部有限值。
- **协议 §9 待核对项 1（官方划分确实被加载）关闭**：加载日志指向 datasplits 目录且比例与 64/16/20 精确吻合。
- **协议 §9 待核对项 5（PyTorch/PyG 安装可行性）关闭**：WSL2 下按官方脚本原样安装成功。

**快照校验修正：**

- 发现 Windows 仓库 `core.autocrlf=true`：Windows 工作区文本文件为 CRLF，WSL 检出为 LF。原 `source_snapshot.sha256` 是在 Windows 工作区计算的，只对 CRLF 字节形态有效。
- 已在 WSL（commit `b702c87`，与 Windows 同提交）重新生成 **LF 规范形态**的校验清单并覆盖 `reports/source_snapshot.sha256`；运行副本 `~/forwardgnn-run` 逐文件校验全部通过（45 个代码文件 + 论文 PDF）。
- 约定：今后以该 LF 版本为唯一校验基准；Windows 侧如需校验，须先按 LF 规范化或对照 git blob。

**目录布局（WSL）：**

- `~/The-reproduction-of-forwardgnn`：git 克隆，只读参照（未写入任何数据）。
- `~/forwardgnn-run`：实验运行副本（代码与快照逐字节一致），训练产生的 `data/`、`results/` 都在这里，不污染快照。
- `~/forwardgnn-datasplits`：官方划分上游克隆。

**影响范围：** 协议 §9 之 1、5 两项销号；E01 短跑（步骤 4）具备执行条件。未运行任何训练。

## 2026-09-21 ｜ 步骤 1 完成 ｜ 确定复现对象，建立实验记录

**决策：**

- 正式确定复现对象为 **ForwardGNN**（ICLR 2024, "Forward Learning of Graph Neural Networks"）。
- LR（似然比）路线正式作废：`forwardgnn-main/复现计划_旧版LR路线_已作废_20260921.md` 仅留档，不再作为执行依据；原计划文档中"LR 为优先复现路线"的表述一并作废。原计划的**验收框架**（复现三层级、逐步验收清单、证据要求）继续沿用。
- 本目录 `reproduction/` 建立，作为唯一实验工作目录；`forwardgnn-main/the-source-code-of-forwardgnn-main/` 保持只读快照。

**产出：**

- `README.md`：工作目录说明。
- `reports/source_snapshot.sha256`：官方代码 46 个文件 + 论文 PDF 的 SHA-256 校验清单（对应 git 提交 `b702c871cbf7e32c8e0925a068c539554e418a3a`）。
- `reports/protocol.md`（v1.0）：复现协议——复现范围、论文实验与代码映射、超参数协议、对照数字、论文与代码差异清单。
- `reports/experiment_registry.md`：实验登记表（预登记 E01–E03，均未开始）。

**静态核对结论（尚未运行任何代码）：**

- 论文方法与官方代码映射关系已逐一确认（详见协议 §4）；链路预测的 ForwardGNN-FF 有实现（`GNN_FL-FF-*`）但官方未提供启动脚本。
- 官方代码**缺失**论文对比基线：FF-SymBa、CaFo、PEPITA、ForwardGNN-SymBa（影响论文 Table 3、图 3、图 4、Table 5 的部分行）→ 列为 P2，详见协议 §7。
- 已核对一致项：GAT 4 头（`src/gnn/gnn_conv.py:30`）；FF 负样本数脚本设 `NUM_NEGS=100`、代码截断为 K−1，与论文 App. B 一致；权重衰减 5e-4（代码硬编码）与 App. B 一致；θ=2.0、τ=1.0 与 App. B 一致；数据划分 64/16/20（KFold 5 折 + 再切 20% 验证）与论文一致。
- 待核对项（不阻塞步骤 2，详见协议 §9）：官方 datasplits 下载后的加载验证、评估指标实现、BP 训练路径与 App. B 的一致性、Windows 下 PyG 安装方式、显存测量口径。

**影响范围：** 后续所有实验以 `reports/protocol.md` 为准；不涉及任何代码修改。
