# plot_memory_absolute.py — 绝对峰值显存 vs 层数（正文主图用）
# 数据源：reports/resource_summary.csv（BP/SF 1-4 层峰值显存）
# 用法（WSL conda 环境）: python plot_memory_absolute.py
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import csv  # noqa: E402
import os  # noqa: E402

CSV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "reports", "resource_summary.csv")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "reports", "figure_memory_absolute.png")

data = {}
for r in csv.DictReader(open(CSV, encoding="utf-8")):
    data.setdefault(r["method"], {})[int(r["layers"])] = float(r["peak_alloc_MiB"])

L = [1, 2, 3, 4]
series = {
    "BP": dict(vals=[data["BP"][x] for x in L], color="#C2402A", filled=True),
    "SF": dict(vals=[data["SF"][x] for x in L], color="#1F77B4", filled=False),
}

fig, ax = plt.subplots(figsize=(7.4, 4.4))
for name, s in series.items():
    ax.plot(L, s["vals"], marker="o", markersize=9, linewidth=2.2, color=s["color"],
            markerfacecolor=s["color"] if s["filled"] else "white",
            markeredgecolor=s["color"], label=name)
    for x, y in zip(L, s["vals"]):
        ax.annotate(f"{y:.1f}", (x, y), textcoords="offset points",
                    xytext=(0, 10 if name == "BP" else -18), ha="center", fontsize=9.5,
                    color=s["color"])

ax.set_xlabel("Number of layers", fontsize=12)
ax.set_ylabel("Peak GPU memory allocated (MiB)", fontsize=12)
ax.set_xticks(L)
ax.set_ylim(0, 430)
ax.grid(alpha=0.3)
ax.legend(fontsize=12, loc="center right")
fig.tight_layout()
fig.savefig(OUT, dpi=200)
print(f"PNG written: {OUT}")
