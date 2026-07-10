// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'House Blend - Dark Roast', description: 'A bold blend of Arabica and Robusta beans with notes of dark chocolate, toasted nuts, and a hint of smokiness.', image_url: 'https://delivery-p149891-e1546482.adobeaemcloud.com/adobe/assets/urn:aaid:aem:5f861728-7e97-4513-ab01-d6d174f244d6', price: '$14.99', category: 'Coffee' },
  { name: 'House Blend - Medium Roast', description: 'A smooth roast with notes of caramel, toasted nuts, and fruitiness for a flavorful, aromatic cup.', image_url: 'https://delivery-p149891-e1546481.adobeaemcloud.com/adobe/assets/urn:aaid:aem:d6363ad1-7b18-4bf6-859c-899108e7fe5e', price: '$14.99', category: 'Coffee' },
  { name: 'Morning Muse - Light Roast', description: 'A Colombian roast pod with caramel, chocolate, and cherry flavor.', image_url: 'https://delivery-p149891-e1546481.adobeaemcloud.com/adobe/assets/urn:aaid:aem:0eff15fc-5599-4b47-8b52-cd1a788bc2da', price: '$3.99', category: 'Coffee' },
  { name: 'Fresco Original', description: 'A single-serve espresso machine merging modern elegance with artisanal precision for an effortless brew.', image_url: 'https://delivery-p149891-e1546481.adobeaemcloud.com/adobe/assets/urn:aaid:aem:8e7990e0-4758-4fe1-9357-9e6d7f555160', price: '$299.00', category: 'Machines' },
  { name: 'Fresco Deluxe', description: 'Triple-nozzle machine with timed brewing, adjustable grind coarseness, and custom drink settings.', image_url: 'https://delivery-p154720-e1630809.adobeaemcloud.com/adobe/assets/urn:aaid:aem:59d0ace8-675f-43d9-a28d-0adedf77791c', price: '$499.00', category: 'Machines' },
  { name: 'Insulated Travel Thermos', description: 'A high-quality thermos designed to keep beverages at the ideal temperature for hours.', image_url: 'https://delivery-p149891-e1546481.adobeaemcloud.com/adobe/assets/urn:aaid:aem:436797cd-8bb8-41c9-b299-1e963b4cc208', price: '$39.99', category: 'Accessories' },
  { name: 'Azure Elegance Milk Jug', description: 'A stylish, high-quality ceramic milk jug with a serene blue hue.', image_url: 'https://delivery-p149891-e1546481.adobeaemcloud.com/adobe/assets/urn:aaid:aem:2c229378-478b-4eee-a9b3-d945245c2b0e', price: '$9.99', category: 'Accessories' },
];

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#00647d', '#95351d', '#454545'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#00647d';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let products;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      products = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      products = structuredContent?.products || [];
    }
  } else {
    products = SAMPLE_DATA;
  }

  block.textContent = '';
  renderProducts(block, products, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderProducts(block, products, bridge) {
  const list = (products || []).slice(0, 6);

  const wrapper = document.createElement('div');
  wrapper.className = 'search-products-carousel-wrapper';

  const track = document.createElement('div');
  track.className = 'search-products-track';

  list.forEach((product, i) => {
    const card = document.createElement('div');
    card.className = 'search-products-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'search-products-image';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (product.image_url) {
      const img = document.createElement('img');
      img.src = product.image_url;
      img.alt = product.name || '';
      img.loading = 'lazy';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'search-products-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('h3');
    name.className = 'search-products-name';
    name.textContent = product.name || '';
    info.appendChild(name);

    const desc = document.createElement('p');
    desc.className = 'search-products-desc';
    desc.textContent = product.description || '';
    info.appendChild(desc);

    const meta = document.createElement('div');
    meta.className = 'search-products-meta';
    const price = document.createElement('span');
    price.className = 'search-products-price';
    price.textContent = product.price || '';
    meta.appendChild(price);
    if (product.category) {
      const badge = document.createElement('span');
      badge.className = 'search-products-badge';
      badge.style.cssText = `background:${ACCENT};`;
      badge.textContent = product.category;
      meta.appendChild(badge);
    }
    info.appendChild(meta);

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'search-products-cta';
    cta.style.cssText = `background:${ACCENT};`;
    cta.textContent = 'Shop Now';
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${product.name}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'search-products-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `search-products-arrow search-products-arrow-${dir}`;
    btn.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    btn.textContent = dir === 'left' ? '◀' : '▶';
    const scrollBy = () => {
      const card = track.querySelector('.search-products-card');
      const amount = card ? card.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };
    btn.addEventListener('click', scrollBy);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(); }
    });
    return btn;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    leftArrow.style.display = track.scrollLeft <= 1 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
