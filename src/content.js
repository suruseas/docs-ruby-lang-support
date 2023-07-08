import { initRubyVM, printInitMessage, evalRubyCode } from "./index.js";

await initRubyVM();

const main = async () => {
  printInitMessage();

  evalRubyCode(`
    require "js"
    JS::eval("console.log('hello ruby')")
  `);

  // pre.rubyを全部検索する
  const codes = document.querySelectorAll("pre.ruby code");

  codes.forEach((code) => {
    console.log(code.textContent);
  });
};

main();
