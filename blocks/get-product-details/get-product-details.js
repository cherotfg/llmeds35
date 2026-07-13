// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from the awaited bridge.toolResult promise property.
const SAMPLE_DATA = {
  name: 'Nike Vomero Premium',
  description: "Men's road running shoe with premium cushioning.",
  image_url: 'https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/f7c0fa1f-1166-4df8-a9bd-dc3c5c030955/NIKE+VOMERO+PREMIUM.png',
  price: '$320',
  category: 'Running Shoes',
};

// Brand palette from BuildWidgetRequest (empty here → fallback dark strip).
const PALETTE = [];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (r, g, b) => 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  renderDetail(block, item, bridge);

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

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'detail-card';

  // Image (left)
  const imageWrap = document.createElement('div');
  imageWrap.className = 'detail-image';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }
  card.appendChild(imageWrap);

  // Content (right)
  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  if (item.category) {
    const badge = document.createElement('span');
    badge.className = 'detail-badge';
    badge.textContent = item.category;
    content.appendChild(badge);
  }

  const name = document.createElement('h3');
  name.className = 'detail-name';
  name.textContent = item.name || '';
  content.appendChild(name);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'detail-desc';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'detail-price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  const cta = document.createElement('button');
  cta.className = 'detail-cta';
  cta.type = 'button';
  cta.textContent = 'Shop Now';
  if (bridge) {
    cta.addEventListener('click', () => {
      if (item.source_url) {
        bridge.openLink(item.source_url);
      } else {
        bridge.sendMessage(`Tell me more about ${item.name || 'this product'}`);
      }
    });
  }
  content.appendChild(cta);

  card.appendChild(content);
  block.appendChild(card);
}
