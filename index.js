const fetch = require('node-fetch');

class SPARQLQueryDispatcher {
	constructor(endpoint) {
		this.endpoint = endpoint;
	}
	query(sparqlQuery, simplify = true) {
		const fullUrl = this.endpoint + "?query=" + encodeURIComponent(sparqlQuery);
		const headers = {
			Accept: "application/sparql-results+json"
		};
		return fetch(fullUrl, {
			headers
		})
			.then(body => body.json())
			.then(data => (simplify ? this.simplify(data) : data));
	}
	simplify(data) {
		const bindings = data.results.bindings;
		return bindings.map(binding => {
			Object.keys(binding).forEach(function (key, index) {
				binding[key] = binding[key].value;
			});
			return binding;
		});
	}
}

function buildQuery(ids) {
	const wds = ids.map(id => `wd:${id}`).join(" ");
	return `
  SELECT ?item ?itemLabel ?geoshape ?geoshapeLabel
  WHERE
  {
	VALUES ?item { ${wds} }
	?item wdt:P3896 ?geoshape.
	SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }
  `;
}

async function fetchGeojson(rows) {
	const titles = rows
		.filter(r => r.geoshape)
		.map(r => r.geoshape.split("/data/main/").pop())
		.join("|");
	return fetch(`https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&rvslots=*&rvprop=content&format=json&titles=${titles}&origin=*`)
		.then(r => r.json())
		.then(r => Object.values(r.query.pages))
		.then(r => r.map(r => JSON.parse(r.revisions[0].slots.main["*"]).data));
}

const queryDispatcher = new SPARQLQueryDispatcher("https://query.wikidata.org/sparql");
const query = buildQuery(["Q90"]); // Q90 = Paris


// REAL TREATMENT STARTS HERE

(async () => {

	queryDispatcher
		.query(query)
		.then(fetchGeojson)
		.then(console.log);
})();