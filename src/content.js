import { initRubyVM, getRubyVersion, prismHighlight } from "./index.js";
import { CaretUtil } from "./caret.js";
import { execRubyCode } from "./exec.js"

await initRubyVM();

const rubyVersion = await getRubyVersion();

// コピー用のテキストを取得する
const getClipCopyCode = (textContent) => {
  // 余計な改行を除去しておく
  return textContent.replace(/^\n+/, "").replace(/\n{2,}$/, "\n")
}

// domの生成を待って取得(別管理JSで生成されているので作成を待つ)
const waitQuerySelector = async (node, selector) => {
  let obj = null;
  for (let i = 0; i < 10 && !obj; i++) {
    obj = await new Promise(resolve => setTimeout(() => resolve(node.querySelector(selector), 100)));
  }

  if (!obj) { console.error(`${selector} could not be found.`); }

  return obj;
}

const main = async () => {
  console.log(rubyVersion);
  const containers = document.querySelectorAll("pre.highlight.ruby");

  containers.forEach((container, index) => {
    // 表示されているcode領域
    const code = container.querySelector('code');
    code.classList.add('language-ruby');

    // 初期表示時のコード内容を保持しておく
    const initialCode = getClipCopyCode(code.textContent);

    // codeの内容でシンタックスハイライトするメソッド
    const highlight = () => {
      return prismHighlight(code.textContent).then((highlightedCode) => {
        code.innerHTML = highlightedCode;
      })
    }

    // 初期表示でハイライトする
    highlight();
    code.setAttribute("contenteditable", "true");

    // コピー用のtextareaの同期用
    const syncClipCopyTextarea = (container, code) => {
      const copyText = container.querySelector('textarea');
      copyText.innerHTML = getClipCopyCode(code.textContent);
    }

    // 初期表示に影響しない部分は非同期で処理する
    (async () => {
      // code編集時のハイライトできるようにする
      code.addEventListener('input', () => {
        const index = CaretUtil.getCaretPosition(code);
        highlight().then(() => {
          CaretUtil.setCaretPosition(code, index);
        });
      });
      // code編集結果はコピー用のtextareaの内容を同期する
      code.addEventListener('input', () => {
        syncClipCopyTextarea(container, code);
      });

      const spacer = document.createElement('div');
      spacer.classList.add('document-ruby-lang-support-spacer');
      container.insertBefore(spacer, code.nextElementSibling);

      // 結果表示枠
      const result = document.createElement('div');
      result.classList.add('document-ruby-lang-support-result');
      container.insertBefore(result, spacer.nextElementSibling);

      // 実行ボタン
      const exec = document.createElement('span');
      (async () => {
        exec.classList.add('document-ruby-lang-support-button');
        exec.appendChild(document.createTextNode('EXEC'));
        container.insertBefore(exec, spacer.nextElementSibling);
        exec.addEventListener("click", (event) => {
          event.stopPropagation();
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
          execRubyCode(code.textContent, logger).then((res) => {
            // もし出力文字がない場合はeval結果を表示する
            if (result.innerText.length === 0) {
              result.innerText = res ? res : 'nil';
            }
          })
        });
      })();

      // リセットボタンを含む枠の制御
      waitQuerySelector(container, 'span.highlight__copy-button').then((copy) => {
        // リセットボタン
        const reset = document.createElement('span');
        if (copy) {
          const frame = document.createElement('span');
          // リセットボタンを移動する
          frame.appendChild(copy);
          container.prepend(frame);

          reset.classList.add('document-ruby-lang-support-button', 'document-ruby-lang-support-button-reset');
          reset.appendChild(document.createTextNode('RESET'));
          // リセットボタンはcopyのframeに追加する
          frame.appendChild(reset);
          reset.addEventListener("click", (event) => {
            event.stopPropagation();
            // オリジナルも一番上には空行がセットされているので同じように追加
            code.textContent = "\n" + initialCode;
            highlight();
            // 初期状態にする
            [result, reset, exec].forEach((element) => {
              element.style.display = 'none';
            });
            // 編集されたのでコピー用のtextareaも初期化する
            syncClipCopyTextarea(container, code);
          });

          // pre枠をクリックで各種ボタンを表示する
          container.addEventListener("click", (event) => {
            if (event.target == event.currentTarget) {
              [exec, reset].forEach((element) => {
                element.style.display = 'inline';
              });
            }
          });

          if (index + 1 === containers.length) {
            console.log('setuped.');
          }
        }
      });
    })();
  });

  console.log('initialized.');
};

main();
