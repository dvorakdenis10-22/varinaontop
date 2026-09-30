// ====== DATA (sem si upravíš ceny, názvy a barvy) ======
const BASE_PRICE = 10000;

const COLORS = [
  { name: 'Grafitová',  hex: '#3a3d42', price: 0 },
  { name: 'Polární bílá', hex: '#f1f2f3', price: 0 },
  { name: 'Rubínová',   hex: '#9c1b2f', price: 900 },
  { name: 'Hlubinná modrá', hex: '#1f3f73', price: 900 },
  { name: 'Šalvějová',  hex: '#7d8f75', price: 1500 },
];
const MATERIALS = [
  { name: 'Standard', note: 'Základní provedení', price: 0 },
  { name: 'Karbon',   note: 'Lehčí a pevnější',   price: 2500 },
];
const SIZES = [
  { name: 'S', note: 'Kompaktní', price: 0 },
  { name: 'M', note: 'Univerzální', price: 500 },
  { name: 'L', note: 'Velká', price: 1000 },
];
const EXTRAS = [
  { name: 'Prodloužená záruka (5 let)', price: 1200 },
  { name: 'Gravírování jména',          price: 800 },
  { name: 'Expresní doručení',          price: 600 },
  { name: 'Dárkové balení',             price: 400 },
];

// ====== STAV ======
const state = { color: 2, material: 0, size: 1, extras: new Set() };

const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('cs-CZ') + ' Kč';
const plus = n => n === 0 ? 'v ceně' : '+ ' + fmt(n);

// ====== VYKRESLENÍ VOLEB ======
function renderColors() {
  $('colors').innerHTML = '';
  COLORS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.style.setProperty('--c', c.hex);
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', `${c.name}, ${plus(c.price)}`);
    b.setAttribute('aria-checked', state.color === i);
    b.onclick = () => { state.color = i; update(true); };
    $('colors').appendChild(b);
  });
}
function renderChoices(id, list, key) {
  $(id).innerHTML = '';
  list.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', state[key] === i);
    b.innerHTML = `${o.name}<small>${o.note} · ${plus(o.price)}</small>`;
    b.onclick = () => { state[key] = i; update(); };
    $(id).appendChild(b);
  });
}
function renderExtras() {
  $('extras').innerHTML = '';
  EXTRAS.forEach((e, i) => {
    const l = document.createElement('label');
    l.className = 'extra';
    l.innerHTML = `<span class="l"><input type="checkbox" ${state.extras.has(i) ? 'checked' : ''}>${e.name}</span><span class="p">+ ${fmt(e.price)}</span>`;
    l.querySelector('input').onchange = ev => {
      ev.target.checked ? state.extras.add(i) : state.extras.delete(i);
      update();
    };
    $('extras').appendChild(l);
  });
}

// ====== VÝPOČET A AKTUALIZACE ======
function calc() {
  const lines = [];
  const add = (label, price) => price > 0 && lines.push({ label, price });
  add('Barva ' + COLORS[state.color].name, COLORS[state.color].price);
  add('Provedení ' + MATERIALS[state.material].name, MATERIALS[state.material].price);
  add('Velikost ' + SIZES[state.size].name, SIZES[state.size].price);
  state.extras.forEach(i => add(EXTRAS[i].name, EXTRAS[i].price));
  const total = BASE_PRICE + lines.reduce((s, l) => s + l.price, 0);
  return { lines, total };
}

function update(colorChanged) {
  const c = COLORS[state.color];
  document.documentElement.style.setProperty('--glow', c.hex);
  $('colorName').textContent = c.name;
  $('liveSpec').textContent = `${c.name} · ${MATERIALS[state.material].name} · ${SIZES[state.size].name}`;
  renderColors();
  renderChoices('material', MATERIALS, 'material');
  renderChoices('size', SIZES, 'size');

  const { lines, total } = calc();
  $('basePrice').textContent = fmt(BASE_PRICE);
  $('summaryLines').innerHTML = lines
    .map(l => `<div class="row add"><span>${l.label}</span><span>+ ${fmt(l.price)}</span></div>`).join('');
  const t = $('total');
  t.textContent = fmt(total);
  t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump');

  if (colorChanged) {
    const img = $('productImg');
    img.classList.add('swap');
    setTimeout(() => img.classList.remove('swap'), 250);
  }
}

// ====== OBRÁZEK (fallback, když soubor chybí) ======
$('productImg').addEventListener('error', () => {
  $('productImg').hidden = true;
  $('placeholder').hidden = false;
});

// ====== OBJEDNÁVKA ======
$('buyBtn').onclick = () => {
  const { lines, total } = calc();
  const c = COLORS[state.color];
  $('modalText').textContent =
    `Varina – ${c.name}, ${MATERIALS[state.material].name}, velikost ${SIZES[state.size].name}\n` +
    (state.extras.size ? `Výbava navíc: ${[...state.extras].map(i => EXTRAS[i].name).join(', ')}\n` : '') +
    `Celkem: ${fmt(total)}`;
  $('modal').hidden = false;
  $('closeBtn').focus();
};
$('closeBtn').onclick = () => $('modal').hidden = true;
$('modal').onclick = e => { if (e.target.id === 'modal') $('modal').hidden = true; };
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('modal').hidden = true; });

// ====== START ======
renderExtras();
update();
