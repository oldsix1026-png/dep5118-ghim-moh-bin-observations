(() => {
  const config = window.BIN_WATCH_CONFIG || {};
  const reportLinks = ['header-report-link', 'submit-link']
    .map((id) => document.getElementById(id));
  const liveMapLink = document.getElementById('live-map-link');

  if (config.liveMapUrl) liveMapLink.href = config.liveMapUrl;

  if (config.submissionUrl) {
    reportLinks.forEach((link) => { link.href = config.submissionUrl; });
  }

  const list = document.getElementById('report-list');
  const count = document.getElementById('report-count');
  const siteCount = document.getElementById('site-count');
  const statusFilter = document.getElementById('status-filter');
  const timeFilter = document.getElementById('time-filter');
  const resetButton = document.getElementById('reset-filters');
  const statusLabels = {
    'near-full': 'Nearly full',
    full: 'Full',
    outside: 'Litter outside'
  };
  const statusColors = {
    'near-full': '#d2a14a',
    full: '#df754b',
    outside: '#b3444c'
  };

  if (!window.L) {
    document.getElementById('map').textContent = 'The map could not load. Please check the internet connection and reload.';
    return;
  }

  const map = L.map('map', { zoomControl: false, scrollWheelZoom: false }).setView([1.3112, 103.7906], 16);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);
  const markerLayer = L.layerGroup().addTo(map);
  let reports = [];

  function breakdown(observations) {
    return Object.fromEntries(Object.keys(statusLabels).map((status) => [
      status, observations.filter((report) => report.properties.status === status).length
    ]));
  }

  function summary(counts) {
    return Object.entries(counts)
      .filter(([, value]) => value)
      .map(([status, value]) => `${statusLabels[status]} ${value}`)
      .join(' · ');
  }

  function displayPlace(place) {
    return place.replace(/^Illustrative\s+/i, '');
  }

  function fullReportsByDay(observations) {
    const days = new Map();
    observations.forEach(({ properties }) => {
      const day = properties.reportedAt.slice(0, 10);
      days.set(day, (days.get(day) || 0) + (properties.status === 'full' ? 1 : 0));
    });
    return [...days.entries()].sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => {
        const label = new Date(`${day}T12:00:00+08:00`).toLocaleDateString('en-SG', {
          day: 'numeric', month: 'short', timeZone: 'Asia/Singapore'
        });
        return `${label}: ${count}`;
      }).join(' · ');
  }

  function makeRow(site, marker) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'report-row';
    const top = document.createElement('span');
    top.className = 'row-top';
    const place = document.createElement('span');
    place.className = 'row-location';
    place.textContent = displayPlace(site.observations[0].properties.place);
    const tally = document.createElement('span');
    tally.className = 'row-tally';
    tally.textContent = `${site.observations.length} ${site.observations.length === 1 ? 'report' : 'reports'}`;
    top.append(place, tally);
    const detail = document.createElement('span');
    detail.className = 'row-detail';
    detail.textContent = summary(breakdown(site.observations));
    row.append(top, detail);
    row.addEventListener('click', () => {
      const [lng, lat] = site.coordinates;
      map.flyTo([lat, lng], 17, { duration: 0.6 });
      marker.openPopup();
    });
    return row;
  }

  function render() {
    const filtered = reports.filter(({ properties }) =>
      (statusFilter.value === 'all' || properties.status === statusFilter.value) &&
      (timeFilter.value === 'all' || properties.period === timeFilter.value)
    );
    markerLayer.clearLayers();
    list.replaceChildren();
    const sites = new Map();
    filtered.forEach((report) => {
      const id = report.properties.site_id;
      if (!sites.has(id)) sites.set(id, { coordinates: report.geometry.coordinates, observations: [] });
      sites.get(id).observations.push(report);
    });
    const rankedSites = [...sites.values()].sort((a, b) =>
      b.observations.length - a.observations.length ||
      a.observations[0].properties.place.localeCompare(b.observations[0].properties.place)
    );
    count.textContent = String(filtered.length);
    siteCount.textContent = String(sites.size);
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No example reports match these filters.';
      list.append(empty);
      return;
    }

    rankedSites.forEach((site) => {
      const [lng, lat] = site.coordinates;
      const observations = site.observations;
      const counts = breakdown(observations);
      const size = 30 + Math.min(observations.length - 1, 5) * 4;
      const nearEnd = counts['near-full'] / observations.length * 100;
      const fullEnd = (counts['near-full'] + counts.full) / observations.length * 100;
      const fill = `conic-gradient(${statusColors['near-full']} 0 ${nearEnd}%, ${statusColors.full} ${nearEnd}% ${fullEnd}%, ${statusColors.outside} ${fullEnd}% 100%)`;
      const icon = L.divIcon({
        className: 'site-icon',
        html: `<span class="site-marker" style="--marker-size:${size}px;background:${fill}"><span class="site-marker-count">${observations.length}</span></span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
      });
      const marker = L.marker([lat, lng], { icon, title: `${observations.length} example ${observations.length === 1 ? 'report' : 'reports'} at ${displayPlace(observations[0].properties.place)}` }).addTo(markerLayer);
      const popup = document.createElement('div');
      const title = document.createElement('p');
      title.className = 'popup-title';
      title.textContent = displayPlace(observations[0].properties.place);
      const detail = document.createElement('p');
      detail.className = 'popup-detail';
      detail.textContent = `${observations.length} example ${observations.length === 1 ? 'report' : 'reports'} · ${summary(counts)}`;
      const daily = document.createElement('p');
      daily.className = 'popup-daily';
      daily.textContent = `Full reports by date: ${fullReportsByDay(observations)}`;
      const timeline = document.createElement('ul');
      timeline.className = 'popup-timeline';
      [...observations].sort((a, b) => a.properties.reportedAt.localeCompare(b.properties.reportedAt)).forEach((report) => {
        const entry = document.createElement('li');
        const dot = document.createElement('i');
        dot.className = `key-dot ${report.properties.status}`;
        dot.setAttribute('aria-hidden', 'true');
        entry.append(dot, document.createTextNode(`${report.properties.displayTime} · ${statusLabels[report.properties.status]}`));
        timeline.append(entry);
      });
      popup.append(title, detail, daily, timeline);
      marker.bindPopup(popup);
      list.append(makeRow(site, marker));
    });
  }

  statusFilter.addEventListener('change', render);
  timeFilter.addEventListener('change', render);
  resetButton.addEventListener('click', () => {
    statusFilter.value = 'all';
    timeFilter.value = 'all';
    render();
    map.setView([1.3112, 103.7906], 16);
  });

  fetch('./data/demo_reports.geojson?v=25-observations-10-sites', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((geojson) => {
      reports = geojson.features.filter((feature) => feature.geometry?.type === 'Point');
      render();
    })
    .catch(() => {
      list.innerHTML = '<p class="empty-state">Example reports could not load. Please reload the page.</p>';
      count.textContent = '0';
      siteCount.textContent = '0';
    });
})();
