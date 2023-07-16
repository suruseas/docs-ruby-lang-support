https://semaphoreci.com/blog/ruby-webassembly

# 開発用

```
npm run build
```

# TOOD:

- manifest v2で実装しているのでv3に移行する
  - v3だとCSPの制限がきつくてevalできない。unloosenは回避できている(ざっとみたけどどうやって回避しているかわからん)ので大人しく使ったほうがよい。
    - 参考)https://qiita.com/logiteca7/items/ffb8c1add83135ac6af9#unloosenconfigjson をみるといけそうな気がするんですが…
- (JS)[https://github.com/ruby/ruby.wasm/blob/main/ext/js/lib/js.rb] で div[:innerText]が動かない。理由は不明…
