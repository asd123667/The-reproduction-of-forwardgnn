# summarize_resources.py — 汇总 mem_wrap.py 的显存记录 + 各深度准确率，输出对照表
# 对应 v3 计划 §6.2 tools/summarize_results.py 的资源部分。
#
# 用法（在 WSL 里）:
#   python3 summarize_resources.py            # 默认读 <脚本上一级>/results（部署在 src/ 时即正确）
#   python3 summarize_resources.py <results_root>   # 显式指定结果根目录
# 输出: 终端对照表 + <results_root>/resource_summary.csv
#
# 口径说明:
#   - M(L)/M(1): 进程峰值显存比例（我们的统一口径，含常驻 GPU 输入数据）
#   - 修正比例: 扣除常驻 GPU 输入的近似大小后重算，用于与论文 Table 4 的口径近似对齐
#     （CoraML + GCN + 双向增强 ≈ 35 MiB；换数据集或骨干必须重算此常数！）
#   - acc 的 std 用总体标准差（pstdev），与官方汇总 np.std 的口径一致
import csv
import glob
import json
import os
import sys
import statistics as st

root = sys.argv[1] if len(sys.argv) > 1 else os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "results"))
DATA_MB = {"bp": 34.8, "sf": 35.0}

mem = {}
for r in csv.DictReader(open(os.path.join(root, "resource_log.csv"))):
    if r["status"] == "ok":
        mem[r["setting"]] = float(r["peak_alloc_MiB"])

rows = []
print(f"{'方法':<4}{'层':>2} {'n':>2} {'acc mean±std':>16} {'peak_MiB':>9} {'M(L)/M(1)':>10} {'修正比例':>9}")
for m in ("bp", "sf"):
    base = None
    for L in (1, 2, 3, 4):
        s = f"mem-{m}-coraML-L{L}-v1"
        node_dir = os.path.join(root, s, "CitationFull-Cora_ML", "node-class")
        if m == "bp":
            fs = sorted(glob.glob(os.path.join(node_dir, "bp-results-*.json")))
        else:
            fs = sorted(glob.glob(os.path.join(node_dir, f"fw-results-*num_layers{L}-*.json")))
        vals = [json.load(open(f))["perf"] for f in fs]
        vals = [v * 100 if m == "bp" else v for v in vals]  # BP 0-1 → 百分数；SF 原生百分数
        peak = mem.get(s, float("nan"))
        if L == 1:
            base = peak
        ratio = peak / base if base else float("nan")
        adj = (peak - DATA_MB[m]) / (base - DATA_MB[m]) if base and base > DATA_MB[m] else float("nan")
        mean = st.mean(vals) if vals else float("nan")
        std = st.pstdev(vals) if len(vals) > 1 else 0.0
        rows.append({"method": m.upper(), "layers": L, "n_runs": len(vals),
                     "acc_mean_pct": round(mean, 2), "acc_std_pct": round(std, 2),
                     "peak_alloc_MiB": peak, "ratio_M_L_over_M_1": round(ratio, 3),
                     "adjusted_ratio_minus_input": round(adj, 3)})
        print(f"{m.upper():<4}{L:>3} {len(vals):>2} {mean:>8.2f}±{std:<5.2f} "
              f"{peak:>9.1f} {ratio:>9.2f}x {adj:>8.2f}x")

if rows:
    out = os.path.join(root, "resource_summary.csv")
    with open(out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"\n已写出: {out}")
else:
    print("没有读到任何结果——确认 mem_wrap.py 的实验已经跑完、resource_log.csv 存在。")
