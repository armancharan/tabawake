"""Custom rule: package a Rust frame engine crate as web-ready WASM + JS glue.

Employer-readable contract: one Bazel target turns the procedural frame pipeline
into browser artifacts the web app (and e2e tests) can depend on.
"""

load("@rules_rust_wasm_bindgen//:defs.bzl", "rust_wasm_bindgen")

def wasm_frame_engine(name, crate, out_name = None, bindgen_flags = [], visibility = None):
    """Build `crate` (a wasm cdylib / binary) and emit bundler-oriented bindings.

    Args:
      name: Target name for the bindgen output.
      crate: Label of a `rust_shared_library` or `rust_binary` built for wasm32.
      out_name: Optional wasm-bindgen --out-name (defaults to `name`).
      bindgen_flags: Extra flags forwarded to wasm-bindgen.
      visibility: Standard Bazel visibility.
    """
    rust_wasm_bindgen(
        name = name,
        wasm_file = crate,
        target = "web",
        out_name = out_name if out_name else name,
        bindgen_flags = bindgen_flags,
        visibility = visibility if visibility != None else ["//visibility:public"],
    )

    # Convenience filegroup so //apps/web and //e2e can depend on a stable label.
    native.filegroup(
        name = name + "_files",
        srcs = [":" + name],
        visibility = visibility if visibility != None else ["//visibility:public"],
    )
