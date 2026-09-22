# 变更记录（CHANGELOG）

格式：每条记录包含日期、类别、内容、影响范围。倒序排列。

---

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
