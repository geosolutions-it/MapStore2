import expect from 'expect';
import {template, getSubdomainUrls} from '../plugins/TileProviderLayer';
import ConfigUtils from '../../../../utils/ConfigUtils';
import { getRequestConfigurationRule } from '../../../../utils/SecurityUtils';


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
    it('getSubdomainUrls returns one URL for each subdomain', () => {
        expect(getSubdomainUrls('https://{s}.tiles.example.com/{z}/{x}/{y}.png')).toEqual([
            'https://a.tiles.example.com/{z}/{x}/{y}.png',
            'https://b.tiles.example.com/{z}/{x}/{y}.png',
            'https://c.tiles.example.com/{z}/{x}/{y}.png'
        ]);
        expect(getSubdomainUrls('https://{s}.tiles.example.com/{z}/{x}/{y}.png', ['t1', 't2'])).toEqual([
            'https://t1.tiles.example.com/{z}/{x}/{y}.png',
            'https://t2.tiles.example.com/{z}/{x}/{y}.png'
        ]);
        expect(getSubdomainUrls('https://tiles.example.com/{z}/{x}/{y}.png')).toBe('https://tiles.example.com/{z}/{x}/{y}.png');
        expect(getSubdomainUrls(undefined)).toBe(undefined);
    });
    describe('request rules on subdomain URLs', () => {
        afterEach(() => {
            ConfigUtils.setConfigProp('requestsConfigurationRules', null);
        });
        it('applies a host rule when every subdomain URL is on the named host', () => {
            const rules = [{ urlPattern: 'tiles\\.example\\.com/', params: { key: 'service-key' } }];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(getRequestConfigurationRule(getSubdomainUrls('https://{s}.tiles.example.com/{z}/{x}/{y}.png', 'ab'))).toEqual(rules[0]);
        });
        it('does not apply a host rule when a subdomain moves the request to another host', () => {
            const rules = [{ urlPattern: 'tiles\\.example\\.com/', params: { key: 'service-key' } }];
            ConfigUtils.setConfigProp('requestsConfigurationRules', rules);
            expect(getRequestConfigurationRule(getSubdomainUrls('https://{s}tiles.example.com/{z}/{x}/{y}.png', ['a.', 'other.example.net/']))).toBe(undefined);
        });
    });
});
