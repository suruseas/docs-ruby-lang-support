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

const executeCode = (codeText, resultElement) => {
  // 結果枠を表示する
  resultElement.style.display = 'block';
  // 結果をクリアする
  resultElement.innerText = '';
  const logger = (...args) => {
    for (let arg of args) {
      resultElement.innerText += arg;
    }
  }
  // rubyコードの実行
  execRubyCode(codeText, logger).then((res) => {
    // もし出力文字がない場合はeval結果を表示する
    if (resultElement.innerText.length === 0) {
      resultElement.innerText = res ? res : 'nil';
    }
    // アニメーション
    playAnimation(resultElement, 'opacityChanging');
  });
}

// アニメーション再実行
const playAnimation = (element, animationClassName) => {
  element.className = element.className.replace(animationClassName, '');
  window.requestAnimationFrame(function (time) {
    window.requestAnimationFrame(function (time) {
      element.className = `${element.className} ${animationClassName}`;
    });
  });
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
    code.setAttribute("spellcheck", "false");

    // コピー用のtextareaの同期用
    const syncClipCopyTextarea = (container, code) => {
      const copyText = container.querySelector('textarea');
      copyText.innerHTML = getClipCopyCode(code.textContent);
    }

    // 初期表示に影響しない部分は非同期で処理する
    (async () => {
      // IME変換状態を保持
      let isComposing = false;
      code.addEventListener('compositionstart', () => {
        isComposing = true;
      })
      code.addEventListener('compositionend', () => {
        isComposing = false;
      })

      // code編集時のハイライトできるようにする
      code.addEventListener('input', () => {
        // 入力中はハイライトしない
        if (isComposing) return;

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
      exec.classList.add('document-ruby-lang-support-exec');
      container.insertBefore(exec, code);

      // リセットボタンを含む枠の制御
      waitQuerySelector(container, 'span.highlight__copy-button').then((copy) => {
        // リセットボタン
        const reset = document.createElement('span');
        if (copy) {
          const frame = document.createElement('span');
          // 実行ボタンの左マージンを決めてから表示する
          let prev = exec.previousElementSibling;
          if (prev.textContent.startsWith('例')) {
            exec.style.left = `${prev.offsetWidth}px`;
          } else {
            exec.style.left = '0px';
          }
          exec.style.display = 'block';

          // リセットボタンを移動する
          frame.appendChild(copy);
          container.prepend(frame);

          reset.classList.add('document-ruby-lang-support-button', 'document-ruby-lang-support-button-reset');
          reset.appendChild(document.createTextNode('RESET'));
          // リセットボタンはcopyのframeに追加する
          frame.appendChild(reset);

          // 実行ボタン押下イベント
          exec.addEventListener("click", (event) => {
            event.stopPropagation();
            executeCode(code.textContent, result);
            // リセットボタンの表示
            // TODO: 共通化できる
            [reset].forEach((element) => {
              element.style.display = 'inline';
            });
          });

          // リセットボタン押下イベント
          reset.addEventListener("click", (event) => {
            event.stopPropagation();
            // オリジナルも一番上には空行がセットされているので同じように追加
            code.textContent = "\n" + initialCode;
            highlight();
            // 初期状態にする
            [result].forEach((element) => {
              element.style.display = 'none';
            });
            // 編集されたのでコピー用のtextareaも初期化する
            syncClipCopyTextarea(container, code);
          });

          // pre枠をクリックで各種ボタンを表示する
          container.addEventListener("click", (event) => {
            if (event.target == event.currentTarget) {
              // TODO: 共通化できる
              [reset].forEach((element) => {
                element.style.display = 'inline';
              });
            }
          });

          // code枠で cmd+Enter or Ctrl+Enterを押下する
          code.addEventListener("keydown", (event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              executeCode(code.textContent, result);
              // リセットボタンの表示
              // TODO: 共通化できる
              [reset].forEach((element) => {
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
