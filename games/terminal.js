/* Shared terminal engine for KWP game demos */
const T = {
  _out: null, _inp: null, _field: null, _handler: null, _lines: [],

  init() {
    this._out = document.getElementById('terminal-output');
    this._inp = document.getElementById('terminal-input');
    this._field = document.getElementById('input-field');
    this._field.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = this._field.value.trim();
        this._field.value = '';
        if (this._handler && val !== '') this._handler(val);
      }
    });
  },

  clear() { this._out.innerHTML = ''; this._lines = []; },

  print(text) {
    const div = document.createElement('div');
    div.innerHTML = text;
    this._out.appendChild(div);
    this._lines.push(text);
    this._out.scrollTop = this._out.scrollHeight;
  },

  br() { this.print(''); },

  prompt(handler) {
    this._handler = handler;
    this._inp.classList.remove('hidden');
    this._field.focus();
  },

  hidePrompt() { this._inp.classList.add('hidden'); this._handler = null; },

  gold(t) { return `<span class="gold">${t}</span>`; },
  teal(t) { return `<span class="teal">${t}</span>`; },
  red(t) { return `<span class="red">${t}</span>`; },
  dim(t) { return `<span class="dim">${t}</span>`; },
  green(t) { return `<span class="green">${t}</span>`; },
  cyan(t) { return `<span class="cyan">${t}</span>`; },
  bold(t) { return `<span class="bold">${t}</span>`; },
};
