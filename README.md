# るりまサポート

GoogleChromeの機能拡張で、Ruby 3.2 リファレンスマニュアル(るりま)に掲載のRubyコードを、Ruby Wasmで実行できます。

## build

```
npm run build
```

## make extension

```
npm run make
```

## memo

- ruby-3_2-wasm-wasi は 現時点では ruby3.2.0p-0 (2022-12-25) で少し古いので ruby-head-wasm-wasi を利用
  - ruby-3_2-wasm-wasi 利用時にはbuild時にエラーが出るので `npm install url` が必要

## todo

- パッケージサイズを小さくする。node_modulesに不要な物が多い。
