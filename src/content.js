import { initRubyVM, printInitMessage, evalRubyCode } from "./index.js";

await initRubyVM();

const autoAdjustTextarea = function (textarea) {
  const resetHeight = new Promise(resolve => {
    resolve((textarea.style.height = "auto"))
  })

  resetHeight.then(() => {
    const scrollHeight = textarea.scrollHeight
    textarea.style.height = scrollHeight + "px"
  });
}

const main = async () => {
  printInitMessage();

  evalRubyCode(`
    require "js"
    JS::eval("console.log('hello ruby')")
  `);

  const textareas = document.querySelectorAll("pre.ruby textarea");

  textareas.forEach((textarea) => {
    //console.log(textareas);
    // 初期表示で高さを合わせる
    autoAdjustTextarea(textarea);
    // 入力に合わせる
    textarea.addEventListener("input", () => {
      autoAdjustTextarea(textarea)
    })
  });
};

main();
