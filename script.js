const map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 10,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

async function loadData() {
  const districtsUrl = 'https://cdn.jsdelivr.net/gh/unitedstates/districts@gh-pages/geojson/cds.geojson';
  const repsUrl = 'https://theunitedstates.io/congress-legislators/legislators-current.json';

  const [districts, reps] = await Promise.all([
    fetch(districtsUrl).then(r => r.json()),
    fetch(repsUrl).then(r => r.json())
  ]);

  const repMap = {};
  reps.forEach(person => {
    const terms = person.terms;
    const current = terms[terms.length - 1];
    if (current.type === 'rep') {
      const key = `${current.state}-${current.district}`;
      repMap[key] = `${person.name.first} ${person.name.last}`;
    }
  });

  L.geoJSON(districts, {
    style: {
      color: '#444',
      weight: 1,
      fillOpacity: 0.2
    },
    onEachFeature: (feature, layer) => {
      const state = feature.properties.state;
      const district = feature.properties.district;
      const key = `${state}-${district}`;
      const rep = repMap[key] || 'Vacant';
      const label = `${state}-${district}<br>${rep}`;
      layer.bindTooltip(label, {
        permanent: true,
        direction: 'center',
        className: 'rep-label'
      });
    }
  }).addTo(map);
}

loadData().catch(err => {
  console.error('Failed to load map data', err);
});
