import expect from 'expect';
import {template} from '../plugins/TileProviderLayer';


describe('TileProviderLayer', () => {
    it('template function', () => {
        const samples = [
            { url: 'http://test.com/{z}/{x}/{y}.png', data: {}, expected: 'http://test.com/{z}/{x}/{y}.png'},
            { url: 'http://{s}.test.com/{z}/{x}/{y}.png', data: {}, expected: 'http://{s}.test.com/{z}/{x}/{y}.png' },
            { url: 'http://{s}.test.com/{name}/{z}/{x}/{y}.png', data: {name: "test"}, expected: 'http://{s}.test.com/test/{z}/{x}/{y}.png' },
            { url: 'http://{s}.test.com/{name}.{variant}/{style}/{z}/{x}/{y}.png', data: {name: "name", variant: "variant", style: "style"}, expected: 'http://{s}.test.com/name.variant/style/{z}/{x}/{y}.png' },
            { url: 'https://osm-prod.noncd.db.de:8100/styles/dbs-osm-railway/{z}/{x}/{y}.png?key=asdasdasdasdasdasdasd', data: {}, expected: 'https://osm-prod.noncd.db.de:8100/styles/dbs-osm-railway/{z}/{x}/{y}.png?key=asdasdasdasdasdasdasd'}
        ];
        samples.forEach((sample) => {
            expect(template(sample.url, sample.data)).toBe(sample.expected);
        });

    });
});
