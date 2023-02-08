import expect from 'expect';
import cql from '../cql';
describe('CQL converter', () => {
    const SAMPLES = [
        // logic operators
        {
            cql: 'prop1 = 1 AND prop2 = 2',
            opts: {filterNS: 'ogc'},
            ogc: '<ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>prop1</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>prop2</ogc:PropertyName><ogc:Literal>2</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And>'
        }, {
            cql: 'prop1 = 1 OR prop2 = 2',
            opts: {filterNS: 'ogc'},
            ogc: '<ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>prop1</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>prop2</ogc:PropertyName><ogc:Literal>2</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Or>'
        }, {
            cql: 'prop1 = 1 AND (prop2 = 2 OR prop3 = 3)',
            opts: {filterNS: 'ogc'},
            ogc: '<ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>prop1</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>prop2</ogc:PropertyName><ogc:Literal>2</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>prop3</ogc:PropertyName><ogc:Literal>3</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Or></ogc:And>'
        }, {
            cql: 'prop1 = 1 OR (prop2 = 2 AND prop3 = 3)',
            opts: {filterNS: 'ogc'},
            ogc: '<ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>prop1</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>prop2</ogc:PropertyName><ogc:Literal>2</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>prop3</ogc:PropertyName><ogc:Literal>3</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And></ogc:Or>'
        },
        // comparison operators
        {
            cql: 'prop1 = 1',
            opts: {filterNS: 'ogc'},
            ogc: '<ogc:PropertyIsEqualTo><ogc:PropertyName>prop1</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo>'
        }, {
            cql: 'prop1 <> 1',
            opts: {filterNS: 'ogc'},
            ogc: '<ogc:PropertyIsNotEqualTo><ogc:PropertyName>prop1</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsNotEqualTo>'
        }, {
            cql: 'prop1 < 1',
            opts: {filterNS: 'ogc'},
            ogc: '<ogc:PropertyIsLessThan><ogc:PropertyName>prop1</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsLessThan>'
        }, {
            cql: 'prop1 <= 1',
            opts: {filterNS: 'ogc'},
            ogc: '<ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>prop1</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo>'
        }

    ];
    it('test cql to ogc', () => {
        SAMPLES.forEach((sample) => {
            expect(cql.ogc(sample.cql, sample.opts)).toBe(sample.ogc);
        });
    });
    it('test cql to cql', () => {
        SAMPLES.forEach((sample) => {
            expect(cql.cql(sample.cql, sample.opts)).toBe(sample.cql);
        });
    });
});
