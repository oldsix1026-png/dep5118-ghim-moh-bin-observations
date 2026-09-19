(() => {
  const config = window.BIN_WATCH_CONFIG || {};
  const submitLink = document.getElementById('submit-link');
  const headerReportLink = document.getElementById('header-report-link');
  const submissionNote = document.getElementById('submission-note');
  const liveMapLink = document.getElementById('live-map-link');

  if (config.liveMapUrl) liveMapLink.href = config.liveMapUrl;

  if (config.submissionUrl) {
    submitLink.href = config.submissionUrl;
    submitLink.textContent = 'Open the reporting form ↗';
    submitLink.classList.remove('is-unavailable');
    submitLink.removeAttribute('aria-disabled');
    submitLink.target = '_blank';
    submitLink.rel = 'noopener noreferrer';
    headerReportLink.href = config.submissionUrl;
    headerReportLink.target = '_blank';
    headerReportLink.rel = 'noopener noreferrer';
    submissionNote.textContent = 'The form opens in a new tab. Reports are checked before appearing publicly.';
  } else {
    submitLink.addEventListener('click', (event) => event.preventDefault());
  }

  const list = document.getElementById('report-list');
  const count = document.getElementById('report-count');
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

  const map = L.map('map', { zoomControl: true, scrollWheelZoom: false }).setView([1.3112, 103.7906], 16);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);
  const markerLayer = L.layerGroup().addTo(map);
  let reports = [];

  function makeRow(report, marker) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'report-row';
    const top = document.createElement('span');
    top.className = 'row-top';
    const condition = document.createElement('span');
    condition.className = 'row-status';
    const dot = document.createElement('i');
    dot.className = `key-dot ${report.properties.status}`;
    dot.setAttribute('aria-hidden', 'true');
    condition.append(dot, document.createTextNode(statusLabels[report.properties.status]));
    const date = document.createElement('span');
    date.textContent = report.properties.displayTime;
    top.append(condition, date);
    const place = document.createElement('span');
    place.className = 'row-location';
    place.textContent = report.properties.place;
    row.append(top, place);
    row.addEventListener('click', () => {
      const [lng, lat] = report.geometry.coordinates;
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
    count.textContent = String(filtered.length);
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No demo reports match these filters.';
      list.append(empty);
      return;
    }

    filtered.forEach((report) => {
      const [lng, lat] = report.geometry.coordinates;
      const props = report.properties;
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#fff',
        weight: 2,
        fillColor: statusColors[props.status],
        fillOpacity: 1
      }).addTo(markerLayer);
      const popup = document.createElement('div');
      const title = document.createElement('p');
      title.className = 'popup-title';
      title.textContent = `${statusLabels[props.status]} · Demo report`;
      const detail = document.createElement('p');
      detail.className = 'popup-detail';
      detail.textContent = `${props.place} · ${props.displayTime}`;
      popup.append(title, detail);
      marker.bindPopup(popup);
      list.append(makeRow(report, marker));
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

  fetch('./data/demo_reports.geojson')
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((geojson) => {
      reports = geojson.features.filter((feature) => feature.geometry?.type === 'Point');
      render();
    })
    .catch(() => {
      list.innerHTML = '<p class="empty-state">Demo reports could not load. Please reload the page.</p>';
      count.textContent = '0';
    });
})();
