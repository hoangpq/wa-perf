#!/usr/bin/env bash
cargo clean
cargo +nightly build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/sample-wa.wasm ./app/
wasm-gc ./app/sample-wa.wasm ./app/hello.wasm
rm ./app/sample-wa.wasm
