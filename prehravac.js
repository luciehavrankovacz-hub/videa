// NEPTUN – vlastní přehrávač pro všechny naše videostránky.
// Ovládací pruh zmizí po 2,5 s bez pohybu myši (i když je video na pauze), zmizí i kurzor.
// Pohyb myši / dotyk / klávesa ho zase ukáže. Mezerník = pauza, šipky = ±5 s, F = celá obrazovka.
(function () {
  const css = `
  .np-wrap{position:relative;background:#000;outline:none;-webkit-tap-highlight-color:transparent}
  .np-wrap video{display:block;width:100%;background:#000}
  .np-wrap:fullscreen{display:flex;align-items:center}
  .np-wrap:fullscreen video{height:100%;object-fit:contain}
  .np-ui{position:absolute;inset:0;pointer-events:none;transition:opacity .35s}
  .np-skryt .np-ui{opacity:0}
  .np-skryt{cursor:none}
  .np-big{position:absolute;left:50%;top:50%;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;background:rgba(0,0,0,.55);border:3px solid rgba(255,255,255,.85);color:#fff;font-size:40px;display:flex;align-items:center;justify-content:center;pointer-events:auto;cursor:pointer;padding-left:6px;box-sizing:border-box}
  .np-hraje .np-big{display:none}
  .np-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;padding:26px 12px 10px;background:linear-gradient(transparent,rgba(0,0,0,.75));pointer-events:auto;font:600 14px 'Segoe UI',Arial,sans-serif;color:#fff}
  .np-bar button{background:none;border:0;color:#fff;font-size:20px;cursor:pointer;padding:4px 6px;line-height:1}
  .np-t{white-space:nowrap;font-variant-numeric:tabular-nums}
  .np-seek{flex:1;min-width:60px;accent-color:#ffd35a;cursor:pointer}
  @media(max-width:520px){.np-bar{gap:4px;padding:20px 6px 6px;font-size:12px}.np-bar button{font-size:18px;padding:2px 4px}.np-big{width:70px;height:70px;margin:-35px 0 0 -35px;font-size:30px}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  document.querySelectorAll('video').forEach(v => {
    const w = document.createElement('div'); w.className = 'np-wrap'; w.tabIndex = 0;
    v.parentNode.insertBefore(w, v); w.appendChild(v);
    v.controls = false; v.removeAttribute('controls'); v.setAttribute('playsinline', '');
    const ui = document.createElement('div'); ui.className = 'np-ui';
    ui.innerHTML = '<div class="np-big">▶</div><div class="np-bar"><button class="np-pp" title="Pustit / pauza">▶</button>' +
      '<span class="np-t">0:00 / 0:00</span><input class="np-seek" type="range" min="0" max="1000" value="0" aria-label="Posun">' +
      '<button class="np-mute" title="Zvuk">🔊</button><button class="np-fs" title="Celá obrazovka">⛶</button></div>';
    w.appendChild(ui);
    const $ = s => ui.querySelector(s), pp = $('.np-pp'), seek = $('.np-seek'), t = $('.np-t'), mute = $('.np-mute');
    let timer = null, tahne = false;
    const zacalo = () => v.currentTime > 0 || !v.paused;
    function ukaz() {
      w.classList.remove('np-skryt'); clearTimeout(timer);
      timer = setTimeout(() => { if (!tahne && zacalo()) w.classList.add('np-skryt'); }, 2500);
    }
    const prepni = () => { if (v.paused) v.play().catch(() => {}); else v.pause(); };
    ['mousemove', 'touchstart', 'keydown', 'click'].forEach(e => w.addEventListener(e, ukaz, { passive: true }));
    w.addEventListener('mouseleave', () => { if (zacalo()) { clearTimeout(timer); w.classList.add('np-skryt'); } });
    v.addEventListener('click', () => { if (w.classList.contains('np-skryt')) return; prepni(); });
    $('.np-big').addEventListener('click', e => { e.stopPropagation(); prepni(); });
    pp.addEventListener('click', prepni);
    v.addEventListener('play', () => { w.classList.add('np-hraje'); pp.textContent = '❚❚'; ukaz(); });
    v.addEventListener('pause', () => { w.classList.remove('np-hraje'); pp.textContent = '▶'; ukaz(); });
    const obnov = () => { t.textContent = fmt(v.currentTime) + ' / ' + fmt(v.duration); if (!tahne && v.duration) seek.value = Math.round(v.currentTime / v.duration * 1000); };
    v.addEventListener('timeupdate', obnov); v.addEventListener('loadedmetadata', obnov);
    seek.addEventListener('input', () => { tahne = true; if (v.duration) { v.currentTime = seek.value / 1000 * v.duration; obnov(); } });
    seek.addEventListener('change', () => { tahne = false; ukaz(); });
    mute.addEventListener('click', () => { v.muted = !v.muted; mute.textContent = v.muted ? '🔇' : '🔊'; });
    $('.np-fs').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (w.requestFullscreen) w.requestFullscreen().catch(() => { if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); });
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();   // iPhone
    });
    w.addEventListener('dblclick', () => $('.np-fs').click());
    w.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); prepni(); }
      else if (e.key === 'ArrowRight') v.currentTime += 5;
      else if (e.key === 'ArrowLeft') v.currentTime -= 5;
      else if (e.key === 'f') $('.np-fs').click();
    });
  });
})();
