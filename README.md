https://semaphoreci.com/blog/ruby-webassembly

# TOOD:

- manifest v2で実装しているのでv3に移行する
  - v3だとCSPの制限がきつくてevalできない。unloosenは回避できている(ざっとみたけどどうやって回避しているかわからん)ので大人しく使ったほうがよい。
    - 参考)https://qiita.com/logiteca7/items/ffb8c1add83135ac6af9#unloosenconfigjson をみるといけそうな気がするんですが…
