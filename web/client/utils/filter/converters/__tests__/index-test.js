import expect from 'expect';
import {getConverter, canConvert} from '../index';

describe('Filter converters', () => {
    it('getConverter', () => {
        expect(getConverter('cql', 'ogc')).toExist("cql to ogc converter not found");
        expect(getConverter('logic', 'ogc')).toExist("logic to ogc converter not found");
        expect(getConverter('logic', 'cql')).toExist("logic to cql converter not found");
        expect(getConverter('ogc', 'logic')).toNotExist("ogc to logic converter found, but it shouldn't");
        expect(getConverter('cql', 'logic')).toNotExist("cql to logic converter found, but it shouldn't");
    });
    it('canConvert', () => {
        expect(canConvert('cql', 'ogc')).toBe(true, "cql to ogc conversion not allowed");
        expect(canConvert('logic', 'ogc')).toBe(true, "logic to ogc conversion not allowed");
        expect(canConvert('logic', 'cql')).toBe(true, "logic to cql conversion not allowed");
        expect(canConvert('ogc', 'logic')).toBe(false, "ogc to logic conversion allowed, but it shouldn't");
        expect(canConvert('cql', 'logic')).toBe(false, "cql to logic conversion allowed, but it shouldn't");
        expect(canConvert('geostyler', 'cql')).toBe(true, "geostyler to cql conversion allowed");
    });
    const SAMPLES = [
        {
            filter: {
                format: 'cql',
                body: 'prop = 1'
            },
            opts: {filterNS: 'ogc'},
            cql: 'prop = 1',
            ogc: '<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo>'
        }, {
            filter: {
                format: 'logic',
                logic: 'AND',
                filters: [
                    {
                        format: 'cql',
                        body: 'prop = 1'
                    }, {
                        format: 'cql',
                        body: 'prop = 2'
                    }
                ]
            },
            opts: {filterNS: 'ogc'},
            cql: '((prop = 1) AND (prop = 2))',
            ogc: '<ogc:And><ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>2</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And>'
        }, {
            filter: {
                format: 'logic',
                logic: 'OR',
                filters: [
                    {
                        format: 'cql',
                        body: 'prop = 1'
                    }, {
                        format: 'cql',
                        body: 'prop = 2'
                    }
                ]
            },
            opts: {filterNS: 'ogc'},
            cql: '((prop = 1) OR (prop = 2))',
            ogc: '<ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>2</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Or>'
        }, {
            filter: {
                format: 'logic',
                logic: 'NOT',
                filters: [
                    {
                        format: 'cql',
                        body: 'prop = 1'
                    }
                ]
            },
            opts: {filterNS: 'ogc'},
            cql: '(NOT (prop = 1))',
            ogc: '<ogc:Not><ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Not>'
        }, {
            filter: {
                format: 'logic',
                logic: 'AND',
                filters: [
                    {
                        format: 'logic',
                        logic: 'OR',
                        filters: [
                            {
                                format: 'cql',
                                body: 'prop = 1'
                            }, {
                                format: 'cql',
                                body: 'prop = 2'
                            }
                        ]
                    }, {
                        format: 'cql',
                        body: 'prop = 3'
                    }
                ]
            },
            opts: {filterNS: 'ogc'},
            cql: '((((prop = 1) OR (prop = 2))) AND (prop = 3))',
            ogc: '<ogc:And><ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>1</ogc:Literal></ogc:PropertyIsEqualTo><ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>2</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Or><ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>3</ogc:Literal></ogc:PropertyIsEqualTo></ogc:And>'
        }
    ];
    const formats = ['cql', 'ogc'];
    it('conversion tests', () => {
        SAMPLES.forEach(({filter, opts, ...results}) => {
            formats.forEach(outFormat => {
                const converter = getConverter(filter.format, outFormat);
                expect(converter(filter, opts)).toBe(results[outFormat]);
            });
        });
    });
});
