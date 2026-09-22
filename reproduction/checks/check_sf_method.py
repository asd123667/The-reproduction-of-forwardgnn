# check_sf_method.py — v3 计划步骤 5：SF 方法行为断言
# 运行: cd ~/forwardgnn-run/src && python check_sf_method.py  (需 CUBLAS_WORKSPACE_CONFIG=:4096:8)
# 产出: /tmp/sfcheck-summary.json + 逐条 [PASS]/[FAIL] 打印
# 注意: 本脚本只读数据与模型行为，不修改任何官方代码；结果 JSON 写到 /tmp。
import argparse
import hashlib
import json
from pathlib import Path

import torch

from datasets.dataloader import load_node_classification_data
from forward_learning.nodeclass.gnn_sf import GraphAugmenter
from train_forward import build_node_classification_model
from utils.train_utils import SeedManager, ResultManager, setup_cuda, set_seed

SUMMARY = {"checks": {}, "evidence": {}}


def check(name, ok, detail=""):
    SUMMARY["checks"][name] = {"ok": bool(ok), "detail": str(detail)}
    print(("[PASS] " if ok else "[FAIL] ") + name + ((" | " + str(detail)) if detail else ""))
    return bool(ok)


def param_hash(module):
    t = torch.cat([p.detach().cpu().flatten() for p in module.parameters()])
    return hashlib.sha256(t.numpy().tobytes()).hexdigest()


# ---------- 构造与 smoke 一致的 args ----------
args = argparse.Namespace(
    task="node-class", model="GNN_SingleForward-GCN", loss_fn_name="forwardforward_loss_fn",
    num_layers=2, num_hidden=128, ff_theta=2.0, append_label=None, dataset="CitationFull-Cora_ML",
    val_from=0, num_runs=1, gpu=0, seed=100, lr=0.001, epochs=2, val_every=2, patience=100,
    exp_setting="check-sf-method", num_negs=2, overwrite_result=False, temperature=1.0,
    grad_max_norm=1.0, aug_edge_direction="bidirection", test_time_steps=10,
    storable_time_steps=None, alternating_update=False,
)
setup_cuda(args)
args.results_dir = Path("/tmp/sfcheck-results")
args.results_dir.mkdir(parents=True, exist_ok=True)

set_seed(10100, deterministic=True)
data = load_node_classification_data(args, split_i=0)
data = data.to(args.device)  # 与官方 forward_train 一致：构造 GraphAugmenter 前先上设备
N, C = data.num_nodes, data.num_classes
model = build_node_classification_model(
    "GNN_SingleForward-GCN", 2, 128, "forwardforward_loss_fn", 0.001, data, args)
model = model.to(args.device)
layer0, layer1 = model.layers[0], model.layers[1]

# ---------- 检查 1: 增强图节点数 = N + C ----------
ga = GraphAugmenter(data=data, aug_edge_direction="bidirection", append_label=None,
                    device=args.device)
aug = ga.augment(y=data.y, aug_node_mask=data.train_mask)
check("aug_nodes_eq_N_plus_C", aug.num_nodes == N + C == 3002,
      f"N={N}, C={C}, aug={aug.num_nodes}")
check("virtual_node_count_eq_C", int((~ga.real_node_mask).sum()) == C == 7,
      f"virtual={int((~ga.real_node_mask).sum())}")

# ---------- 检查 2: 类别边只连训练节点、且连向自己的类别；双向；验证/测试节点无类别边 ----------
ei = aug.edge_index
virt = (ei[0] >= N) | (ei[1] >= N)
n_virtual_edges = int(virt.sum())
n_train = int(data.train_mask.sum())
pairs = set(zip(ei[0][virt].tolist(), ei[1][virt].tolist()))
train_ids = set(data.train_mask.nonzero().flatten().tolist())
labels = data.y[data.train_mask].tolist()

ok_edges = n_virtual_edges == 2 * n_train
bad = 0
for i, yl in zip(data.train_mask.nonzero().flatten().tolist(),
                 data.y[data.train_mask].tolist()):
    if (i, N + yl) not in pairs or (N + yl, i) not in pairs:
        bad += 1
real_endpoints_ok = all(((s < N) and (s in train_ids)) or ((d < N) and (d in train_ids))
                        for s, d in pairs)
check("class_edges_count_bidirection", ok_edges,
      f"virtual_edges={n_virtual_edges}, expected=2*{n_train}={2 * n_train}")
check("class_edges_only_own_class", bad == 0, f"mismatched_train_nodes={bad}")
check("class_edges_only_train_nodes", real_endpoints_ok,
      "val/test 节点未出现在任何虚拟节点边中")

# 各类别虚拟节点的度 = 2 × 该类训练节点数
per_class = {}
for k in range(C):
    cnt = int((data.y[data.train_mask] == k).sum())
    deg = int(((ei[0] == N + k) | (ei[1] == N + k)).sum())
    per_class[k] = {"train_count": cnt, "virtual_degree": deg}
    if deg != 2 * cnt:
        check("virtual_degree_per_class", False, f"class {k}: deg={deg}, expected={2 * cnt}")
        break
else:
    check("virtual_degree_per_class", True, str(per_class))
SUMMARY["evidence"]["per_class"] = per_class

# ---------- 检查 3: logits = 点积, 形状 (num_train, C); 损失 = 交叉熵 ----------
with torch.no_grad():
    emb = layer0.forward(aug.x.detach(), aug.edge_index)
    train_emb = emb[ga.real_node_mask][data.train_mask]
    virt_emb = emb[~ga.real_node_mask]
    logits = torch.mm(train_emb, virt_emb.t())
check("logits_shape", tuple(logits.shape) == (n_train, C),
      f"shape={tuple(logits.shape)}, expected=({n_train}, {C})")
manual_dot = (train_emb.unsqueeze(1) * virt_emb.unsqueeze(0)).sum(-1)
check("logits_is_dot_product", torch.allclose(logits, manual_dot, atol=1e-5),
      f"max_diff={(logits - manual_dot).abs().max().item():.2e}")
check("temperature_is_1", layer0.temperature == 1.0, f"T={layer0.temperature}")
check("loss_is_cross_entropy", isinstance(layer0.criterion, torch.nn.CrossEntropyLoss),
      type(layer0.criterion).__name__)

# ---------- 检查 4: 逐层优化器只管本层参数 ----------
p0 = {id(p) for p in layer0.gnn_layer.parameters()}
p1 = {id(p) for p in layer1.gnn_layer.parameters()}
o0 = {id(p) for g in layer0.optimizer.param_groups for p in g["params"]}
o1 = {id(p) for g in layer1.optimizer.param_groups for p in g["params"]}
check("optimizer0_only_layer0", o0 == p0 and len(o0) > 0,
      f"|o0|={len(o0)}, |p0|={len(p0)}")
check("optimizer1_only_layer1", o1 == p1 and len(o1) > 0, f"|o1|={len(o1)}")
check("optimizer_param_sets_disjoint", len(o0 & o1) == 0, f"overlap={len(o0 & o1)}")

# ---------- 检查 5: 层间 detach + 第 1 层参数在第 2 层训练期间不变 ----------
# 注意: 官方代码以 layer.forward(...) 直接调用（绕过 Module.__call__），
# forward hook 不会触发，因此这里用运行时包装拦截，不修改官方代码文件。
h0_before = param_hash(layer0)
captured = {}
orig_forward = layer1.forward


def wrapped_forward(x, edge_index, edge_type=None):
    if "h0" not in captured:
        captured["h0"] = param_hash(layer0)
        captured["input_requires_grad"] = bool(x.requires_grad)
    return orig_forward(x, edge_index, edge_type)


layer1.forward = wrapped_forward
seed_manager = SeedManager(100)
seed_manager.set_run_i(0)
rm = ResultManager("check-sf", args, seed_manager)
model.forward_train(data, rm, run_i=0)
layer1.forward = orig_forward

check("hook_captured_layer1_first_forward", "h0" in captured,
      "拦截到 layer1 的首次前向")
h0_after = param_hash(layer0)
check("layer1_input_detached", captured.get("input_requires_grad") is False,
      f"layer1 首次前向输入 requires_grad={captured.get('input_requires_grad')}")
check("layer0_learns_in_own_phase",
      "h0" in captured and h0_before != captured["h0"],
      "第 1 层参数在自己训练阶段确实改变")
check("layer0_frozen_during_layer1",
      "h0" in captured and h0_after == captured["h0"],
      "第 2 层训练期间第 1 层参数逐比特不变")

# ---------- 检查 6: 推理 = 各层概率求和融合 ----------
acc_fused, probs = model.eval_model(eval_mask=data.test_mask)
acc_single, _ = model.eval_model(eval_mask=data.test_mask, last_eval_layer=0)
check("fusion_uses_all_layers", len(probs) == 2,
      f"accumulated_probs={len(probs)} 层（epochs=2 的调试训练，两层 acc 相同属正常）")
SUMMARY["evidence"]["fusion_acc_test"] = {"fused": acc_fused, "single_layer0": acc_single}
SUMMARY["evidence"]["source_refs"] = {
    "virtual_nodes": "gnn_sf.py:287-293", "class_edges_only_train": "gnn_sf.py:151,332-343",
    "bidirection": "gnn_sf.py:335-337", "logits_dot_product": "gnn_sf.py:65,244",
    "temperature": "gnn_sf.py:66-67", "ce_loss": "gnn_sf.py:39,71",
    "local_backward": "gnn_sf.py:70-75", "per_layer_optimizer": "gnn_sf.py:36-38",
    "per_layer_loop_earlystop": "gnn_sf.py:158-195", "detach_to_next_layer": "gnn_sf.py:212-215",
    "prob_fusion": "gnn_sf.py:236-255",
}

out = Path("/tmp/sfcheck-summary.json")
out.write_text(json.dumps(SUMMARY, indent=2, ensure_ascii=False), encoding="utf-8")
n_fail = sum(1 for c in SUMMARY["checks"].values() if not c["ok"])
print(f"\n==== SUMMARY: {len(SUMMARY['checks']) - n_fail}/{len(SUMMARY['checks'])} passed, "
      f"detail -> {out} ====")
raise SystemExit(1 if n_fail else 0)
