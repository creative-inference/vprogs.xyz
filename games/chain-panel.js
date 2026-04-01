/* ============================================================
   KWP Game Demos — BlockDAG Activity Panel
   Live TN12 block feed via REST API.
   Links transactions to tn12.kaspa.stream.
   ============================================================ */

const TN12_API = 'https://api-tn12.kaspa.org';
const EXPLORER = 'https://tn12.kaspa.stream';

const Chain = {
  _feed: null,
  _statusEl: null,
  _maxEntries: 30,
  _lastDaa: 0,
  _connected: false,

  init() {
    this._feed = document.getElementById('chain-feed');
    this._statusEl = document.getElementById('chain-status');
    if (!this._feed) return;
    this._connect();
    setInterval(() => this._poll(), 5000);
  },

  async _connect() {
    try {
      const resp = await fetch(`${TN12_API}/info/blockdag`);
      const dag = await resp.json();
      this._lastDaa = dag.virtualDaaScore;
      this._connected = true;
      if (this._statusEl) this._statusEl.innerHTML = '<span class="cd-live"></span> TN12 LIVE';
      this._addInfo(`${dag.networkName} — DAA: ${dag.virtualDaaScore}`);
    } catch {
      this._connected = false;
      if (this._statusEl) this._statusEl.innerHTML = '<span class="cd-off"></span> OFFLINE';
      this._addInfo('TN12 unavailable — showing simulated data');
    }
  },

  async _poll() {
    try {
      const dag = await fetch(`${TN12_API}/info/blockdag`).then(r => r.json());
      if (dag.virtualDaaScore > this._lastDaa) {
        const delta = dag.virtualDaaScore - this._lastDaa;
        this._lastDaa = dag.virtualDaaScore;
        const hash = dag.tipHashes?.[0] || '';
        this._addBlock(hash, delta, dag.tipHashes?.length || 1, dag.virtualDaaScore);
      }
    } catch {}
  },

  _ts() { return new Date().toTimeString().slice(0, 8); },

  _addInfo(text) {
    if (!this._feed) return;
    const el = document.createElement('div');
    el.className = 'ce';
    el.innerHTML = `<span class="ce-t">${this._ts()}</span> ${text}`;
    this._feed.appendChild(el);
    this._trim();
  },

  _addBlock(hash, delta, tips, daa) {
    if (!this._feed) return;
    const shortHash = hash.slice(0, 14);
    const link = hash ? `<a href="${EXPLORER}/blocks/${hash}" target="_blank" class="ce-link">${shortHash}...</a>` : '';
    const el = document.createElement('div');
    el.className = 'ce';
    el.innerHTML = `<span class="ce-t">${this._ts()}</span> +${delta} blk ${link} <span class="ce-d">${tips}t DAA:${daa}</span>`;
    this._feed.appendChild(el);
    this._trim();
    this._feed.scrollTop = this._feed.scrollHeight;
  },

  emitTx(action, detail, txId) {
    if (!this._feed) return;
    const txLink = txId
      ? `<a href="${EXPLORER}/transactions/${txId}" target="_blank" class="ce-link">${txId.substring(0, 18)}...</a>`
      : '<span class="ce-d">(simulated)</span>';
    const el = document.createElement('div');
    el.className = 'ce ce-tx';
    el.innerHTML = `<span class="ce-t">${this._ts()}</span> <span class="ce-cov">COV</span> ${action} ${txLink}`;
    if (detail) {
      const d = document.createElement('div');
      d.className = 'ce-detail';
      d.textContent = '  ' + detail;
      el.appendChild(d);
    }
    this._feed.appendChild(el);
    this._trim();
    this._feed.scrollTop = this._feed.scrollHeight;
  },

  _trim() {
    while (this._feed && this._feed.children.length > this._maxEntries) {
      this._feed.removeChild(this._feed.firstChild);
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Chain.init());
} else {
  Chain.init();
}
