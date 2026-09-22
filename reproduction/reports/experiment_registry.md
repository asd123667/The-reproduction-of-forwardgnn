# 实验登记表（experiment registry）

规则：每个实验启动前在此登记编号；结束后回填结果位置与状态。结果目录为 `runs/<编号>/`。
当前状态：**尚无任何实验运行**，E01–E03 为预登记。

## 预登记实验

| 编号 | 对应步骤 | 实验 | 协议要点 | 论文对照 | 状态 |
| --- | --- | --- | --- | --- | --- |
| E01a | v3 步骤 4 短跑 | **BP**-GCN，CoraML，2 层，1 run，20 epochs，`--exp-setting smoke-bp-coraML-L2-v1` | 先跑 BP；验收 = 进程正常退出、无 NaN/Inf、stdout + 结果 JSON 存在（官方代码不落盘 best.pt，不要求模型文件） | 无（运行复现） | ✅ 2026-09-22 |
| E01b | v3 步骤 4 短跑 | **SF**-GCN，CoraML，2 层，1 run，20 epochs（每层 20），`--exp-setting smoke-sf-coraML-L2-v1` | 同上，且两层均执行局部训练 | 无（运行复现） | ✅ 2026-09-22 |
| E02 | 步骤 5 BP 基线 | BP-GCN，CoraML，2 层，论文协议，5 runs | `nodeclass-bp.sh` 收敛到单数据集单层；官方 datasplits | Table 3(e) 2 层：86.84±1.0 | 未开始 |
| E03 | 步骤 6 正式对照 | SF-GCN，CoraML，2 层，论文协议，5 runs | 与 E02 同划分、同预算 | Table 3(e) 2 层：87.95±1.4 | 未开始 |
| E04+ | 步骤 6 扩展 | Table 3 P0 全网格（6 方法 × 3 GNN × 5 数据集 × 1–4 层） | 按 protocol §2 P0；启动前逐项登记 | Table 3 | 未规划 |

对齐判据：protocol §8.2（已在看结果前约定：≤1.0 个百分点且在 ±2σ 内为"与论文一致"）。

## 已完成实验记录

（空——截至 2026-09-21 无已完成实验）

| 编号 | 完成日期 | 结果位置 | 复现值 | 与论文差异 | 备注 |
| --- | --- | --- | --- | --- | --- |
| E01a | 2026-09-22 | `~/forwardgnn-run/results/smoke-bp-coraML-L2-v1/CitationFull-Cora_ML/node-class/`（bp-results-…-seed10100.json + stdout） | 29.05%（JSON 原始值 0.290484，BP 为 0–1 比例；20 epochs 调试配置） | 不适用——调试配置，禁止与论文数字比较 | 高于 7 类随机 14.3%，学习确认；BP 的 best_val_epoch 字段为静态 -1 占位（选模型本身正常，EarlyStopping 内存保存/恢复最佳验证状态） |
| E01b | 2026-09-22 | `~/forwardgnn-run/results/smoke-sf-coraML-L2-v1/CitationFull-Cora_ML/node-class/`（fw-results-…-num_layers1 与 num_layers2 两个 JSON + stdout） | 单层 35.73% → 两层融合 62.44%（每层 20 epochs） | 不适用——同上 | 两层均跑满 20 epochs（train_epochs "19-19"）；SF 按层结束各写出一个结果文件 |
