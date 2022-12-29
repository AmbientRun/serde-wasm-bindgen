'use strict';

const { Suite } = require('benchmark');
const benches = require('./pkg');

let suites = {
	parse: new Suite('parse'),
	serialize: new Suite('serialize')
};

for (let input of ['canada', 'citm_catalog', 'twitter']) {
	const json = require(`./data/${input}.json`);

	for (const lib of ['serde_json', 'serde_wasm_bindgen', 'msgpack']) {
		const parse = benches[`parse_${input}_with_${lib}`];
		if (parse) {
			suites.parse.add(`${input} x ${lib}`, () => parse(json).free());
		}

		const serialize = benches[`serialize_${input}_with_${lib}`];
		if (serialize) {
			let parsed = parse(json);
			suites.serialize.add(`${input} x ${lib}`, () => serialize(parsed), {
				onComplete: () => parsed.free()
			});
		}
	}
}

function runSuite(suite) {
	console.log('='.repeat(suite.name.length));
	console.log(suite.name);
	console.log('='.repeat(suite.name.length));

	suite
	.on('error', event => console.error(event.target.error))
	.on('cycle', event => console.log(event.target.toString()))
	.run();
}

if (process.argv.length > 2) {
	runSuite(suites[process.argv[2]]);
} else {
	runSuite(suites.parse);
	runSuite(suites.serialize);
}
