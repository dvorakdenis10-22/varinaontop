const BASE_PRICE = 10000;
const COLORS = [
  { name: 'Grafitová', hex: '#3a3d42', price: 0 },
  { name: 'Polární bílá', hex: '#f1f2f3', price: 0 },
  { name: 'Rubínová', hex: '#8a1f2b', price: 900 },
  { name: 'Hlubinná modrá', hex: '#1f3f73', price: 900 },
  { name: 'Šalvějová', hex: '#7d8f75', price: 1500 }
];
const MATERIALS = [
  { name: 'Standard', note: 'Základní provedení', price: 0 },
  { name: 'Karbon', note: 'Lehčí a pevnější', price: 2500 }
];
const SIZES = [
  { name: 'S', note: 'Kompaktní', price: 0 },
  { name: 'M', note: 'Univerzální', price: 500 },
  { name: 'L', note: 'Velká', price: 1000 }
];
const EXTRAS = [
  { name: 'Prodloužená záruka (5 let)', price: 1200 },
  { name: 'Gravírování jména', price: 800 },
  { name: 'Expresní doručení', price: 600 },
  { name: 'Dárkové balení', price: 400 }
];

const state = { color: 2, material: 0, size: 1, extras: [] };
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('cs-CZ') + ' Kč';
const plus = n => (n === 0 ? 'v ceně' : '+ ' + fmt(n));

function renderGroup(id, list, key, type) {
  const box = $(id);
  box.innerHTML = '';
  list.forEach((o, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-checked', state[key] === i ? 'true' : 'false');
    if (type === 'swatch') {
      b.className = 'swatch';
      b.style.setProperty('--c', o.hex);
      b.setAttribute('aria-label', o.name + ', ' + plus(o.price));
    } else {
      b.className = 'choice';
      b.innerHTML = o.name + '<small>' + o.note + ' · ' + plus(o.price) + '</small>';
    }
    b.addEventListener('click', () => { state[key] = i; update(type === 'swatch'); });
    box.appendChild(b);
  });
}

function renderExtras() {
  const box = $('extras');
  box.innerHTML = '';
  EXTRAS.forEach((e, i) => {
    const l = document.createElement('label');
    l.className = 'extra';
    l.innerHTML = '<span class="l"><input type="checkbox">' + e.name + '</span><span class="p">+ ' + fmt(e.price) + '</span>';
    l.querySelector('input').addEventListener('change', ev => {
      if (ev.target.checked) state.extras.push(i);
      else state.extras = state.extras.filter(x => x !== i);
      update(false);
    });
    box.appendChild(l);
  });
}

function calc() {
  const lines = [];
  const add = (label, price) => { if (price > 0) lines.push({ label, price }); };
  add('Barva ' + COLORS[state.color].name, COLORS[state.color].price);
  add('Provedení ' + MATERIALS[state.material].name, MATERIALS[state.material].price);
  add('Velikost ' + SIZES[state.size].name, SIZES[state.size].price);
  state.extras.forEach(i => add(EXTRAS[i].name, EXTRAS[i].price));
  return { lines, total: BASE_PRICE + lines.reduce((s, l) => s + l.price, 0) };
}

function update(colorChanged) {
  const c = COLORS[state.color];
  $('colorName').textContent = c.name;
  $('dot').style.background = c.hex;
  $('liveSpec').textContent = c.name + ' · ' + MATERIALS[state.material].name + ' · ' + SIZES[state.size].name;
  renderGroup('colors', COLORS, 'color', 'swatch');
  renderGroup('material', MATERIALS, 'material');
  renderGroup('size', SIZES, 'size');

  const { lines, total } = calc();
  $('basePrice').textContent = fmt(BASE_PRICE);
  $('summaryLines').innerHTML = lines.map(l => '<div class="row add"><span>' + l.label + '</span><span>+ ' + fmt(l.price) + '</span></div>').join('');
  const t = $('total');
  t.textContent = fmt(total);
  t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump');

  if (colorChanged) {
    const img = $('productImg');
    img.classList.add('swap');
    setTimeout(() => img.classList.remove('swap'), 300);
  }
}

$('buyBtn').addEventListener('click', () => {
  const { total } = calc();
  const extras = state.extras.map(i => EXTRAS[i].name).join(', ');
  $('modalText').textContent =
    'Varina – ' + COLORS[state.color].name + ', ' + MATERIALS[state.material].name + ', velikost ' + SIZES[state.size].name + '\n' +
    (extras ? 'Výbava navíc: ' + extras + '\n' : '') + 'Celkem: ' + fmt(total);
  $('modal').hidden = false;
});
$('closeBtn').addEventListener('click', () => { $('modal').hidden = true; });
$('modal').addEventListener('click', e => { if (e.target.id === 'modal') $('modal').hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('modal').hidden = true; });

renderExtras();
update(false);
