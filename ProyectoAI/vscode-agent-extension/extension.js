const vscode = require('vscode');

function getSelection(editor) {
  const selection = editor.selection;
  if (selection && !selection.isEmpty) {
    return { range: selection, text: editor.document.getText(selection) };
  }
  return null;
}

function getConfig() {
  return vscode.workspace.getConfiguration('codeAgent');
}

function showInfo(msg) { vscode.window.showInformationMessage(`Code Agent: ${msg}`); }
function showWarn(msg) { vscode.window.showWarningMessage(`Code Agent: ${msg}`); }
function showError(msg) { vscode.window.showErrorMessage(`Code Agent: ${msg}`); }

function withEditor(fn) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) { showWarn('No hay un editor activo'); return; }
  fn(editor);
}

function detectProblems(text) {
  const problems = [];
  const lines = text.split('\n');
  const config = getConfig();
  const patterns = config.get('patterns');

  for (const [i, line] of lines.entries()) {
    const ln = i + 1;
    if (patterns.consoleLog && line.includes('console.log')) {
      problems.push({ line: ln, message: patterns.consoleLog, severity: 'info' });
    }
    if (patterns.varKeyword && /\bvar\b/.test(line)) {
      problems.push({ line: ln, message: patterns.varKeyword, severity: 'warning' });
    }
    if (patterns.emptyCatch && /^\s*catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
      problems.push({ line: ln, message: patterns.emptyCatch, severity: 'warning' });
    }
    if (patterns.todoComment && /\bTODO\b/i.test(line)) {
      problems.push({ line: ln, message: patterns.todoComment, severity: 'info' });
    }
    if (patterns.nestedCallback && /\)\s*=>\s*\{[^}]*\([^)]*\)\s*=>/.test(line)) {
      problems.push({ line: ln, message: patterns.nestedCallback, severity: 'info' });
    }
    if (patterns.magicNumber && /[=:]\s*\d{3,}\b/.test(line) && !line.includes('const') && !line.includes('let ') && !line.includes('var ') && !line.includes('case ')) {
      problems.push({ line: ln, message: patterns.magicNumber, severity: 'warning' });
    }
  }

  if (patterns.duplicateCode) {
    const trimmed = lines.map(l => l.trim()).filter(l => l.length > 20);
    const seen = new Map();
    for (let i = 0; i < trimmed.length; i++) {
      if (seen.has(trimmed[i])) {
        problems.push({ line: i + 1, message: patterns.duplicateCode, severity: 'warning' });
      }
      seen.set(trimmed[i], (seen.get(trimmed[i]) || 0) + 1);
    }
  }

  if (patterns.longFunction && text.length > 30) {
    let funcLines = 0;
    let inFunc = false;
    let braceCount = 0;
    for (const [i, line] of lines.entries()) {
      if (/function\s*\w*\s*\(|\w+\s*=\s*\([^)]*\)\s*=>/.test(line)) { inFunc = true; funcLines = 0; }
      if (inFunc) {
        funcLines++;
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        if (braceCount <= 0 && funcLines > 1) { inFunc = false; if (funcLines > 30) problems.push({ line: i - funcLines + 2, message: patterns.longFunction, severity: 'info' }); }
      }
    }
  }

  return problems;
}

function activate(context) {
  let disposable;

  // --- GENERATE COMMENTS ---
  disposable = vscode.commands.registerCommand('codeAgent.generateComments', () => {
    withEditor(editor => {
      const sel = getSelection(editor);
      if (!sel) { showWarn('Selecciona codigo para comentar'); return; }
      const style = getConfig().get('commentStyle');
      const commentChar = style === 'block' ? ' * ' : '// ';
      const text = sel.text;
      const summary = text.split('\n')[0].replace(/[{}\s]/g, ' ').trim().substring(0, 60);
      let comment;
      if (style === 'block') {
        comment = `/**\n * ${summary}\n${text.split('\n').map(l => ` * ${l}`).join('\n')}\n */`;
      } else {
        comment = text.split('\n').map(l => `// ${l}`).join('\n');
      }
      editor.edit(eb => eb.replace(sel.range, comment));
    });
  });
  context.subscriptions.push(disposable);

  // --- SUGGEST IMPROVEMENTS ---
  disposable = vscode.commands.registerCommand('codeAgent.suggestImprovements', () => {
    withEditor(editor => {
      const sel = getSelection(editor);
      const text = sel ? sel.text : editor.document.getText();
      const problems = detectProblems(text);
      if (problems.length === 0) { showInfo('No se detectaron mejoras sugeridas'); return; }
      const items = problems.map(p => ({
        label: `Line ${p.line} [${p.severity}]`,
        description: p.message,
        detail: `Linea ${p.line}: ${p.message}`
      }));
      vscode.window.showQuickPick(items, { placeHolder: 'Mejoras detectadas (selecciona para detalle)' });
    });
  });
  context.subscriptions.push(disposable);

  // --- CHECK ERRORS ---
  disposable = vscode.commands.registerCommand('codeAgent.checkErrors', () => {
    withEditor(editor => {
      const doc = editor.document;
      const text = doc.getText();
      const lang = doc.languageId;
      const errors = [];

      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const ln = i + 1;
        const line = lines[i];

        if (lang === 'javascript' || lang === 'typescript' || lang === 'javascriptreact' || lang === 'typescriptreact') {
          if (line.match(/=\s*$/)) errors.push({ line: ln, msg: 'Asignacion incompleta', severity: 'error' });
          if (/^\s*await\s+/.test(line) && !text.includes('async')) errors.push({ line: ln, msg: 'await fuera de funcion async', severity: 'error' });
          if (/\bundefined\b/.test(line) && !/typeof\s+undefined/.test(line)) errors.push({ line: ln, msg: 'Usar undefined directamente, considera optional chaining', severity: 'warning' });
          if (/\=\=\s/.test(line) && !/\=\=\=/.test(line)) errors.push({ line: ln, msg: 'Usar === en lugar de ==', severity: 'warning' });
          if (line.includes('var ')) errors.push({ line: ln, msg: 'Usar let/const en lugar de var', severity: 'warning' });
          if (/^\s*\}?\s*catch\s*\(/.test(line) && lines[i + 1] && /^\s*\{\s*\}?$/.test(lines[i + 1])) errors.push({ line: ln, msg: 'catch vacio detectado', severity: 'error' });
        }

        if (lang === 'python') {
          if (!line.startsWith('#') && line.includes('==') && !line.includes('===')) { }
          if (/^\s*except\s*:\s*$/.test(line) && lines[i + 1] && /^\s*pass\s*$/.test(lines[i + 1])) errors.push({ line: ln, msg: 'except vacio detectado', severity: 'error' });
          if (/^\s*print\s*\(/.test(line)) errors.push({ line: ln, msg: 'Usar logging en vez de print', severity: 'info' });
        }

        if (lang === 'java') {
          if (/^\s*catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) errors.push({ line: ln, msg: 'catch vacio detectado', severity: 'error' });
          if (!line.startsWith('//') && !line.startsWith('*') && /\bSystem\.(out|err)\.(print|println)\b/.test(line)) errors.push({ line: ln, msg: 'Usar Logger en vez de System.out', severity: 'warning' });
        }
      }

      if (errors.length === 0) { showInfo('No se detectaron errores'); return; }
      const items = errors.map(e => ({
        label: `Ln ${e.line} [${e.severity}]`,
        description: e.msg
      }));
      vscode.window.showQuickPick(items, { placeHolder: `${errors.length} problema(s) detectado(s)` });
    });
  });
  context.subscriptions.push(disposable);

  // --- REFACTOR CONSOLE.LOG TO LOGGER ---
  disposable = vscode.commands.registerCommand('codeAgent.refactorToLoggingLibrary', () => {
    withEditor(editor => {
      const doc = editor.document;
      const text = doc.getText();
      const newText = text.replace(/console\.log\(/g, 'logger.info(');
      const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(text.length));
      editor.edit(eb => eb.replace(fullRange, newText));
      showInfo('console.log reemplazados por logger.info');
    });
  });
  context.subscriptions.push(disposable);

  // --- ADD JSDOC ---
  disposable = vscode.commands.registerCommand('codeAgent.addJSDoc', () => {
    withEditor(editor => {
      const pos = editor.selection.active;
      const line = editor.document.lineAt(pos.line).text;
      const match = line.match(/(?:function\s+(\w+)|(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*\([^)]*\)\s*\{)/);
      if (!match) { showWarn('Selecciona una funcion'); return; }
      const funcName = match[1] || match[2] || match[3] || 'anonymous';
      const params = line.match(/\(([^)]*)\)/);
      const paramDocs = params ? params[1].split(',').filter(Boolean).map(p => {
        const name = p.trim().replace(/=.*$/, '').replace(/^[^a-zA-Z_$]/, '').trim();
        return name ? ` * @param {any} ${name} - Descripcion` : null;
      }).filter(Boolean).join('\n') : '';
      const jsdoc = `/**\n * ${funcName} - Descripcion\n${paramDocs}${paramDocs ? '\n' : ''} * @returns {any} - Descripcion del retorno\n */`;
      editor.edit(eb => eb.insert(new vscode.Position(pos.line, 0), jsdoc + '\n'));
    });
  });
  context.subscriptions.push(disposable);

  // --- WRAP TRY-CATCH ---
  disposable = vscode.commands.registerCommand('codeAgent.wrapTryCatch', () => {
    withEditor(editor => {
      const sel = getSelection(editor);
      if (!sel) { showWarn('Selecciona el codigo a envolver'); return; }
      const indent = sel.text.match(/^\s*/)[0];
      const wrapped = `try {\n${sel.text.split('\n').map(l => `${indent}  ${l.trim()}`).join('\n')}\n${indent}} catch (error) {\n${indent}  console.error('Error:', error);\n${indent}  throw error;\n${indent}}`;
      editor.edit(eb => eb.replace(sel.range, wrapped));
    });
  });
  context.subscriptions.push(disposable);

  // --- EXTRACT MAGIC NUMBERS ---
  disposable = vscode.commands.registerCommand('codeAgent.extractMagicNumbers', () => {
    withEditor(editor => {
      const sel = getSelection(editor);
      const range = sel ? sel.range : new vscode.Range(0, 0, editor.document.lineCount, 0);
      const text = sel ? sel.text : editor.document.getText();
      const numbers = [...new Set(text.match(/\b\d{2,}\b/g))].filter(n => n !== '0' && n !== '1');
      if (numbers.length === 0) { showInfo('No se encontraron numeros magicos'); return; }
      const constDeclarations = numbers.map(n => `const ${n}_${Date.now() % 1000} = ${n};`).join('\n');
      let newText = text;
      for (const n of numbers) {
        const re = new RegExp(`\\b${n}\\b`, 'g');
        newText = newText.replace(re, `${n}_${Date.now() % 1000}`);
      }
      newText = `${constDeclarations}\n\n${newText}`;
      editor.edit(eb => eb.replace(range, newText));
      showInfo(`${numbers.length} numero(s) magico(s) extraidos`);
    });
  });
  context.subscriptions.push(disposable);

  // --- DETECT DEAD CODE ---
  disposable = vscode.commands.registerCommand('codeAgent.removeDeadCode', () => {
    withEditor(editor => {
      const doc = editor.document;
      const text = doc.getText();
      const lines = text.split('\n');
      const deadLines = [];
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
        if (/function\s+\w+\s*\(/.test(trimmed)) {
          const name = trimmed.match(/function\s+(\w+)/)[1];
          const refs = text.match(new RegExp(`\\b${name}\\b`, 'g'));
          if (refs && refs.length === 1) deadLines.push({ line: i + 1, name, reason: 'Funcion definida pero nunca usada fuera de su definicion' });
        }
        if (/^\s*var\s+\w+/.test(trimmed)) {
          const name = trimmed.match(/var\s+(\w+)/)[1];
          const refs = text.match(new RegExp(`\\b${name}\\b`, 'g'));
          if (refs && refs.length === 1) deadLines.push({ line: i + 1, name, reason: 'Variable declarada con var pero no referenciada' });
        }
      }
      if (deadLines.length === 0) { showInfo('No se detecto codigo muerto'); return; }
      let commentText = '\n// TODO: Code Agent - Posible codigo muerto detectado:\n';
      for (const d of deadLines) commentText += `// Linea ${d.line}: ${d.reason}: ${d.name}\n`;
      const end = new vscode.Position(lines.length, 0);
      editor.edit(eb => eb.insert(end, commentText));
      showInfo(`${deadLines.length} posible(s) codigo(s) muerto(s) marcado(s)`);
    });
  });
  context.subscriptions.push(disposable);

  // --- ON SAVE ERROR CHECK ---
  if (getConfig().get('enableErrorCheck')) {
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => {
      if (doc.languageId === 'javascript' || doc.languageId === 'typescript' || doc.languageId === 'java' || doc.languageId === 'python') {
        const problems = detectProblems(doc.getText());
        if (problems.length > 0) {
          const warnings = problems.filter(p => p.severity === 'warning').length;
          const errors = problems.filter(p => p.severity === 'error').length;
          showInfo(`Guardado: ${problems.length} problema(s) (${errors} error(es), ${warnings} advertencia(s))`);
        }
      }
    }));
  }

  showInfo('Code Agent activado. Usa Ctrl+Alt+C/I/E para comandos rapidos.');
}

function deactivate() {}

module.exports = { activate, deactivate };
