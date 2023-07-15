import { initRubyVM, getRubyVersion, prismHighlight } from "./index.js";
import { CaretUtil } from "./caret.js";
import { execRubyCode } from "./exec.js"

await initRubyVM();

const rubyVersion = await getRubyVersion();

const main = async () => {
  console.log(rubyVersion);
  const containers = document.querySelectorAll("pre.highlight.ruby");

  containers.forEach((container, index) => {
    // 表示されているcode領域
    const code = container.querySelector('code');
    code.classList.add('language-ruby');

    // codeの内容でシンタックスハイライトするメソッド
    const highlight = () => {
      return prismHighlight(code.textContent).then((highlightedCode) => {
        code.innerHTML = highlightedCode;
      })
    }

    // 初期表示でハイライトする
    highlight();
    code.setAttribute("contenteditable", "true");

    // 初期表示に影響しない部分は非同期で処理する
    (async () => {
      // code編集時のハイライトできるようにする
      code.addEventListener('input', () => {
        const index = CaretUtil.getCaretPosition(code);
        highlight().then(() => {
          CaretUtil.setCaretPosition(code, index);
        });
      });

      // 枠
      const frame = document.createElement('div');
      frame.classList.add('document-ruby-lang-support-button-frame');

      // 結果表示枠
      const result = document.createElement('div');
      result.classList.add('document-ruby-lang-support-result');
      code.parentElement.insertBefore(result, code.nextElementSibling);

      // 実行ボタン
      const exec = document.createElement('span');
      (async () => {
        exec.classList.add('document-ruby-lang-support-button');
        exec.appendChild(document.createTextNode('EXEC'));
        exec.addEventListener("click", () => {
          // 枠を表示する
          result.style.display = 'block';
          // 結果をクリアする
          result.innerText = '';
          const logger = (...args) => {
            for (let arg of args) {
              result.innerText += arg;
            }
          }
          // rubyコードの実行
          execRubyCode(code.textContent, logger).then(() => {
            // もし出力文字がない場合はメッセージを表示する
            if (result.innerText.length === 0) {
              result.innerText = '------------------------\nExecuted but no output.';
            }
          })
        });
      })();

      // 元コードが保持されているtextarea
      const textarea = container.querySelector('textarea');

      // リセットボタン
      const reset = document.createElement('span');
      (async () => {
        reset.classList.add('document-ruby-lang-support-button');
        reset.appendChild(document.createTextNode('RESET'));
        reset.addEventListener("click", () => {
          const textarea = container.querySelector('textarea');
          // オリジナルも一番上には空行がセットされているので同じように追加
          code.textContent = "\n" + textarea.value;
          highlight();
          // 結果枠を非表示に戻す
          result.style.display = 'none';
        });
      })();

      // リセットボタン, 実行ボタンの順番
      frame.appendChild(reset);
      frame.appendChild(exec);

      container.insertBefore(frame, code.nextElementSibling);

      // pre枠をクリックでflexに変更する(非表示 -> 表示)
      (async () => {
        code.parentElement.addEventListener("click", () => {
          frame.style.display = 'flex';
        });
      })();
    })();
  });

  console.log('initialized.');
};

main();
