# 实验登记表（experiment registry）

规则：每个实验启动前在此登记编号；结束后回填结果位置与状态。结果目录为 `runs/<编号>/`。
当前状态：**尚无任何实验运行**，E01–E03 为预登记。

## 预登记实验

| 编号 | 对应步骤 | 实验 | 协议要点 | 论文对照 | 状态 |
| --- | --- | --- | --- | --- | --- |
| E01a | v3 步骤 4 短跑 | **BP**-GCN，CoraML，2 层，1 run，20 epochs，`--exp-setting smoke-bp-coraML-L2-v1` | 先跑 BP；验收 = 进程正常退出、无 NaN/Inf、stdout + 结果 JSON 存在（官方代码不落盘 best.pt，不要求模型文件） | 无（运行复现） | ✅ 2026-09-22 |
| E01b | v3 步骤 4 短跑 | **SF**-GCN，CoraML，2 层，1 run，20 epochs（每层 20），`--exp-setting smoke-sf-coraML-L2-v1` | 同上，且两层均执行局部训练 | 无（运行复现） | ✅ 2026-09-22 |
| E02 | 步骤 6 正式对照 | BP-GCN，CoraML，2 层，论文协议，5 runs | `nodeclass-bp.sh` 收敛到单数据集单层；官方 datasplits | Table 3(e) 2 层：86.84±1.0 | ✅ 2026-09-23 |
| E03 | 步骤 6 正式对照 | SF-GCN，CoraML，2 层，论文协议，5 runs | 与 E02 同划分、同预算 | Table 3(e) 2 层：87.95±1.4 | ✅ 2026-09-23 |
| E04+ | 步骤 6 扩展 | Table 3 P0 全网格（6 方法 × 3 GNN × 5 数据集 × 1–4 层） | 按 protocol §2 P0；启动前逐项登记 | Table 3 | 未规划 |

对齐判据：protocol §8.2（已在看结果前约定：≤1.0 个百分点且在 ±2σ 内为"与论文一致"）。

## 已完成实验记录

（空——截至 2026-09-21 无已完成实验）

| 编号 | 完成日期 | 结果位置 | 复现值 | 与论文差异 | 备注 |
| --- | --- | --- | --- | --- | --- |
| E01a | 2026-09-22 | `~/forwardgnn-run/results/smoke-bp-coraML-L2-v1/CitationFull-Cora_ML/node-class/`（bp-results-…-seed10100.json + stdout） | 29.05%（JSON 原始值 0.290484，BP 为 0–1 比例；20 epochs 调试配置） | 不适用——调试配置，禁止与论文数字比较 | 高于 7 类随机 14.3%，学习确认；BP 的 best_val_epoch 字段为静态 -1 占位（选模型本身正常，EarlyStopping 内存保存/恢复最佳验证状态） |
| E01b | 2026-09-22 | `~/forwardgnn-run/results/smoke-sf-coraML-L2-v1/CitationFull-Cora_ML/node-class/`（fw-results-…-num_layers1 与 num_layers2 两个 JSON + stdout） | 单层 35.73% → 两层融合 62.44%（每层 20 epochs） | 不适用——同上 | 两层均跑满 20 epochs（train_epochs "19-19"）；SF 按层结束各写出一个结果文件 |
| E02 | 2026-09-23 | `~/forwardgnn-run/results/paper-bp-coraML-L2-v1/CitationFull-Cora_ML/node-class/`（5 个 bp-results JSON） | **86.88 ± 0.98**（逐 split：84.98 / 87.31 / 87.15 / 87.15 / 87.81；原始 0–1 值 ×100） | 论文 86.84±1.0，差 **+0.04 pp** → 与论文一致（§8.2：≤1.0 pp 且在 ±2σ 内） | 用户手动执行；run_i=split_i 0–4，seeds 10100–10112 |
| E03 | 2026-09-23 | `~/forwardgnn-run/results/paper-sf-coraML-L2-v1/CitationFull-Cora_ML/node-class/`（fw-results num_layers2 × 5） | **88.11 ± 1.22**（逐 split：86.48 / 89.65 / 88.31 / 89.15 / 86.98） | 论文 87.95±1.4，差 **+0.16 pp** → 与论文一致（§8.2） | SF > BP 排序与论文一致（+1.07 pp vs 论文 +1.11 pp）；最终值取 num_layers2 |
| E04a | 2026-09-23 | `~/forwardgnn-run/results/mem-bp-coraML-L{1..4}-v1/` + `results/resource_log.csv` | 峰值显存 **45.3 / 243.3 / 244.1 / 251.3 MiB**；各层准确率见 resource_summary.csv | 准确率：4 层全部对齐 Table 3(e)（≤0.6 pp，L1 逐位一致）；显存：BP 相对自身 L1 增长 5.4–5.6×（修正口径 19.9–20.6×），趋势同 Table 4(e) | 步骤 7；BP 增量集中在 1→2 层，之后每层 +1~7 MiB；口径差异（35 MiB 常驻输入、确定性算法、4060 vs H100）已记录 |
| E04b | 2026-09-23 | `~/forwardgnn-run/results/mem-sf-coraML-L{1..4}-v1/` + `results/resource_log.csv` | 峰值显存 **347.8 / 351.4 / 352.2 / 353.0 MiB** | 准确率：4 层全部对齐 Table 3(e)（≤0.24 pp）；显存：恒定 **1.01–1.02×**，复现论文 Figure 2a 核心主张（Table 4(e) SF 恒定 41.56 MB 同为平坦模式） | 步骤 7；SF 绝对值高于 BP 小层数场景与论文自身模式一致，省显存优势体现在增长平坦与大图 |
