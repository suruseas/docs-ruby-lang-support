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

const getCurrentTimestamp = function () {
  return Math.floor(Date.now() / 1000);
}

const main = async () => {
  printInitMessage();

  const textareas = document.querySelectorAll("pre.ruby textarea");

  textareas.forEach((textarea, index) => {
    // 結果を保存するtextareaのid
    const resultTextareaId = `result_index_${index}`;

    // 実行ボタン
    var button = document.createElement('span');
    button.classList.add('btn_execute');
    button.appendChild(document.createTextNode('EXEC'));
    button.addEventListener("click", () => {
      var target = document.getElementById(resultTextareaId);
      // 枠を表示する
      target.style.display = 'block';
      // 結果をクリアする
      target.innerText = '';
      // 元のロジックを退避する
      var org_console_log = console.log;
      console.log = (...args) => {
        for (let arg of args) {
          //改行コード問題でだめだった
          //target.innerText += `${getCurrentTimestamp()}> ${arg}`;
          target.innerText += arg;
        }
      }
      evalRubyCode(`
        require 'js'
        begin
          eval(%q[${textarea.value}])
        rescue => e
          puts 'Traceback (most recent call last):'
          puts e.backtrace.map { |v| "\tfrom #{v}" }.join("\n")
          puts "#{e.class} (#{e.message})"
        end
      `);
      // もとに戻す
      console.log = org_console_log;
      // もし出力文字がない場合はメッセージを表示する
      if (target.innerText.length === 0) {
        target.innerText = '------------------------\nExecuted but no output.';
      }
    });
    textarea.parentNode.insertBefore(button, textarea.nextElementSibling);

    // 結果表示枠
    var result = document.createElement('div');
    result.setAttribute('id', resultTextareaId);
    result.classList.add('result');
    result.addEventListener("input", () => {
      autoAdjustTextarea(result)
    });
    textarea.parentNode.insertBefore(result, button.nextElementSibling);

    // preタグにクリックイベントをつける
    let pre = textarea.parentNode;
    pre.addEventListener("click", () => {
      // codeタグ
      let code = textarea.previousElementSibling;
      code.style.display = 'none';
      button.style.display = 'block';
      textarea.style.display = 'block';
      // 初期表示
      autoAdjustTextarea(textarea);
      textarea.addEventListener("input", () => {
        autoAdjustTextarea(textarea)
      });
    });
  });
};

main();
