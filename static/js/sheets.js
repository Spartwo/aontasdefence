/* ============================================================
   sheets.js — Google Sheets data fetching and all renderers:
               Products (Land/Sea/Air/Space), Members,
               Events timeline, Figures/stats, News ticker,
               Customer marquee.
   ============================================================ */

/* ---- Core fetch helper ---- */

const SHEET_ID = '1bufxpfFuo2uwBqzH740yfvy7D4aqnQmi7EiUD6dg7LE';

function fetchSheet(sheetName) {
  const url = `https://opensheet.elk.sh/${SHEET_ID}/${sheetName}`;
  return fetch(url).then(res => res.json());
}


/* ---- PRODUCT GRIDS (Land, Sea, Air, Space) ---- */

function renderProductGrid(data, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';

  const domain    = gridId.replace('grid-', '');
  const filterBar = document.getElementById('filters-' + domain);

  // Count tag frequency across all cards
  const tagCount = {};
  data.forEach(row => {
    const tags = (row['Tags'] || row['tags'] || '').toString().trim();
    tags.split(',').forEach(t => {
      const tag = t.trim();
      if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  // Pick top 5 by frequency — only tags appearing more than once
  const top5 = Object.entries(tagCount)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  // Build filter buttons
  if (filterBar && top5.length) {
    filterBar.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      grid.querySelectorAll('.product-card').forEach(c => c.style.display = '');
    });
    filterBar.appendChild(allBtn);

    top5.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = tag;
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        grid.querySelectorAll('.product-card').forEach(card => {
          const cardTags = card.dataset.tags || '';
          card.style.display = cardTags.split(',').map(t => t.trim()).includes(tag) ? '' : 'none';
        });
      });
      filterBar.appendChild(btn);
    });
  }

  // Render cards
  data.forEach(row => {
    const r      = {};
    const rLower = {};
    Object.keys(row).forEach(k => {
      const trimmed = k.trim();
      const val     = (row[k] || '').toString().trim();
      r[trimmed]                    = val;
      rLower[trimmed.toLowerCase()] = val;
    });

    const get = (...keys) => {
      for (const k of keys) {
        if (r[k]               !== undefined) return r[k];
        if (rLower[k.toLowerCase()] !== undefined) return rLower[k.toLowerCase()];
      }
      return '';
    };

    const role     = get('Role');
    const name     = get('Name');
    const desc     = get('Description');
    const tags     = get('Tags');
    const imgURL   = get('ImgURL',      'imgurl',      'ImageURL');
    const imgHover = get('ImgURLHover', 'imgurlhover', 'HoverURL', 'ImgHover');
    const linkURL  = get('LinkURL',     'linkurl',     'Link');

    let visualHTML = '';
    if (imgURL || imgHover) {
      visualHTML = `
        ${imgHover ? `<img class="img-hover" src="${imgHover}" alt="${name} hover" onerror="this.style.display='none'">` : ''}
        <div class="img-default-panel">
          ${imgURL ? `<img class="img-default" src="${imgURL}" alt="${name}" onerror="this.style.display='none'">` : ''}
        </div>
      `;
    } else {
      visualHTML = `<div style="font-family:'Bebas Neue',sans-serif;font-size:48px;letter-spacing:4px;color:rgba(255,255,255,0.08);">${role}</div>`;
    }

    const tagHTML = tags
      ? tags.split(',').map(t => `<span class="product-tag">${t.trim()}</span>`).join('')
      : '';

    const arrowHTML = `
      <div class="product-arrow" ${linkURL ? `onclick="event.stopPropagation();window.open('${linkURL}','_blank')" style="cursor:pointer;"` : ''}>
        <svg viewBox="0 0 14 14"><path d="M2 7h10M8 3l4 4-4 4"/></svg>
      </div>`;

    const card = document.createElement('div');
    card.className   = 'product-card';
    card.dataset.tags = tags.split(',').map(t => t.trim()).join(',');
    card.innerHTML = `
      <div class="product-card-visual">${visualHTML}</div>
      <div class="product-card-body" style="padding-bottom:60px;">
        <div class="product-type">${role}</div>
        <div class="product-name">${name}</div>
        <p class="product-desc">${desc}</p>
        <div class="product-tags">${tagHTML}</div>
      </div>
      ${arrowHTML}
    `;

    if (linkURL) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => window.open(linkURL, '_blank'));
    }

    grid.appendChild(card);
  });
}

['Sea', 'Land', 'Air', 'Space'].forEach(domain => {
  fetchSheet(domain)
    .then(data => renderProductGrid(data, 'grid-' + domain.toLowerCase()))
    .catch(err  => console.error(`Failed to load ${domain} data:`, err));
});


/* ---- MEMBERS GRID ---- */

function renderMembers(data) {
  const grid = document.getElementById('members-grid');
  if (!grid || !data.length) return;
  grid.innerHTML = '';

  data.forEach(row => {
    const r = {};
    Object.keys(row).forEach(k => { r[k.trim()] = (row[k] || '').toString().trim(); });

    const name           = r['Name']          || '';
    const specialisation = r['Specialisation'] || '';
    const established    = r['Established']    || '';
    const description    = r['Description']    || '';
    const location       = r['Location']       || '';
    const logoURL        = r['LogoURL']        || '';

    // ---- build card entirely with DOM APIs to avoid any innerHTML quoting issues ----

    const card = document.createElement('div');
    card.style.cssText = 'background:#ffffff;padding:40px 36px;';

    // Header row (logo + name block)
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:16px;margin-bottom:22px;';

    // Logo slot
    const makeFallback = () => {
      const fb = document.createElement('div');
      fb.style.cssText = 'width:48px;height:48px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;';
      fb.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>';
      return fb;
    };

    const logoSlot = document.createElement('div');
    logoSlot.style.cssText = 'width:48px;height:48px;flex-shrink:0;display:flex;align-items:center;justify-content:center;';

    if (logoURL) {
      const img = document.createElement('img');
      img.src             = logoURL;
      img.alt             = name + ' logo';
      img.style.cssText   = 'width:48px;height:48px;object-fit:contain;';
      img.addEventListener('error', () => {
        logoSlot.innerHTML = '';
        logoSlot.appendChild(makeFallback());
      });
      logoSlot.appendChild(img);
    } else {
      logoSlot.appendChild(makeFallback());
    }

    // Name + specialisation block
    const nameBlock = document.createElement('div');

    const meta = document.createElement('div');
    meta.style.cssText = 'font-family:\'Barlow Condensed\',sans-serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:#1a5fa8;margin-bottom:3px;';
    meta.textContent   = specialisation + (established ? ' · Est. ' + established : '');

    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-family:\'Bebas Neue\',sans-serif;font-size:24px;letter-spacing:1px;color:#0d1b2e;line-height:1;';
    nameEl.textContent   = name;

    nameBlock.appendChild(meta);
    nameBlock.appendChild(nameEl);
    header.appendChild(logoSlot);
    header.appendChild(nameBlock);

    // Description
    const desc = document.createElement('p');
    desc.style.cssText = 'font-size:13px;font-weight:300;line-height:1.8;color:#5a6e85;margin-bottom:20px;';
    desc.textContent   = description;

    card.appendChild(header);
    card.appendChild(desc);

    // Optional location tag
    if (location) {
      const tag = document.createElement('span');
      tag.className   = 'product-tag';
      tag.textContent = location;
      card.appendChild(tag);
    }

    grid.appendChild(card);
  });
}

fetchSheet('Members')
  .then(data => renderMembers(data))
  .catch(err  => console.error('Failed to load members data:', err));


/* ---- EVENTS TIMELINE ---- */

function renderTimeline(data) {
  const track = document.getElementById('timeline-track');
  if (!track || !data.length) return;
  track.innerHTML = '';

  data.forEach(row => {
    const r = {};
    Object.keys(row).forEach(k => { r[k.trim()] = (row[k] || '').toString().trim(); });

    const start     = r['Date Start'] || r['DateStart'] || '';
    const end       = r['Date End']   || r['DateEnd']   || '';
    const eventName = r['Event']      || r['event']     || r['Name'] || '';
    const location  = r['Location']   || r['location']  || '';

    const dateRange = (end && end !== start) ? `${start} to ${end}` : start;

    const node = document.createElement('div');
    node.className = 'timeline-node';
    node.innerHTML = `
      <div class="timeline-date-range">${dateRange}</div>
      <div class="timeline-event">${eventName}</div>
      <div class="timeline-location">
        <span class="timeline-pin"></span>
        ${location}
      </div>
    `;
    track.appendChild(node);
  });
}

fetchSheet('Events')
  .then(data => renderTimeline(data))
  .catch(err  => console.error('Failed to load events data:', err));


/* ---- FIGURES (stats + copyright year) ---- */

fetchSheet('Figures')
  .then(data => {
    const row = data[0];
    if (!row) return;

    if (row.Year) {
      document.querySelectorAll('span.cy').forEach(el => el.textContent = row.Year);
    }

    const statKeys = Object.keys(row).filter(k => k !== 'Year');
    statKeys.forEach((key, i) => {
      const el = document.getElementById('stat-' + i);
      if (el) el.textContent = row[key];
    });
  })
  .catch(err => console.error('Failed to load figures data:', err));


/* ---- NEWS TICKER ---- */

function renderNewsTicker(data) {
  const track = document.getElementById('ticker-track');
  if (!track || !data.length) return;
  track.innerHTML = '';

  const items = data.map(row => {
    const div = document.createElement('div');
    div.className = 'ticker-item';
    div.innerHTML = `${row.News}<div class="ticker-divider"></div>`;
    return div;
  });

  // Original + duplicate for seamless loop
  items.forEach(el => track.appendChild(el));
  items.forEach(el => track.appendChild(el.cloneNode(true)));
}

fetchSheet('News')
  .then(data => renderNewsTicker(data))
  .catch(err  => {
    console.error('Failed to load news data:', err);
    const ticker = document.querySelector('.news-ticker');
    if (ticker) ticker.style.display = 'none';
  });


/* ---- CUSTOMER MARQUEE ---- */

function buildMarqueeItem(row) {
  const alignment = (row.Alignment || 'center').toLowerCase();
  const div       = document.createElement('div');
  div.className   = 'client-logo';
  div.innerHTML   = `
    <img
      src="${row.ImageURL}"
      style="height:78px;width:78px;object-fit:cover;object-position:${alignment};clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);"
      onerror="this.style.display='none'"
    >
    <span>${row.Name}</span>
  `;
  return div;
}

function renderClientMarquee(data) {
  const track = document.getElementById('marquee-track');
  if (!track || !data.length) return;
  track.innerHTML = '';
  track.style.animationPlayState = 'running';

  const fragment = document.createDocumentFragment();
  data.forEach(row => fragment.appendChild(buildMarqueeItem(row)));
  track.appendChild(fragment);
  track.innerHTML += track.innerHTML; // duplicate for seamless scroll
}

fetchSheet('Customers')
  .then(data => renderClientMarquee(data))
  .catch(err  => {
    console.error('Failed to load customer data:', err);
    const marquee = document.querySelector('.clients-marquee');
    if (marquee) marquee.style.display = 'none';
  });
