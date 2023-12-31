import { evalRubyCode } from "./index.js";

export const execRubyCode = async (code, logger) => {
  // 元の console.log を退避する
  const originalConsoleLog = console.log;
  // 置き換える
  console.log = logger;
  // 非同期でrubyコードを実行する
  return evalRubyCode(`
    require "js.so"
    $constants = Module.constants
    begin
      eval(%q!${code.replaceAll('\\', '\\\\').replaceAll('!', '\\!')}!)
    rescue => e
      puts 'Traceback (most recent call last):'
      puts e.backtrace.map { |v| "\tfrom #{v}" }.join("\n")
      puts "#{e.class} (#{e.message})"
    end
    (Module.constants - $constants).each do |constant|
      Object.class_eval { remove_const(constant) }
    end
  `).catch((e) => {
    console.log(e);
  }).then((result) => {
    console.log = originalConsoleLog;
    // ruby側でエラーが発生するとresultがundefinedになる
    return result && result.toJS();
  });
}
