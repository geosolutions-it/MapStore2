import expect from 'expect';
import {template} from '../plugins/TileProviderLayer';


describe('TileProviderLayer', () => {
    it('template function', () => {
        const samples = [
            { url: 'http://test.com/{z}/{x}/{y}.png', data: {}, expected: 'http://test.com/{z}/{x}/{y}.png'},
            { url: 'http://{s}.test.com/{z}/{x}/{y}.png', data: {}, expected: 'http://{s}.test.com/{z}/{x}/{y}.png' },
            { url: 'http://{s}.test.com/{name}/{z}/{x}/{y}.png', data: {name: "test"}, expected: 'http://{s}.test.com/test/{z}/{x}/{y}.png' },
            { url: 'http://{s}.test.com/{name}.{variant}/{style}/{z}/{x}/{y}.png', data: {name: "name", variant: "variant", style: "style"}, expected: 'http://{s}.test.com/name.variant/style/{z}/{x}/{y}.png' },
            { url: 'https://very.long.domain.to.test.regex.speed:8100/long/path/{z}/{x}/{y}.png?key=LONG_KEY_TO_USE_TOO', data: {}, expected: 'https://very.long.domain.to.test.regex.speed:8100/long/path/{z}/{x}/{y}.png?key=LONG_KEY_TO_USE_TOO' }
        ];
        samples.forEach((sample) => {
            expect(template(sample.url, sample.data)).toBe(sample.expected);
        });

    });
});
