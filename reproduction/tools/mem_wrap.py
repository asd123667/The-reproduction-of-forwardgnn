# mem_wrap.py — 独立进程运行官方训练脚本并记录峰值显存（不修改官方代码）
# 对应 v3 计划 §6.2 tools/profile_run.py 的功能位。
# 口径 = 本进程内 torch.cuda 峰值（参数+激活+梯度+Adam 状态；含常驻 GPU 的输入数据，
# 与论文 Table 4 口径的换算见 summarize_resources.py 的"修正比例"）。
#
# 部署: 复制到 ~/forwardgnn-run/src/ 后，在 src/ 目录运行:
#   python mem_wrap.py train_backprop.py <原参数...>
#   python mem_wrap.py train_forward.py  <原参数...>
# 产出: 终端打印 [MEM] 行，并追加到 <运行副本>/results/resource_log.csv
#       （列: setting, peak_alloc_MiB, peak_reserved_MiB, wall_s, status）
import os
import sys
import time
import runpy

import torch


def results_root(script_path):
    # 官方 settings.py 的 results 根 = 训练脚本所在目录的上一级 / results，
    # 与 CWD 无关，避免写错位置
    return os.path.normpath(os.path.join(
        os.path.dirname(os.path.abspath(script_path)), "..", "results"))


def main():
    argv = sys.argv[1:]
    if not argv:
        print("usage: python mem_wrap.py <script.py> [args...]")
        sys.exit(2)
    script, rest = argv[0], argv[1:]
    setting = rest[rest.index("--exp-setting") + 1] if "--exp-setting" in rest else "unknown"
    os.environ.setdefault("CUBLAS_WORKSPACE_CONFIG", ":4096:8")
    sys.path.insert(0, os.path.dirname(os.path.abspath(script)))
    sys.argv = [script] + rest
    t0, status = time.time(), "ok"
    try:
        runpy.run_path(script, run_name="__main__")
    except SystemExit as e:
        status = f"exit({e.code})"
    except BaseException:
        status = "crashed"
        raise
    finally:
        wall = time.time() - t0
        if torch.cuda.is_available():
            alloc = torch.cuda.max_memory_allocated() / 2**20
            reserved = torch.cuda.max_memory_reserved() / 2**20
        else:
            alloc = reserved = -1.0
        print(f"\n[MEM] setting={setting} peak_alloc_MiB={alloc:.1f} "
              f"peak_reserved_MiB={reserved:.1f} wall_s={wall:.1f} status={status}")
        root = results_root(script)
        os.makedirs(root, exist_ok=True)
        csv = os.path.join(root, "resource_log.csv")
        new = not os.path.exists(csv)
        with open(csv, "a") as f:
            if new:
                f.write("setting,peak_alloc_MiB,peak_reserved_MiB,wall_s,status\n")
            f.write(f"{setting},{alloc:.1f},{reserved:.1f},{wall:.1f},{status}\n")


if __name__ == "__main__":
    main()
