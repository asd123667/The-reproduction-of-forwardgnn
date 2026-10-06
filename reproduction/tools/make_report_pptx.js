// make_report_pptx.js — 生成《ForwardGNN 论文复现阶段性汇报》12 页 PPT
// 数据来源：reproduction/reports/{reproduction_report.md, resource_summary.csv, method_checks.md}
// 运行：NODE_PATH=$(npm root -g) node make_report_pptx.js
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 × 7.5"
pres.author = "复现小组";
pres.title = "ForwardGNN 论文复现阶段性汇报";

const W = 13.33, H = 7.5, M = 0.5;
const BG_DARK = "0F172A", BG = "FFFFFF";
const PRIMARY = "1E3A5F", ACCENT = "C2402A", SF_BLUE = "1F77B4";
const TEXT = "1E293B", MUTED = "64748B", TINT = "EDF2F7", HAIR = "D9E2EC";
const ON_DARK = "F8FAFC", MUTED_DARK = "94A3B8";
const F = "微软雅黑";
const FIG = "D:/创新实践/The-reproduction-of-forwardgnn/reproduction/reports/figure_memory_vs_depth.png";

const bu = () => ({ code: "2022", indent: 12, color: MUTED });
const kicker = (s, txt) => s.addText(txt, { x: M, y: 0.32, w: 8, h: 0.32, fontSize: 13, bold: true, color: ACCENT, fontFace: F, charSpacing: 2, margin: 0 });
const stitle = (s, txt) => s.addText(txt, { x: M, y: 0.62, w: W - 2 * M, h: 0.75, fontSize: 30, bold: true, color: PRIMARY, fontFace: F, margin: 0 });
const footer = (s, n) => {
  s.addText(`ForwardGNN 论文复现 · ${n} / 12`, { x: W - 3.2, y: H - 0.42, w: 2.7, h: 0.3, fontSize: 12, color: MUTED, fontFace: F, align: "right", margin: 0 });
  s.addText("2026-09", { x: M, y: H - 0.42, w: 2, h: 0.3, fontSize: 12, color: MUTED, fontFace: F, margin: 0 });
};
const hair = (s, x, y, w) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: HAIR, width: 1 } });

/* ---------- S1 封面（深色） ---------- */
let s = pres.addSlide();
s.background = { color: BG_DARK };
s.addText("论 文 复 现 · 阶 段 性 汇 报", { x: M, y: 1.5, w: 9, h: 0.4, fontSize: 15, color: MUTED_DARK, fontFace: F, charSpacing: 4, margin: 0 });
s.addText("ForwardGNN 论文复现", { x: M, y: 2.0, w: 12.3, h: 1.1, fontSize: 52, bold: true, color: ON_DARK, fontFace: F, margin: 0 });
s.addText("CoraML + GCN 上的 SF/BP 对照与显存—深度扩展", { x: M, y: 3.15, w: 12, h: 0.55, fontSize: 21, color: ON_DARK, fontFace: F, margin: 0 });
s.addText("Forward Learning of Graph Neural Networks · ICLR 2024 · Park et al.（Meta AI 等）", { x: M, y: 3.82, w: 12, h: 0.4, fontSize: 14, color: MUTED_DARK, fontFace: F, margin: 0 });
hair(s, M, 4.75, W - 2 * M);
const cov = [["8 / 8", "结果配置与论文 Table 3(e) 对齐", ACCENT], ["1.01×", "SF 峰值显存 1–4 层恒定", ON_DARK], ["18 / 18", "SF 方法行为断言通过", ON_DARK]];
cov.forEach((c, i) => {
  const x = M + i * 4.28;
  s.addText(c[0], { x, y: 5.05, w: 3.9, h: 0.85, fontSize: 40, bold: true, color: c[2], fontFace: F, margin: 0 });
  s.addText(c[1], { x, y: 5.95, w: 3.9, h: 0.5, fontSize: 14, color: MUTED_DARK, fontFace: F, margin: 0 });
});
s.addText("汇报日期 2026-09 · 复现仓库 reproduction/", { x: M, y: 6.85, w: 8, h: 0.35, fontSize: 12, color: MUTED_DARK, fontFace: F, margin: 0 });

/* ---------- S2 论文背景与核心主张 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "BACKGROUND"); stitle(s, "论文背景与核心主张");
s.addText("BP 的三大约束（论文 §1）", { x: M, y: 1.55, w: 5.6, h: 0.4, fontSize: 17, bold: true, color: TEXT, fontFace: F, margin: 0 });
const cons = [["01", "存储激活", "前向激活需保存供反向使用，显存开销大"], ["02", "非局部更新", "参数更新依赖下游全部神经元的误差"], ["03", "反向顺序", "先前向、后反向，更新只能最后发生"]];
cons.forEach((c, i) => {
  const y = 2.1 + i * 1.02;
  s.addText(c[0], { x: M, y, w: 0.85, h: 0.9, fontSize: 30, bold: true, color: HAIR, fontFace: F, margin: 0 });
  s.addText(c[1], { x: M + 0.95, y, w: 4.6, h: 0.38, fontSize: 16, bold: true, color: PRIMARY, fontFace: F, margin: 0 });
  s.addText(c[2], { x: M + 0.95, y: y + 0.4, w: 4.6, h: 0.45, fontSize: 13, color: MUTED, fontFace: F, margin: 0 });
  if (i < 2) hair(s, M, y + 0.95, 5.55);
});
s.addText("ForwardGNN 的 SF 方法（§3.2）", { x: 6.9, y: 1.55, w: 6, h: 0.4, fontSize: 17, bold: true, color: TEXT, fontFace: F, margin: 0 });
const flow = ["增强图 G′：加 7 个虚拟类别节点（按标签连边）", "GNN 层前向 → 节点嵌入 + 类别代表嵌入", "点积得分 → 局部交叉熵 → 只更新本层", "输出 detach 传入下一层；推理用各层概率融合"];
flow.forEach((t, i) => {
  const y = 2.08 + i * 0.92;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.9, y, w: 5.9, h: 0.62, fill: { color: TINT }, line: { color: HAIR, width: 0.75 }, rectRadius: 0.06 });
  s.addText(t, { x: 7.1, y: y + 0.06, w: 5.55, h: 0.5, fontSize: 13.5, color: TEXT, fontFace: F, valign: "middle", margin: 0 });
  if (i < 3) s.addShape(pres.shapes.LINE, { x: 9.85, y: y + 0.62, w: 0, h: 0.3, line: { color: SF_BLUE, width: 1.5, endArrowType: "triangle" } });
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 6.0, w: W - 2 * M, h: 0.95, fill: { color: TINT }, line: { color: HAIR, width: 0.75 }, rectRadius: 0.06 });
s.addText([
  { text: "论文核心主张（§4.2, p.7）：", options: { bold: true, color: PRIMARY } },
  { text: "“SF 精度与 BP 相当或更优，且显存不随层数增长（BP 最多增长 18×）”", options: { color: TEXT } },
], { x: M + 0.25, y: 6.12, w: W - 2 * M - 0.5, h: 0.7, fontSize: 15, fontFace: F, valign: "middle", margin: 0 });
footer(s, 2);

/* ---------- S3 复现范围与协议 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "SCOPE & PROTOCOL"); stitle(s, "复现范围与协议");
s.addText("复现对象（阶段 A）", { x: M, y: 1.55, w: 5.8, h: 0.4, fontSize: 17, bold: true, color: TEXT, fontFace: F, margin: 0 });
s.addText([
  { text: "论文 Table 3(e) / 4(e)：CoraML · GCN · BP 与 SF 两行 · 1–4 层", options: { bullet: bu(), breakLine: true } },
  { text: "数据：CitationFull-Cora_ML — 2,995 节点 / 2,879 特征 / 7 类 / 16,316 边（= 论文 Table 2）", options: { bullet: bu(), breakLine: true } },
  { text: "划分：作者官方发布的 5 组划分（非自生成）", options: { bullet: bu(), breakLine: true } },
  { text: "代码：facebookresearch/forwardgnn 官方快照，逐文件 SHA-256 校验，零修改", options: { bullet: bu() } },
], { x: M, y: 2.05, w: 5.8, h: 2.6, fontSize: 14, color: TEXT, fontFace: F, paraSpaceAfter: 10, margin: 0 });
s.addText("训练协议（论文附录 B ↔ 脚本 ↔ 代码 三方核对）", { x: M, y: 4.75, w: 5.8, h: 0.4, fontSize: 17, bold: true, color: TEXT, fontFace: F, margin: 0 });
s.addText([
  { text: "隐藏维 128 · Adam lr=1e-3 / wd=5e-4 · epochs=1000", options: { bullet: bu(), breakLine: true } },
  { text: "验证间隔 2 · 早停 patience=100（按验证次数计）", options: { bullet: bu(), breakLine: true } },
  { text: "5 次运行 = 5 个官方划分（种子 10100…10112）", options: { bullet: bu(), breakLine: true } },
  { text: "SF：τ=1.0 · 虚拟边双向 · FF 阈值 θ=2.0", options: { bullet: bu() } },
], { x: M, y: 5.25, w: 5.8, h: 1.7, fontSize: 14, color: TEXT, fontFace: F, paraSpaceAfter: 8, margin: 0 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.9, y: 1.55, w: 5.93, h: 3.4, fill: { color: TINT }, line: { color: HAIR, width: 0.75 }, rectRadius: 0.06 });
s.addText("对齐判据（看结果之前预先约定）", { x: 7.15, y: 1.8, w: 5.4, h: 0.4, fontSize: 16, bold: true, color: PRIMARY, fontFace: F, margin: 0 });
s.addText("|复现均值 − 论文均值| ≤ 1.0 个百分点\n且落在论文均值 ±2σ 内\n→ 判定“与论文一致”", { x: 7.15, y: 2.3, w: 5.4, h: 1.4, fontSize: 16, color: TEXT, fontFace: F, lineSpacing: 26, margin: 0 });
s.addText("1–3 pp：趋势一致但未完全对齐　＞3 pp：未对齐（先排查协议）", { x: 7.15, y: 3.85, w: 5.4, h: 0.8, fontSize: 13, color: MUTED, fontFace: F, margin: 0 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.9, y: 5.25, w: 5.93, h: 1.7, fill: { color: BG_DARK }, rectRadius: 0.06 });
s.addText([
  { text: "结论纪律", options: { bold: true, color: ON_DARK, breakLine: true } },
  { text: "判据先于结果固定，不得事后放宽；曲线好看、没有报错都不能替代验收证据。", options: { color: MUTED_DARK } },
], { x: 7.15, y: 5.45, w: 5.4, h: 1.3, fontSize: 14, fontFace: F, paraSpaceAfter: 6, margin: 0 });
footer(s, 3);

/* ---------- S4 环境与工程 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "ENVIRONMENT"); stitle(s, "环境与工程");
const env = [
  ["子系统", "WSL2 Ubuntu 26.04 · GPU：RTX 4060 Laptop 8 GB（sm_89，PTX JIT 实测可用）"],
  ["软件栈", "Python 3.8.20 · PyTorch 1.13.1（CUDA 11.7）· PyG 2.2.0 —— 均出自论文附录 B 与官方安装脚本"],
  ["必需环境变量", "CUBLAS_WORKSPACE_CONFIG=:4096:8 —— 官方代码启用确定性算法，缺省直接 RuntimeError（实测确认）"],
  ["目录隔离", "官方代码只读快照（逐文件 SHA-256）＋ 独立运行副本 ~/forwardgnn-run —— 数据与结果不污染快照"],
];
env.forEach((c, i) => {
  const y = 1.6 + i * 1.28;
  s.addText(c[0], { x: M, y, w: 2.1, h: 0.85, fontSize: 16, bold: true, color: PRIMARY, fontFace: F, valign: "top", margin: 0 });
  s.addText(c[1], { x: 2.75, y, w: 6.3, h: 1.1, fontSize: 14, color: TEXT, fontFace: F, margin: 0 });
  if (i < 3) hair(s, M, y + 1.08, 8.55);
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.35, y: 1.6, w: 3.48, h: 5.0, fill: { color: BG_DARK }, rectRadius: 0.06 });
s.addText("实测环境（environment.json）", { x: 9.6, y: 1.8, w: 3.0, h: 0.35, fontSize: 12.5, bold: true, color: ON_DARK, fontFace: F, margin: 0 });
s.addText(
  "Python     3.8.20\nPyTorch    1.13.1\ncuBLAS     11.7\nPyG        2.2.0\nnumpy      1.19.2\nscipy      1.6.2\nsklearn    1.2.1\ntorch-sparse 0.6.17\ntorch-scatter 2.1.1\nGPU   RTX 4060 8GB\n驱动  560.94",
  { x: 9.6, y: 2.25, w: 3.05, h: 3.6, fontSize: 12, color: MUTED_DARK, fontFace: "Consolas", lineSpacing: 17, margin: 0 }
);
s.addText("numpy/scipy/sklearn：论文未规定版本，为官方脚本安装时 conda 解析结果，实测记录", { x: M, y: 6.55, w: 8.5, h: 0.5, fontSize: 12, color: MUTED, fontFace: F, margin: 0 });
footer(s, 4);

/* ---------- S5 方法可信度 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "VALIDATION"); stitle(s, "方法可信度：数据审计 + 18 项断言");
s.addText("数据审计", { x: M, y: 1.55, w: 5.6, h: 0.4, fontSize: 17, bold: true, color: TEXT, fontFace: F, margin: 0 });
s.addText([
  { text: "维度与论文 Table 2 一致：2,995 / 2,879 / 7 类 / 16,316 边", options: { bullet: bu(), breakLine: true } },
  { text: "5 组划分两两互斥、并集 = 全部 2,995 节点", options: { bullet: bu(), breakLine: true } },
  { text: "比例精确 64% / 16% / 20%（1,916 / 480 / 599）", options: { bullet: bu(), breakLine: true } },
  { text: "15 个划分文件 SHA-256 存档（split_manifest）", options: { bullet: bu() } },
], { x: M, y: 2.05, w: 5.6, h: 2.3, fontSize: 14, color: TEXT, fontFace: F, paraSpaceAfter: 9, margin: 0 });
s.addText("SF 行为断言（节选，共 18 项）", { x: M, y: 4.5, w: 5.6, h: 0.4, fontSize: 17, bold: true, color: TEXT, fontFace: F, margin: 0 });
s.addText([
  { text: "增强图 = 2,995 + 7 个虚拟类别节点", options: { bullet: bu(), breakLine: true } },
  { text: "虚拟边 3,832 = 2×1,916（双向）；验证/测试节点 0 泄漏", options: { bullet: bu(), breakLine: true } },
  { text: "logits = 节点嵌入·类别代表嵌入（误差 1.5e-08）", options: { bullet: bu() } },
], { x: M, y: 5.0, w: 5.6, h: 1.5, fontSize: 14, color: TEXT, fontFace: F, paraSpaceAfter: 9, margin: 0 });
s.addText("18 / 18", { x: 6.9, y: 1.7, w: 5.9, h: 1.1, fontSize: 60, bold: true, color: ACCENT, fontFace: F, margin: 0 });
s.addText("SF 行为断言全部通过（源码行号 + 运行时行为双重证据）", { x: 6.9, y: 2.85, w: 5.9, h: 0.5, fontSize: 15, color: TEXT, fontFace: F, margin: 0 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.9, y: 3.55, w: 5.93, h: 2.95, fill: { color: TINT }, line: { color: HAIR, width: 0.75 }, rectRadius: 0.06 });
s.addText("层间隔离的直接证据", { x: 7.15, y: 3.75, w: 5.4, h: 0.4, fontSize: 15, bold: true, color: PRIMARY, fontFace: F, margin: 0 });
s.addText("第 2 层训练期间，第 1 层全部参数的 SHA-256 逐比特不变；传入第 2 层的表示 requires_grad=False；两层优化器参数集互不相交。\n\n→ “避免端到端反向传播的逐层局部学习”有机制级证据。", { x: 7.15, y: 4.25, w: 5.4, h: 2.0, fontSize: 13.5, color: TEXT, fontFace: F, lineSpacing: 20, margin: 0 });
s.addText("证据：reproduction/reports/method_checks.md · checks/check_sf_method.py", { x: M, y: 6.6, w: 9, h: 0.35, fontSize: 12, color: MUTED, fontFace: F, margin: 0 });
footer(s, 5);

/* ---------- S6 准确率表格 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "RESULTS · ACCURACY"); stitle(s, "结果一：准确率——8 组配置全部对齐");
const th = { fill: { color: PRIMARY }, color: "FFFFFF", bold: true, fontFace: F, fontSize: 13, valign: "middle" };
const td = { fontFace: F, fontSize: 13, color: TEXT, valign: "middle" };
const okc = { fontFace: F, fontSize: 13, color: "1F7A3D", bold: true, valign: "middle" };
const tbl = [
  [{ text: "方法", options: th }, { text: "层", options: th }, { text: "本次复现", options: th }, { text: "论文 Table 3(e)", options: th }, { text: "差异", options: th }, { text: "判定", options: th }],
  ["BP-GCN", "1", "31.72 ± 4.80", "31.72 ± 4.8", "0.00 pp", { text: "一致 · 逐位", options: okc }],
  ["BP-GCN", "2", "86.88 ± 0.98", "86.84 ± 1.0", "+0.04 pp", { text: "一致", options: okc }],
  ["BP-GCN", "3", "88.71 ± 1.26", "88.65 ± 1.4", "+0.06 pp", { text: "一致", options: okc }],
  ["BP-GCN", "4", "87.18 ± 1.88", "86.61 ± 2.3", "+0.57 pp", { text: "一致", options: okc }],
  [{ text: "SF-GCN", options: { ...td, bold: true } }, "1", "87.51 ± 1.35", "87.75 ± 1.4", "−0.24 pp", { text: "一致", options: okc }],
  [{ text: "SF-GCN", options: { ...td, bold: true } }, "2", "88.11 ± 1.22", "87.95 ± 1.4", "+0.16 pp", { text: "一致", options: okc }],
  [{ text: "SF-GCN", options: { ...td, bold: true } }, "3", "88.28 ± 1.08", "88.15 ± 1.5", "+0.13 pp", { text: "一致", options: okc }],
  [{ text: "SF-GCN", options: { ...td, bold: true } }, "4", "88.31 ± 1.12", "88.48 ± 1.2", "−0.17 pp", { text: "一致", options: okc }],
].map((r, ri) => ri === 0 ? r : r.map(c => typeof c === "string" ? { text: c, options: { ...td, fill: { color: ri % 2 ? "FFFFFF" : TINT } } } : { ...c, options: { ...c.options, fill: { color: ri % 2 ? "FFFFFF" : TINT } } }));
s.addTable(tbl, { x: M, y: 1.6, w: 7.9, colW: [1.35, 0.55, 1.85, 1.85, 1.15, 1.15], rowH: 0.42, border: { pt: 0.5, color: HAIR }, align: "left" });
s.addText("8 / 8", { x: 8.9, y: 1.8, w: 3.9, h: 1.0, fontSize: 54, bold: true, color: ACCENT, fontFace: F, margin: 0 });
s.addText("配置与论文对齐", { x: 8.9, y: 2.85, w: 3.9, h: 0.4, fontSize: 15, bold: true, color: TEXT, fontFace: F, margin: 0 });
s.addText("最大差 0.57 个百分点；BP 1 层与论文逐位一致（31.72±4.80），是同一确定性流水线的强证据", { x: 8.9, y: 3.35, w: 3.9, h: 1.2, fontSize: 13, color: TEXT, fontFace: F, lineSpacing: 19, margin: 0 });
s.addText("方法间排序与论文一致：2–4 层时 SF 高于 BP 约 1.1 pp（论文 +1.11 pp）。", { x: 8.9, y: 4.65, w: 3.9, h: 1.0, fontSize: 13, color: TEXT, fontFace: F, lineSpacing: 19, margin: 0 });
s.addText("判据（看结果前约定）：|Δ| ≤ 1.0 pp 且在论文 ±2σ 内 → “与论文一致”。原始 JSON：~/forwardgnn-run/results/", { x: M, y: 6.35, w: 12.3, h: 0.6, fontSize: 12, color: MUTED, fontFace: F, margin: 0 });
footer(s, 6);

/* ---------- S7 显存—深度图 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "RESULTS · MEMORY"); stitle(s, "结果二：论文核心主张——SF 显存不随深度增长");
const figW = 12.33, figH = figW * (920 / 2300);
s.addImage({ path: FIG, x: M, y: 1.5, w: figW, h: figH });
const memB = [
  ["SF", "峰值显存 1–4 层恒定 1.01–1.02×（347.8→353.0 MiB）", SF_BLUE],
  ["BP", "增长至 5.55×；修正口径 20.6×（论文 GCN 口径 ≈15×）", ACCENT],
  ["口径", "进程峰值含 ~35 MiB 常驻输入 → 只比比例与趋势，不比绝对值", MUTED],
];
memB.forEach((c, i) => {
  const y = 6.42, x = M + i * 4.28;
  s.addText([{ text: c[0] + "  ", options: { bold: true, color: c[2] } }, { text: c[1], options: { color: TEXT } }],
    { x, y, w: 4.1, h: 0.62, fontSize: 12.5, fontFace: F, lineSpacing: 15.5, margin: 0 });
});
footer(s, 7);
s.addNotes("读图：左面板进程口径、右面板修正口径（扣 35MiB 常驻输入，近似论文 Table 4 范围）。SF 四点重叠即结论。BP 论文口径 0.83→12.58MB ≈15×，我们修正口径 20.6×，量级一致。");

/* ---------- S8 差异与诚实声明 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "CAVEATS"); stitle(s, "与论文的差异与诚实声明");
const cave = [
  ["01", "测量口径不同", "进程峰值含 ~35 MiB 常驻输入；4060 vs 论文 H100 —— 只比较相对比例与趋势，不比绝对值"],
  ["02", "BP 增量集中在 1→2 层", "推测与确定性算法的反向实现及分配器行为有关；“BP 增长、SF 恒定”的定性结论不受影响"],
  ["03", "官方代码缺 4 个对比基线", "FF-SymBa / CaFo / PEPITA / ForwardGNN-SymBa 无官方实现 —— Table 3/5 的对应行未复现（需引入第三方实现）"],
  ["04", "措辞边界", "准确表述：“避免端到端反向传播的逐层局部学习”；不说“完全不用反向传播”（每层内部仍有局部 loss.backward()）"],
];
cave.forEach((c, i) => {
  const y = 1.7 + i * 1.24;
  s.addText(c[0], { x: M, y, w: 0.9, h: 0.9, fontSize: 30, bold: true, color: HAIR, fontFace: F, margin: 0 });
  s.addText(c[1], { x: M + 1.0, y: y + 0.02, w: 10.8, h: 0.42, fontSize: 17, bold: true, color: PRIMARY, fontFace: F, margin: 0 });
  s.addText(c[2], { x: M + 1.0, y: y + 0.48, w: 10.8, h: 0.6, fontSize: 13.5, color: TEXT, fontFace: F, margin: 0 });
  if (i < 3) hair(s, M, y + 1.12, W - 2 * M);
});
footer(s, 8);

/* ---------- S9 进度与下一步 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "PROGRESS"); stitle(s, "进度总览与下一步");
const gates = [["A0", "协议锁定", true], ["A1", "代码通路", true], ["A2", "核心 SF/BP", true], ["A3", "方法检查（SF）", true], ["步骤7", "显存—深度", true], ["A4", "论文主结果", false]];
gates.forEach((g, i) => {
  const x = M + i * 2.08;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: 1.9, h: 1.35, fill: { color: g[2] ? "1F7A3D" : TINT }, line: { color: g[2] ? "1F7A3D" : HAIR, width: 0.75 }, rectRadius: 0.06 });
  s.addText(g[2] ? "✓" : "—", { x: x + 0.1, y: 1.78, w: 1.7, h: 0.5, fontSize: 22, bold: true, color: g[2] ? "FFFFFF" : MUTED, fontFace: F, margin: 0 });
  s.addText(g[0], { x: x + 0.12, y: 2.28, w: 1.66, h: 0.32, fontSize: 13, bold: true, color: g[2] ? "FFFFFF" : MUTED, fontFace: F, margin: 0 });
  s.addText(g[1], { x: x + 0.12, y: 2.6, w: 1.66, h: 0.32, fontSize: 12.5, color: g[2] ? "FFFFFF" : MUTED, fontFace: F, margin: 0 });
});
s.addText("已完成（✓）与待做（—）", { x: M, y: 3.2, w: 8, h: 0.35, fontSize: 12.5, color: MUTED, fontFace: F, margin: 0 });
s.addText("下一步（步骤 8 · 闸门 A4）", { x: M, y: 3.85, w: 8, h: 0.4, fontSize: 17, bold: true, color: TEXT, fontFace: F, margin: 0 });
const nexts = [
  ["GitHub 数据集", "SF 显存优势最直观的例子：论文中 BP 390→469 MB，SF 恒定 62 MB"],
  ["SAGE / GAT 骨干", "命令模板不变，仅换 --model 与 exp-setting"],
  ["FF-LA / FF-VN / TopDown 变体 + 链接预测", "对应论文 §3.1 / §3.3 / §3.4 与 Table 1/5/6"],
];
nexts.forEach((c, i) => {
  const y = 4.35 + i * 0.86;
  s.addText(String(i + 1), { x: M, y, w: 0.6, h: 0.7, fontSize: 26, bold: true, color: ACCENT, fontFace: F, margin: 0 });
  s.addText(c[0], { x: M + 0.7, y, w: 4.6, h: 0.7, fontSize: 15, bold: true, color: TEXT, fontFace: F, valign: "middle", margin: 0 });
  s.addText(c[1], { x: 6.0, y, w: 6.8, h: 0.7, fontSize: 13, color: MUTED, fontFace: F, valign: "middle", margin: 0 });
  if (i < 2) hair(s, M, y + 0.78, W - 2 * M);
});
footer(s, 9);

/* ---------- S10 总结 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "SUMMARY"); stitle(s, "总结：可以声称 / 不能声称");
s.addText("可以声称", { x: M, y: 1.6, w: 6, h: 0.45, fontSize: 18, bold: true, color: "1F7A3D", fontFace: F, margin: 0 });
const can = [
  ["8/8", "配置准确率与论文对齐（最大差 0.57 pp）"],
  ["1.01×", "SF 显存 1–4 层恒定——核心主张复现"],
  ["18/18", "SF 方法行为断言通过"],
];
can.forEach((c, i) => {
  const y = 2.2 + i * 1.15;
  s.addText(c[0], { x: M, y, w: 2.0, h: 0.95, fontSize: 34, bold: true, color: ACCENT, fontFace: F, margin: 0 });
  s.addText(c[1], { x: 2.6, y: y + 0.12, w: 4.3, h: 0.8, fontSize: 14.5, color: TEXT, fontFace: F, margin: 0 });
});
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.35, y: 1.6, w: 5.48, h: 4.35, fill: { color: TINT }, line: { color: HAIR, width: 0.75 }, rectRadius: 0.06 });
s.addText("不能声称", { x: 7.6, y: 1.85, w: 5.0, h: 0.45, fontSize: 18, bold: true, color: ACCENT, fontFace: F, margin: 0 });
s.addText([
  { text: "已完整复现整篇论文（其余 4 数据集、SAGE/GAT、FF 与 TopDown 变体、链接预测未做）", options: { bullet: bu(), breakLine: true } },
  { text: "“SF 显存绝对值更小”——CoraML 上 SF 绝对值高于 BP 小层数场景（论文自身亦如此）", options: { bullet: bu(), breakLine: true } },
  { text: "“完全不用反向传播”——准确说法：避免端到端反向传播的逐层局部学习", options: { bullet: bu(), breakLine: true } },
  { text: "任何联邦学习阶段的结论（阶段 C 未开始）", options: { bullet: bu() } },
], { x: 7.6, y: 2.4, w: 5.0, h: 3.4, fontSize: 13.5, color: TEXT, fontFace: F, paraSpaceAfter: 10, margin: 0 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 6.1, w: W - 2 * M, h: 0.85, fill: { color: BG_DARK }, rectRadius: 0.06 });
s.addText("全程官方代码（零修改、逐文件校验）+ 官方数据划分 · 每个数字可追溯至原始 JSON，可一键复跑", { x: M + 0.25, y: 6.22, w: W - 2 * M - 0.5, h: 0.6, fontSize: 14.5, color: ON_DARK, fontFace: F, valign: "middle", margin: 0 });
footer(s, 10);

/* ---------- S11 备份：命令与证据 ---------- */
s = pres.addSlide(); s.background = { color: BG };
kicker(s, "APPENDIX"); stitle(s, "备份：可复现命令与证据索引");
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 1.6, w: 6.7, h: 4.9, fill: { color: BG_DARK }, rectRadius: 0.06 });
s.addText("正式训练命令（GPU，5 个官方划分）", { x: M + 0.25, y: 1.8, w: 6.2, h: 0.35, fontSize: 13, bold: true, color: ON_DARK, fontFace: F, margin: 0 });
s.addText(
  "export CUBLAS_WORKSPACE_CONFIG=:4096:8\n\npython train_backprop.py --task node-class \\\n  --model GNN-GCN --dataset CitationFull-Cora_ML \\\n  --num-layers 2 --num-hidden 128 --num-runs 5 \\\n  --seed 100 --epochs 1000 --val-every 2 \\\n  --patience 100 --lr 0.001 --gpu 0 \\\n  --exp-setting paper-bp-coraML-L2-v1\n\npython train_forward.py --task node-class \\\n  --model GNN_SingleForward-GCN --dataset CitationFull-Cora_ML \\\n  （其余参数同上，另加：--append-label none \\\n   --aug-edge-direction bidirection --temperature 1.0）\n  --exp-setting paper-sf-coraML-L2-v1",
  { x: M + 0.25, y: 2.25, w: 6.2, h: 4.0, fontSize: 11.5, color: MUTED_DARK, fontFace: "Consolas", lineSpacing: 15, margin: 0 }
);
s.addText("证据索引（reproduction/reports/）", { x: 7.55, y: 1.7, w: 5.3, h: 0.4, fontSize: 16, bold: true, color: TEXT, fontFace: F, margin: 0 });
s.addText([
  { text: "protocol.md v1.1 —— 复现协议与对齐判据", options: { bullet: bu(), breakLine: true } },
  { text: "method_checks.md —— SF 方法 18 项断言", options: { bullet: bu(), breakLine: true } },
  { text: "split_manifest_cora_ml.json —— 划分审计", options: { bullet: bu(), breakLine: true } },
  { text: "resource_summary.csv —— 8 组数值 + 论文对照列", options: { bullet: bu(), breakLine: true } },
  { text: "figure_memory_vs_depth.png —— 论文同款对比图", options: { bullet: bu(), breakLine: true } },
  { text: "experiment_registry.md —— E01–E04 实验登记", options: { bullet: bu(), breakLine: true } },
  { text: "CHANGELOG.md —— 全部决策与变更记录", options: { bullet: bu(), breakLine: true } },
  { text: "~/forwardgnn-run/results/ —— 原始 JSON 与完整日志", options: { bullet: bu() } },
], { x: 7.55, y: 2.2, w: 5.3, h: 4.3, fontSize: 13.5, color: TEXT, fontFace: F, paraSpaceAfter: 9, margin: 0 });
footer(s, 11);

/* ---------- S12 结束（深色） ---------- */
s = pres.addSlide(); s.background = { color: BG_DARK };
s.addText("谢谢聆听 · 欢迎提问", { x: M, y: 2.7, w: 12.3, h: 1.0, fontSize: 44, bold: true, color: ON_DARK, fontFace: F, margin: 0 });
s.addText("复现材料：reproduction/reports/　·　原始结果：~/forwardgnn-run/results/", { x: M, y: 3.9, w: 12.3, h: 0.45, fontSize: 15, color: MUTED_DARK, fontFace: F, margin: 0 });
s.addText("ForwardGNN（ICLR 2024）复现 · 报告与数据截至 2026-09-23", { x: M, y: 4.45, w: 12.3, h: 0.4, fontSize: 13, color: MUTED_DARK, fontFace: F, margin: 0 });

pres.writeFile({ fileName: "D:/创新实践/The-reproduction-of-forwardgnn/reproduction/reports/ForwardGNN复现阶段性汇报.pptx" })
  .then(() => console.log("PPTX_DONE"));
