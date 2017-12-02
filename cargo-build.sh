#!/usr/bin/env bash
cargo +nightly build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/sample-wa.wasm ./
wasm-gc sample-wa.wasm hello.wasm
