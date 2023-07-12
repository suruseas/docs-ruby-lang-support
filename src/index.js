import "./style.css";
import { DefaultRubyVM } from "ruby-head-wasm-wasi/dist/browser.umd.js";
export var rubyVM;

const loadUrl = new URL(chrome.runtime.getURL('node_modules/ruby-head-wasm-wasi/dist/ruby.wasm'));

export const initRubyVM = async () => {
  const response = await fetch(loadUrl);
  const buffer = await response.arrayBuffer();
  const module = await WebAssembly.compile(buffer);
  const { vm } = await DefaultRubyVM(module);

  rubyVM = vm;
}

export const getRubyVersion = async () => {
  //rubyVM.printVersion();
  return rubyVM.eval(`"ruby #{RUBY_VERSION}p#{RUBY_PATCHLEVEL} [#{RUBY_RELEASE_DATE} #{RUBY_PLATFORM}]"`).toString();
};

// 文字列のrubyコードを実行
export const evalRubyCode = async (code) => {
  return rubyVM.eval(code);
}
