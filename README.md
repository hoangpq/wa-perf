# Web Assembly with Rust

## Install nightly Rust
```bash
$ curl -s https://static.rust-lang.org/rustup.sh | sh -s -- --channel=nightly
```

## Frontend setup
```bash
$ git clone https://github.com/hoangpq/wa-perf.git
$ cd wa-perf
$ chmod +x ./init-project.sh && ./init-project.sh
$ chmod +x ./cargo-build.sh && ./cargo-build.sh
$ npm install && webpack-dev-server
```

Live demo: [https://rust-webassembly.herokuapp.com](https://rust-webassembly.herokuapp.com) (May need to reload if not available)
