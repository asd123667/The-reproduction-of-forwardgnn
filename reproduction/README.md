# reproduction — ForwardGNN 复现工作目录

复现对象：**Forward Learning of Graph Neural Networks**（ForwardGNN, ICLR 2024）。
当前状态：**步骤 1（确定复现对象、建立实验记录）已完成（2026-09-21）**；步骤 2（环境与数据）未开始。

## 原始材料（只读快照，不做任何修改）

| 材料 | 位置 |
| --- | --- |
| 论文 PDF | `../forwardgnn-main/ICLR-2024-forward-learning-of-graph-neural-networks-Paper-Conference.pdf` |
| 官方代码（facebookresearch/forwardgnn 快照） | `../forwardgnn-main/the-source-code-of-forwardgnn-main/` |
| 快照校验清单 | `reports/source_snapshot.sha256`（46 个代码文件 + 论文 PDF，对应 git 提交 `b702c87`） |
| 总体复现计划（验收框架来源） | `../forwardgnn-main/图神经网络无反向传播联邦学习_复现计划.md` |
| 已作废的旧计划（LR 路线，仅留档） | `../forwardgnn-main/复现计划_旧版LR路线_已作废_20260921.md` |

## 本目录结构

```text
reproduction/
  README.md                  # 本文件
  CHANGELOG.md               # 代码、协议、实验变更记录
  configs/                   # 实验启动配置与脚本副本（步骤 2 起填充）
  data/                      # 数据与划分相关记录（数据本体由官方代码按其规则下载）
  checks/                    # 关键行为核对脚本与记录（步骤 3 起填充）
  tools/                     # 可复用测量与汇总工具（对应 v3 计划 §6.2）
    mem_wrap.py              #   独立进程运行官方训练脚本并记录峰值显存 → results/resource_log.csv
    summarize_resources.py   #   汇总显存+各深度准确率 → results/resource_summary.csv 与终端表格
  runs/                      # 按实验编号保存日志、模型与结果（步骤 4 起填充）
  reports/
    protocol.md              # 复现协议（唯一有效协议）
    experiment_registry.md   # 实验登记表
    source_snapshot.sha256   # 原始代码快照校验值
```

## 如何使用

1. 复现哪个实验、和论文哪个数字比、用什么协议：看 `reports/protocol.md`。
2. 每次启动/修改实验前：在 `reports/experiment_registry.md` 登记。
3. 任何代码或协议变更：记入 `CHANGELOG.md`，并注明是否影响已登记实验。
4. 官方代码永远不在原位修改；需要改动时复制到本目录 `configs/` 或后续 `src/` 中并在 CHANGELOG 说明。

## 校验快照方法

```bash
cd ../forwardgnn-main/the-source-code-of-forwardgnn-main
grep -v 'PDF' ../../reproduction/reports/source_snapshot.sha256 | sha256sum -c -
# 论文 PDF 单独校验：
sha256sum -c ../../reproduction/reports/source_snapshot.sha256 2>/dev/null | grep PDF
```
