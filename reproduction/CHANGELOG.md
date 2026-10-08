# 变更记录（CHANGELOG）

格式：每条记录包含日期、类别、内容、影响范围。倒序排列。

---

## 2026-10-07 ｜ 汇报 PPT v3 增页 ｜ 15 → 18 页

- 按小组审阅意见新增 3 页（构建脚本 `tools/make_report_pptx_v3.js`，v2 保留；覆盖同一路径 pptx）：
  - **p3「ForwardGNN 论文提出了什么」**：BP / FF / SF / Top-Down SF 四行比较表（方法 / 输入 / 训练方式 / 是否跨层反传，SF 行蓝底高亮）+ 方法发展路线图（BP → FF → SF → Top-Down SF，箭头下标注三步改进动机：避免跨层反传 → 避免正负图两次前向 → 弥补缺少上层信息）；页底注明"否"指不跨层端到端反传的措辞边界。
  - **p5「SF 的核心改进：从两次前向变成一次前向」**：FF（正图前向 + 负图前向 → 比较正负表示）与 SF（正增强图一次前向 → 点积分数 → 交叉熵）双列流程对照，SF"一次前向"框深蓝高亮；关键点卡片强调"SF 不是简单地删除负样本——类别虚拟节点在同一次前向中充当'类别代表'，因此不再需要额外构造负输入图"（§3.2 / Eq.6 / 算法 2）。
  - **p9「论文贡献与本次复现范围」**（置于结果页之前）：8 行完成状态表（已完成=绿 / 未完成=棕 / 联邦=蓝，含"不属于论文原始实验"标注）+ 右侧"三个层次"卡片（论文提出 / 已复现 / 下一步扩展）。
- 现有页修改：p4（BP vs SF）SF 列明确"每层内部仍执行局部 loss.backward()，但只更新本层参数"；p6（虚拟节点）页底补"虚拟节点不是额外的分类器，而是通过图消息传递得到的类别代表表示"。
- 页脚与页号常量重编为 18；页码平移：原 p3–p14 → 新 p4–p6、p7–p8、p10–p17。
- 质检：PowerPoint COM → PDF（18 页确认）→ PyMuPDF PNG；visual-judge 子代理再次因供应商不可用，回退人工逐页检查——新增/修改/重编号共 6 张关键页（3/4/5/6/9/10）全部通过（表格、路线图箭头与标注、流程框高亮、页底卡片、页脚编号，无溢出/重叠）。构建时首次写入遇 EBUSY（文件被短暂占用，无 PowerPoint 进程），重试成功。

**影响范围：** 汇报材料与构建脚本；无实验数据、协议变化。

---

## 2026-10-06 ｜ 汇报 PPT v2 重构交付 ｜ 15 页新主线版

- 按外部审定意见重构：主线改为"研究什么 → SF 如何工作 → 复现了什么 → 结果说明什么 → 如何进入联邦学习阶段"，不再逐段搬运报告。新增 `tools/make_report_pptx_v2.js`，覆盖生成 `reports/ForwardGNN复现阶段性汇报.pptx`（15 页；v1 脚本保留）。
- 新增 `tools/plot_memory_absolute.py` + `reports/figure_memory_absolute.png`：第 8 页改用绝对峰值显存（MiB）主图，避免"SF 相对倍数低 = 绝对显存更低"的误读；相对倍数降为辅注，并附测量口径警告（含约 35 MiB 常驻输入、非 GPU 总占用）。
- 审定意见逐条落实的措辞修正：不再称点积为"纯方向相似度"（方向与长度共同影响）；"无负样本"改为"不需要额外负输入图，其余类别仍参与交叉熵比较"；删除"2–4 层 SF 均高于 BP"（L3 实际略低）；"逐位一致"改为"报告精度下均值与标准差相同"；"5 组划分两两互斥"改为"每个 split 内部互斥，不同 split 间不要求"。
- 新增第 13 页"联邦学习改造计划"（逐层聚合 5 步流程 + 5 个待定义问题）与第 15 页"老师确认事项"；第 12 页 GitHub 扩展结果标注"论文报告，尚未实测"。
- 质检链：PowerPoint COM → PDF（SaveAs 32）→ PyMuPDF PNG 逐页检查通过。修复负宽/高 LINE 形状破坏 OOXML 导致 COM 无法打开文件的问题——`seg()` 统一以 min 为原点并配合 flipH/flipV。
- 环境事件：winget 安装 LibreOffice 两次失败（多源歧义、下载中断），维持 PowerPoint COM 渲染链。

**影响范围：** 汇报材料与构建脚本；无实验数据、协议变化。

---

## 2026-09-24 ｜ 汇报 PPT 交付 ｜ ForwardGNN复现阶段性汇报.pptx

- 新增 `tools/make_report_pptx.js`（可重跑的 PPT 构建脚本，数据硬编码自 reproduction_report.md/resource_summary.csv）与 `reports/ForwardGNN复现阶段性汇报.pptx`（12 页：封面/背景/协议/环境/方法验证/准确率表/显存图/差异声明/进度/总结/命令备份/致谢）。
- 质检：全部 12 页经 PowerPoint COM → PDF → PNG 渲染逐页人工检查；修复 2 处排版（表格"逐位"换行、第 7 页底部注释与页脚间距）后通过。
- 环境备注：LibreOffice 两次安装尝试未成功（winget 多源歧义 + 下载被终止），渲染改用本机 PowerPoint；已安装 pptxgenjs（Node 全局）与 pymupdf（Windows Python 3.12，仅用于质检，与训练环境无关）。

**影响范围：** 新增汇报材料与构建脚本；无实验数据变化。

---

## 2026-09-23（夜 2） ｜ 阶段性复现报告完成 ｜ reproduction_report.md

- 新增 `reports/reproduction_report.md`：汇总步骤 1–7 全部证据（协议、环境、数据审计、方法检查 18/18、E01–E04 结果、显存—深度图、差异与口径声明、可复现命令、闸门进度、结论措辞边界）。
- 性质：面向汇报的阶段 A 中期报告；覆盖范围为"CoraML + GCN"子实验，边界声明明确（未覆盖其余数据集/骨干/方法/链接预测，阶段 B/C 未开始）。
- 数字全部取自登记表与原始结果 JSON，无新实验。

**影响范围：** 仅新增报告文件。

---

## 2026-09-23（夜） ｜ 步骤 7 交付图完成 ｜ figure_memory_vs_depth.png

**新增：**

- `tools/plot_resource.py`：读 `resource_summary.csv` 生成论文 Figure 2a 风格的"准确率 vs 峰值显存"双面板图（左=进程口径，右=扣除常驻输入的修正口径；实心=BP、空心=SF 沿用论文图例约定）。
- `reports/figure_memory_vs_depth.png`：CoraML+GCN、1–4 层、5 官方划分的成图。SF 四个深度重合于 1×（图中标注 overlap），BP 爬升至 5.55×（修正口径 20.6×）——论文核心主张的可视化证据。

**环境事件（已解决）：** 为装 matplotlib 曾被 pip 连带升级 numpy 至 1.24.4（与 scipy 1.6.2/sklearn 1.2.1 不兼容），已回退 numpy 1.19.2 并改用 matplotlib 3.6.3，训练关键依赖（torch/pyg/sklearn/scipy）逐一验证无损。教训入库：向该环境加装包必须显式钉住 numpy==1.19.2。

**影响范围：** 环境新增 matplotlib（绘图专用）；训练数值路径零变化。

---

## 2026-09-23（晚） ｜ v3 步骤 7 完成 ｜ 显存—深度扩展（E04a/E04b），论文核心主张复现

**实验：** BP/SF × 1–4 层 × 5 官方划分，共 8 组（`mem-*-coraML-L{1..4}-v1`），全部经 `tools/mem_wrap.py` 独立进程测量，`tools/summarize_resources.py` 汇总。

**核心结论：**

- **SF 峰值显存不随层数增长**：347.8 → 353.0 MiB，比例恒定 1.01–1.02×——论文 Figure 2a / Table 4 的核心主张在 CoraML+GCN 上复现。
- **BP 显存随深度增长**：L1→L2 跳升（45.3 → 243.3 MiB，5.4×；修正口径 19.9×），至 L4 达 251.3 MiB（5.55×；修正 20.6×）——方向与论文一致（论文口径 0.83→12.58 MB ≈ 15×）。
- 准确率 8 组全部对齐 Table 3(e)（差 ≤0.6 pp），BP L1 与论文逐位一致（31.72±4.80）。

**如实记录的口径差异：** (1) 进程峰值含约 35 MiB 常驻输入，绝对值与论文不可直接比，只比比例与趋势；(2) BP 增量集中在 1→2 层，推测与确定性算法反向实现及分配器行为有关；(3) CoraML 上 SF 绝对值高于 BP 小层数场景——与论文自身模式一致，论文主张的是增长平坦与大图场景优势。

**工具补丁：** `mem_wrap.py` 增加"零 CUDA 分配"检测——结果已存在导致全部 run 被跳过时标记 `skipped-no-training`，不再污染 resource_log 的 ok 行（此前 8 行 0.0 数据即此原因，已用真训练重测覆盖）。

**状态：** 闸门 A2/A3(SF)/步骤 7 均通过。阶段 A 剩余：步骤 8（扩展数据集/骨干/方法，闸门 A4）。产出：`reports/resource_summary.csv`（含论文对照列）。

**影响范围：** 登记 E04a/E04b；协议 §10 步骤 7 行更新；工具补丁一份。

---

## 2026-09-23 ｜ 测量工具入库 ｜ tools/ 建立（对应 v3 §6.2）

**新增：**

- `tools/mem_wrap.py`：独立进程运行官方训练脚本并记录峰值显存（`torch.cuda.max_memory_allocated/reserved`），追加写入运行副本 `results/resource_log.csv`；不改官方代码。对应 v3 计划 §6.2 的 `tools/profile_run.py` 功能位。
- `tools/summarize_resources.py`：汇总 8 组（BP/SF × 1–4 层）的准确率与显存，输出终端对照表并写出 `results/resource_summary.csv`；含"进程口径 M(L)/M(1)"与"扣除常驻输入的修正比例"两列，后者用于与论文 Table 4 口径近似对齐。对应 `tools/summarize_results.py` 功能位。

**修正（重要，若已按此前消息手创建过旧版请用本版覆盖）：** 初版 `mem_wrap.py`（对话中给出的版本）把 `resource_log.csv` 写到当前目录 `src/results/` 下，与汇总脚本读取的 `results/` 根不一致；入库版改为按训练脚本位置定位官方 results 根（`src/../results`），与 CWD 无关。

**部署到 WSL 运行副本：**

```bash
cp "/mnt/d/创新实践/The-reproduction-of-forwardgnn/reproduction/tools/mem_wrap.py" ~/forwardgnn-run/src/
cp "/mnt/d/创新实践/The-reproduction-of-forwardgnn/reproduction/tools/summarize_resources.py" ~/forwardgnn-run/src/
```

**影响范围：** 仅新增工具，不影响协议与已完成实验结果。

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
