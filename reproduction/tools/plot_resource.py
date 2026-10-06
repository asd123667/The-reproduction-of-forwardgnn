# plot_resource.py — 用 resource_summary.csv 画论文 Figure 2a 风格的"显存—准确率"图
# 用法: python plot_resource.py <resource_summary.csv> [输出PNG路径]
# 输出: 默认在 CSV 同目录生成 figure_memory_vs_depth.png
# 图内文字用英文（避免 WSL 无中文字体导致乱码）；实心=BP，空心=SF（沿用论文图例约定）
import csv
import os
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

csv_path = sys.argv[1] if len(sys.argv) > 1 else "resource_summary.csv"
out_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
    os.path.dirname(os.path.abspath(csv_path)), "figure_memory_vs_depth.png")

rows = list(csv.DictReader(open(csv_path, encoding="utf-8")))
series = {}
for r in rows:
    series.setdefault(r["method"], {})[int(r["layers"])] = r

panels = [
    ("ratio_M_L_over_M_1", "Process-wide ratio M(L)/M(1)"),
    ("adjusted_ratio_minus_input", "Adjusted ratio (input-subtracted, ~paper scope)"),
]

fig, axes = plt.subplots(1, 2, figsize=(11.5, 4.6))
styles = {
    "BP": dict(color="#d62728", linestyle="-", filled=True, label="BP (filled)"),
    "SF": dict(color="#1f77b4", linestyle="--", filled=False, label="SF (open)"),
}

for ax, (col, title) in zip(axes, panels):
    for method, st in styles.items():
        data = series[method]
        Ls = sorted(data)
        xs = [float(data[L][col]) for L in Ls]
        ys = [float(data[L]["acc_mean_pct"]) for L in Ls]
        ax.plot(xs, ys, marker="o", markersize=9, linewidth=1.6,
                markerfacecolor=st["color"] if st["filled"] else "white",
                markeredgecolor=st["color"], linestyle=st["linestyle"],
                color=st["color"], label=st["label"])
        if method == "SF":
            # SF 四个点几乎重合（这正是"平坦"的证据）：只标 L1 与 L2–L4 簇
            ax.annotate("L1", (xs[0], ys[0]), textcoords="offset points",
                        xytext=(7, -14), fontsize=8.5)
            ax.annotate("L2-L4 (overlap)", (xs[-1], ys[-1]), textcoords="offset points",
                        xytext=(11, -2), fontsize=8.5, color="dimgray")
        else:
            offsets = {1: (7, 6), 2: (-32, -6), 3: (7, 8), 4: (7, -14)}
            for L, x, y in zip(Ls, xs, ys):
                ax.annotate(f"L{L}", (x, y), textcoords="offset points",
                            xytext=offsets[L], fontsize=8.5)
    ax.set_ylim(28, 94)
    ax.set_xlabel("Peak GPU memory relative to 1-layer model (x)")
    ax.set_ylabel("Test accuracy (%)")
    ax.set_title(title, fontsize=10.5)
    ax.grid(alpha=0.3)
    ax.legend(loc="center right", fontsize=9)
    ax.text(0.40, 0.42, "Better:\nless memory ($\\leftarrow$)\nhigher acc ($\\uparrow$)",
            transform=ax.transAxes, fontsize=9, color="gray", va="center")

fig.suptitle("CoraML + GCN: accuracy vs peak GPU memory (5 official splits, layers 1-4)",
             fontsize=12)
fig.text(0.5, 0.005,
         "Filled = BP, open = SF. L1-L4 mark layer counts. "
         "Adjusted ratio subtracts the constant GPU-resident input (~35 MiB) to approximate "
         "the paper's measurement scope. Data: reports/resource_summary.csv (2026-09-23).",
         ha="center", fontsize=7.5, color="dimgray")
fig.tight_layout(rect=(0, 0.05, 1, 0.94))
fig.savefig(out_path, dpi=200)
print(f"PNG written: {out_path}")
