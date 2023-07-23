import "./style.css";
import { DefaultRubyVM } from "ruby-3_2-wasm-wasi/dist/browser.umd.js";
import Prism from 'prismjs';
import 'prismjs/components/prism-ruby';
import 'prismjs/themes/prism.css'
export var rubyVM;

const loadUrl = new URL(chrome.runtime.getURL('node_modules/ruby-3_2-wasm-wasi/dist/ruby+stdlib.wasm'));

export const initRubyVM = async () => {
  const response = await fetch(loadUrl);
  const buffer = await response.arrayBuffer();
  const module = await WebAssembly.compile(buffer);
  const { vm } = await DefaultRubyVM(module);

  rubyVM = vm;
}

export const getRubyVersion = async () => {
  return rubyVM.eval(`"ruby #{RUBY_VERSION}p#{RUBY_PATCHLEVEL} [#{RUBY_RELEASE_DATE} #{RUBY_PLATFORM}]"`).toString();
};

// 文字列のrubyコードを実行
export const evalRubyCode = async (code) => {
  return rubyVM.eval(code);
}

export const prismHighlight = async (code) => {
  return Prism.highlight(code, Prism.languages.ruby, 'ruby');
}
