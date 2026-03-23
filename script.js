// ============================================================
// THEME TOGGLE (FIXED BUTTONS) - Supporting Multiple Themes
// ============================================================
function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  
  const btnDark = document.getElementById('btnDark');
  const btnLight = document.getElementById('btnLight');
  const btnDracula = document.getElementById('btnDracula');
  const btnMocha = document.getElementById('btnMocha');
  const btnNordic = document.getElementById('btnNordic');
  
  if (btnDark) btnDark.classList.toggle('active', theme === 'dark');
  if (btnLight) btnLight.classList.toggle('active', theme === 'light');
  if (btnDracula) btnDracula.classList.toggle('active', theme === 'dracula');
  if (btnMocha) btnMocha.classList.toggle('active', theme === 'mocha');
  if (btnNordic) btnNordic.classList.toggle('active', theme === 'nordic');
  
  localStorage.setItem('cp-theme', theme);
}

document.getElementById('btnDark').addEventListener('click', () => setTheme('dark'));
document.getElementById('btnLight').addEventListener('click', () => setTheme('light'));
document.getElementById('btnDracula').addEventListener('click', () => setTheme('dracula'));
document.getElementById('btnMocha').addEventListener('click', () => setTheme('mocha'));
document.getElementById('btnNordic').addEventListener('click', () => setTheme('nordic'));

const savedTheme = localStorage.getItem('cp-theme') || 'dark';
setTheme(savedTheme);

// ============================================================
// SIMPLIFIED TOKENIZER ENGINE (robust fallback + core languages)
// ============================================================
function tokenizeSimple(code, lang) {
  // fallback: just return plain text as variable tokens
  const lines = code.split('\n');
  const tokens = [];
  for (let line of lines) {
    tokens.push({ type: 'variable', text: line });
    tokens.push({ type: 'variable', text: '\n' });
  }
  return tokens;
}

// Full featured tokenizer for JS/TS/Python/CPP etc - using regex map
function createTokenizer(rules) {
  return function(code) {
    let tokens = [];
    let i = 0;
    const len = code.length;
    while (i < len) {
      let matched = false;
      for (let [type, regex] of rules) {
        regex.lastIndex = i;
        const match = regex.exec(code);
        if (match && match.index === i) {
          tokens.push({ type, text: match[0] });
          i += match[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        tokens.push({ type: 'variable', text: code[i] });
        i++;
      }
    }
    return tokens;
  };
}

// language specific rule sets (compact but powerful)
function getLangTokenizer(lang) {
  const baseRules = [
    ['comment', /\/\/[^\n]*/y], ['comment', /\/\*[\s\S]*?\*\//y],
    ['string', /"(?:[^"\\]|\\.)*"/y], ['string', /'(?:[^'\\]|\\.)*'/y],
    ['number', /\b\d+\.?\d*([eE][+-]?\d+)?\b/y], ['number', /\b0[xX][0-9a-fA-F]+\b/y]
  ];
  if (lang === 'javascript' || lang === 'typescript') {
    const kw = /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|false|finally|for|function|if|import|in|instanceof|let|new|null|return|super|switch|this|throw|true|try|typeof|var|void|while|with|yield|async|await)\b/y;
    const rules = [...baseRules, ['keyword', kw], ['fn', /\b([a-zA-Z_$]\w*)\s*(?=\()/y], ['class', /\b([A-Z][a-zA-Z0-9_]*)\b/y], ['variable', /\b[a-zA-Z_$]\w*\b/y], ['operator', /[+\-*/%=!<>&|^~?:]+/y], ['punct', /[{}[\]();,.]/y]];
    return createTokenizer(rules);
  }
  if (lang === 'python') {
    const kw = /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b/y;
    const rules = [...baseRules, ['comment', /#[^\n]*/y], ['string', /"""[\s\S]*?"""/y], ['string', /'''[\s\S]*?'''/y], ['keyword', kw], ['builtin', /\b(print|len|range|str|int|float|list|dict|set|tuple|zip|map|filter|sum|max|min)\b/y], ['fn', /\b([a-zA-Z_]\w*)\s*(?=\()/y], ['class', /\b([A-Z][a-zA-Z0-9_]*)\b/y], ['variable', /\b[a-zA-Z_]\w*\b/y], ['operator', /[+\-*/%=!<>&|^~@?:]+/y], ['punct', /[{}[\]();,.]/y]];
    return createTokenizer(rules);
  }
  if (lang === 'cpp' || lang === 'c') {
    const kw = /\b(auto|break|case|const|continue|default|do|else|enum|extern|for|goto|if|inline|return|sizeof|static|struct|switch|typedef|union|volatile|while|void|int|char|float|double|long|short|unsigned|signed|class|namespace|public|private|protected|virtual|new|delete)\b/y;
    const rules = [...baseRules, ['macro', /#[a-z_]+/y], ['keyword', kw], ['fn', /\b([a-zA-Z_]\w*)\s*(?=\()/y], ['class', /\b([A-Z][a-zA-Z0-9_]*)\b/y], ['variable', /\b[a-zA-Z_]\w*\b/y], ['operator', /[+\-*/%=!<>&|^~?:]+/y], ['punct', /[{}[\]();,.]/y]];
    return createTokenizer(rules);
  }
  // default generic
  const rules = [...baseRules, ['variable', /\b[a-zA-Z_]\w*\b/y], ['operator', /[+\-*/%=!<>&|^~?:]+/y], ['punct', /[{}[\]();,.]/y]];
  return createTokenizer(rules);
}

function tokenizeCode(code, lang) {
  const tokenizer = getLangTokenizer(lang);
  try {
    return tokenizer(code);
  } catch(e) { return tokenizeSimple(code, lang); }
}

// ============================================================
// RENDER CODE with line numbers
// ============================================================
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderCode(code, lang, lineNumbers) {
  const lines = code.split('\n');
  const tokens = tokenizeCode(code, lang);
  // rebuild lines with tokens
  let lineMap = Array(lines.length).fill().map(() => []);
  let currentLine = 0;
  let col = 0;
  for (let token of tokens) {
    const parts = token.text.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) { currentLine++; col = 0; }
      if (parts[i].length > 0) {
        lineMap[currentLine].push({ type: token.type, text: parts[i] });
      }
    }
  }
  const padLen = String(lines.length).length;
  if (lineNumbers) {
    let rows = '';
    for (let i = 0; i < lines.length; i++) {
      const toks = lineMap[i] || [];
      const lineHtml = toks.map(t => `<span class="tok-${t.type}">${escapeHtml(t.text)}</span>`).join('');
      rows += `<tr><td class="ln">${String(i+1).padStart(padLen, ' ')}</td><td class="lc">${lineHtml || ' '}</td></tr>`;
    }
    return `<table class="code-table">${rows}</table>`;
  } else {
    return lines.map((_, i) => (lineMap[i] || []).map(t => `<span class="tok-${t.type}">${escapeHtml(t.text)}</span>`).join('')).join('\n');
  }
}

// build preview HTML
function buildPreviewHTML() {
  const code = document.getElementById('codeInput').value;
  const lang = document.getElementById('langSel').value;
  const lineNums = document.getElementById('lineNumsCb').checked;
  const showHeader = document.getElementById('showHeaderCb').checked;
  const title = document.getElementById('titleIn').value.trim() || 'Code Listing';
  const now = new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  const headerHtml = showHeader ? `
    <div class="pdf-doc-header">
      <div class="pdf-doc-title">${escapeHtml(title)}</div>
      <div class="pdf-doc-meta">
        <span>📅 ${now}</span>
        <span class="lang-chip">${escapeHtml(lang.toUpperCase())}</span>
      </div>
    </div>` : '';
  const codeHtml = renderCode(code, lang, lineNums);
  return headerHtml + `<pre class="code-block"><code>${codeHtml}</code></pre>`;
}

// ============================================================
// APPLY PDF THEME TO PREVIEW
// ============================================================
function applyPdfThemeToPreview(themeChoice) {
  const chosen = (themeChoice === 'match') ? document.body.getAttribute('data-theme') : themeChoice;
  const panel = document.getElementById('previewPanel');
  
  // Theme color definitions
  const themeColors = {
    light: {
      bg: '#ffffff', text: '#1e1e1e', border: '#d4d4d4', muted: '#6b7280', accent: '#007acc',
      kw: '#0000ff', ty: '#267f99', st: '#a31515', nu: '#098658', co: '#008000', fn: '#795e26', va: '#1e1e1e',
      op: '#1e1e1e', pu: '#1e1e1e', ma: '#af00db', bu: '#267f99', tg: '#800000', at: '#ff0000', vl: '#0451a5',
      pr: '#001080', sl: '#800000', cl: '#267f99', ln: '#237893'
    },
    dark: {
      bg: '#1e1e1e', text: '#d4d4d4', border: '#333333', muted: '#858585', accent: '#007acc',
      kw: '#c586c0', ty: '#4ec9b0', st: '#ce9178', nu: '#b5cea8', co: '#6a9955', fn: '#dcdcaa', va: '#d4d4d4',
      op: '#d4d4d4', pu: '#d4d4d4', ma: '#c586c0', bu: '#4fc1ff', tg: '#569cd6', at: '#9cdcfe', vl: '#ce9178',
      pr: '#9cdcfe', sl: '#d7ba7d', cl: '#4ec9b0', ln: '#858585'
    },
    dracula: {
      bg: '#21222c', text: '#f8f8f2', border: '#44475a', muted: '#6272a4', accent: '#8be9fd',
      kw: '#ff79c6', ty: '#8be9fd', st: '#f1fa8c', nu: '#bd93f9', co: '#6272a4', fn: '#50fa7b', va: '#f8f8f2',
      op: '#ff79c6', pu: '#f8f8f2', ma: '#ff79c6', bu: '#8be9fd', tg: '#ff79c6', at: '#50fa7b', vl: '#f1fa8c',
      pr: '#8be9fd', sl: '#50fa7b', cl: '#8be9fd', ln: '#6272a4'
    },
    mocha: {
      bg: '#313244', text: '#cdd6f4', border: '#45475a', muted: '#a6adc8', accent: '#89b4fa',
      kw: '#f38ba8', ty: '#89b4fa', st: '#a6e3a1', nu: '#fab387', co: '#585b70', fn: '#f38ba8', va: '#cdd6f4',
      op: '#f38ba8', pu: '#cdd6f4', ma: '#f38ba8', bu: '#89b4fa', tg: '#f38ba8', at: '#a6e3a1', vl: '#a6e3a1',
      pr: '#89b4fa', sl: '#a6e3a1', cl: '#89b4fa', ln: '#6c7086'
    },
    nordic: {
      bg: '#3b4252', text: '#eceff4', border: '#4c566a', muted: '#81a1c1', accent: '#88c0d0',
      kw: '#81a1c1', ty: '#8fbcbb', st: '#a3be8c', nu: '#b48ead', co: '#616e88', fn: '#88c0d0', va: '#eceff4',
      op: '#81a1c1', pu: '#eceff4', ma: '#b48ead', bu: '#88c0d0', tg: '#81a1c1', at: '#8fbcbb', vl: '#a3be8c',
      pr: '#88c0d0', sl: '#a3be8c', cl: '#8fbcbb', ln: '#616e88'
    }
  };
  
  const colors = themeColors[chosen] || themeColors.dark;
  
  // Apply CSS variables to preview panel
  panel.style.setProperty('--pdf-bg', colors.bg);
  panel.style.setProperty('--pdf-text', colors.text);
  panel.style.setProperty('--pdf-border', colors.border);
  panel.style.setProperty('--pdf-muted', colors.muted);
  panel.style.setProperty('--pdf-accent', colors.accent);
  panel.style.setProperty('--pdf-tok-keyword', colors.kw);
  panel.style.setProperty('--pdf-tok-type', colors.ty);
  panel.style.setProperty('--pdf-tok-string', colors.st);
  panel.style.setProperty('--pdf-tok-number', colors.nu);
  panel.style.setProperty('--pdf-tok-comment', colors.co);
  panel.style.setProperty('--pdf-tok-fn', colors.fn);
  panel.style.setProperty('--pdf-tok-variable', colors.va);
  panel.style.setProperty('--pdf-tok-operator', colors.op);
  panel.style.setProperty('--pdf-tok-punct', colors.pu);
  panel.style.setProperty('--pdf-tok-macro', colors.ma);
  panel.style.setProperty('--pdf-tok-builtin', colors.bu);
  panel.style.setProperty('--pdf-tok-tag', colors.tg);
  panel.style.setProperty('--pdf-tok-attr', colors.at);
  panel.style.setProperty('--pdf-tok-value', colors.vl);
  panel.style.setProperty('--pdf-tok-prop', colors.pr);
  panel.style.setProperty('--pdf-tok-selector', colors.sl);
  panel.style.setProperty('--pdf-tok-class', colors.cl);
  panel.style.setProperty('--pdf-tok-linenum', colors.ln);
}

// ============================================================
// PREVIEW & EXPORT FUNCTIONS
// ============================================================
function doPreview() {
  const code = document.getElementById('codeInput').value.trim();
  if (!code) { showStatus('⚠ Paste some code first', 'err'); return; }
  document.getElementById('previewContent').innerHTML = buildPreviewHTML();
  const panel = document.getElementById('previewPanel');
  const themeChoice = document.getElementById('printThemeSel').value;
  applyPdfThemeToPreview(themeChoice);
  panel.classList.add('show');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showStatus('✓ Preview ready', 'ok');
}

function closePreview() {
  document.getElementById('previewPanel').classList.remove('show');
}

// ============================================================
// PDF THEME VARIABLES FOR DIFFERENT THEMES
// ============================================================
function getPrintThemeVars(themeChoice) {
  const chosen = (themeChoice === 'match') ? document.body.getAttribute('data-theme') : themeChoice;
  
  // Light theme
  if (chosen === 'light') {
    return { codeBg:'#ffffff', text:'#1e1e1e', border:'#d4d4d4', muted:'#6b7280', accent:'#007acc',
      kw:'#0000ff', ty:'#267f99', st:'#a31515', nu:'#098658', co:'#008000', fn:'#795e26', va:'#1e1e1e',
      op:'#1e1e1e', pu:'#1e1e1e', ma:'#af00db', bu:'#267f99', tg:'#800000', at:'#ff0000', vl:'#0451a5',
      pr:'#001080', sl:'#800000', cl:'#267f99', ln:'#237893' };
  }
  
  // Dracula theme
  if (chosen === 'dracula') {
    return { codeBg:'#21222c', text:'#f8f8f2', border:'#44475a', muted:'#6272a4', accent:'#8be9fd',
      kw:'#ff79c6', ty:'#8be9fd', st:'#f1fa8c', nu:'#bd93f9', co:'#6272a4', fn:'#50fa7b', va:'#f8f8f2',
      op:'#ff79c6', pu:'#f8f8f2', ma:'#ff79c6', bu:'#8be9fd', tg:'#ff79c6', at:'#50fa7b', vl:'#f1fa8c',
      pr:'#8be9fd', sl:'#50fa7b', cl:'#8be9fd', ln:'#6272a4' };
  }
  
  // Mocha theme
  if (chosen === 'mocha') {
    return { codeBg:'#313244', text:'#cdd6f4', border:'#45475a', muted:'#a6adc8', accent:'#89b4fa',
      kw:'#f38ba8', ty:'#89b4fa', st:'#a6e3a1', nu:'#fab387', co:'#585b70', fn:'#f38ba8', va:'#cdd6f4',
      op:'#f38ba8', pu:'#cdd6f4', ma:'#f38ba8', bu:'#89b4fa', tg:'#f38ba8', at:'#a6e3a1', vl:'#a6e3a1',
      pr:'#89b4fa', sl:'#a6e3a1', cl:'#89b4fa', ln:'#6c7086' };
  }
  
  // Nordic theme
  if (chosen === 'nordic') {
    return { codeBg:'#3b4252', text:'#eceff4', border:'#4c566a', muted:'#81a1c1', accent:'#88c0d0',
      kw:'#81a1c1', ty:'#8fbcbb', st:'#a3be8c', nu:'#b48ead', co:'#616e88', fn:'#88c0d0', va:'#eceff4',
      op:'#81a1c1', pu:'#eceff4', ma:'#b48ead', bu:'#88c0d0', tg:'#81a1c1', at:'#8fbcbb', vl:'#a3be8c',
      pr:'#88c0d0', sl:'#a3be8c', cl:'#8fbcbb', ln:'#616e88' };
  }
  
  // Default: Dark theme
  return { codeBg:'#1e1e1e', text:'#d4d4d4', border:'#333333', muted:'#858585', accent:'#007acc',
    kw:'#c586c0', ty:'#4ec9b0', st:'#ce9178', nu:'#b5cea8', co:'#6a9955', fn:'#dcdcaa', va:'#d4d4d4',
    op:'#d4d4d4', pu:'#d4d4d4', ma:'#c586c0', bu:'#4fc1ff', tg:'#569cd6', at:'#9cdcfe', vl:'#ce9178',
    pr:'#9cdcfe', sl:'#d7ba7d', cl:'#4ec9b0', ln:'#858585' };
}

// export PDF using browser print
function doPrint() {
  const code = document.getElementById('codeInput').value.trim();
  if (!code) { showStatus('⚠ No code to export', 'err'); return; }
  // refresh preview content to match latest options
  document.getElementById('previewContent').innerHTML = buildPreviewHTML();
  document.getElementById('previewPanel').classList.add('show');
  const themeChoice = document.getElementById('printThemeSel').value;
  const vars = getPrintThemeVars(themeChoice);
  const filename = document.getElementById('filenameIn').value.trim() || 'code';
  const content = buildPreviewHTML();
  
  // Apply theme to preview as well
  applyPdfThemeToPreview(themeChoice);
  
  const printWin = window.open('', '_blank');
  printWin.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${escapeHtml(filename)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Outfit:wght@700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{background:${vars.codeBg};color:${vars.text};font-family:'JetBrains Mono',monospace;}
.pdf-doc-header{padding:20px 24px 16px;border-bottom:2px solid ${vars.border};display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;background:${vars.codeBg};}
.pdf-doc-title{font-size:1.25rem;font-weight:800;font-family:'Outfit',sans-serif;color:${vars.text};}
.pdf-doc-meta{display:flex;gap:12px;font-size:.75rem;color:${vars.muted};font-family:'Outfit',sans-serif;}
.lang-chip{background:${vars.accent};color:#fff;border-radius:5px;padding:2px 8px;font-size:.68rem;font-weight:700;}
pre.code-block{padding:20px 24px;background:${vars.codeBg};white-space:pre-wrap;word-break:break-word;}
code{font-family:'JetBrains Mono',monospace;font-size:9pt;line-height:1.8;}
table.code-table{border-collapse:collapse;width:100%;table-layout:fixed;}
.ln{width:44px;color:${vars.ln};text-align:right;padding-right:16px;border-right:1px solid ${vars.border};vertical-align:top;font-size:8pt;line-height:1.8;}
.lc{padding-left:16px;white-space:pre-wrap;word-break:break-word;}
.tok-keyword{color:${vars.kw};font-weight:600;}.tok-type{color:${vars.ty};}.tok-string{color:${vars.st};}
.tok-number{color:${vars.nu};}.tok-comment{color:${vars.co};font-style:italic;}.tok-fn{color:${vars.fn};}
.tok-variable{color:${vars.va};}.tok-operator{color:${vars.op};}.tok-punct{color:${vars.pu};}.tok-macro{color:${vars.ma};}
.tok-builtin{color:${vars.bu};}.tok-tag{color:${vars.tg};font-weight:600;}.tok-attr{color:${vars.at};}
.tok-value{color:${vars.vl};}.tok-prop{color:${vars.pr};}.tok-selector{color:${vars.sl};}.tok-class{color:${vars.cl};}
@page{size:auto;margin:12mm;}
@media print{*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;} tr{page-break-inside:avoid;}}
</style></head><body>${content}<script>window.onload=()=>setTimeout(()=>window.print(),300);<\/script></body></html>`);
  printWin.document.close();
  showStatus('🖨 Print dialog opened — choose "Save as PDF"', 'ok');
}

// ============================================================
// STATUS HELPER
// ============================================================
let statusTimer;
function showStatus(msg, type) {
  clearTimeout(statusTimer);
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = `status show ${type}`;
  statusTimer = setTimeout(() => el.className = 'status', 5000);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.getElementById('previewBtn').addEventListener('click', doPreview);
document.getElementById('exportPdfBtn').addEventListener('click', doPrint);
document.getElementById('closePreviewBtn').addEventListener('click', closePreview);

// auto refresh preview when options change while preview visible
const refreshIfPreview = () => {
  if (document.getElementById('previewPanel').classList.contains('show')) doPreview();
};

// also refresh preview when PDF theme changes
const refreshPreviewTheme = () => {
  if (document.getElementById('previewPanel').classList.contains('show')) {
    const themeChoice = document.getElementById('printThemeSel').value;
    applyPdfThemeToPreview(themeChoice);
  }
};

document.getElementById('langSel').addEventListener('change', refreshIfPreview);
document.getElementById('lineNumsCb').addEventListener('change', refreshIfPreview);
document.getElementById('showHeaderCb').addEventListener('change', refreshIfPreview);
document.getElementById('titleIn').addEventListener('input', refreshIfPreview);
document.getElementById('printThemeSel').addEventListener('change', refreshPreviewTheme);
