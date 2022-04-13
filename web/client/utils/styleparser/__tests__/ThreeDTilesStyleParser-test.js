/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import ThreeDTilesStyleParser from '../ThreeDTilesStyleParser';

const parser = new ThreeDTilesStyleParser();

describe('ThreeDTilesStyleParser', () => {
    describe('readStyle', () => {
        it('should recognize color function', (done) => {
            const style = {
                color: "color('#ff0000', 1)"
            };
            parser.readStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            name: '',
                            rules: [
                                {
                                    filter: undefined,
                                    name: '',
                                    symbolizers: [
                                        {
                                            kind: 'Fill',
                                            color: '#ff0000',
                                            fillOpacity: 1
                                        }
                                    ]
                                }
                            ]
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should recognize rgb function', (done) => {
            const style = {
                color: "rgb(255, 0, 0)"
            };
            parser.readStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            name: '',
                            rules: [
                                {
                                    filter: undefined,
                                    name: '',
                                    symbolizers: [
                                        {
                                            kind: 'Fill',
                                            color: '#ff0000',
                                            fillOpacity: 1
                                        }
                                    ]
                                }
                            ]
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should recognize rgba function', (done) => {
            const style = {
                color: "rgba(255, 0, 0, 0.1)"
            };
            parser.readStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            name: '',
                            rules: [
                                {
                                    filter: undefined,
                                    name: '',
                                    symbolizers: [
                                        {
                                            kind: 'Fill',
                                            color: '#ff0000',
                                            fillOpacity: 0.1
                                        }
                                    ]
                                }
                            ]
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should recognize hsl function', (done) => {
            const style = {
                color: "hsl(0, 0, 0)"
            };
            parser.readStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            name: '',
                            rules: [
                                {
                                    filter: undefined,
                                    name: '',
                                    symbolizers: [
                                        {
                                            kind: 'Fill',
                                            color: '#000000',
                                            fillOpacity: 1
                                        }
                                    ]
                                }
                            ]
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should recognize hsla function', (done) => {
            const style = {
                color: "hsla(0, 0, 0, 0.1)"
            };
            parser.readStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            name: '',
                            rules: [
                                {
                                    filter: undefined,
                                    name: '',
                                    symbolizers: [
                                        {
                                            kind: 'Fill',
                                            color: '#000000',
                                            fillOpacity: 0.1
                                        }
                                    ]
                                }
                            ]
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should read title from meta property', (done) => {
            const style = {
                color: "color('#ff0000', 1)",
                meta: {
                    title: 'Title'
                }
            };
            parser.readStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            name: 'Title',
                            rules: [
                                {
                                    filter: undefined,
                                    name: '',
                                    symbolizers: [
                                        {
                                            kind: 'Fill',
                                            color: '#ff0000',
                                            fillOpacity: 1
                                        }
                                    ]
                                }
                            ]
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should read label names from meta property', (done) => {
            const style = {
                color: "color('#ff0000', 1)",
                meta: {
                    names: `'Label'`
                }
            };
            parser.readStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            name: '',
                            rules: [
                                {
                                    filter: undefined,
                                    name: 'Label',
                                    symbolizers: [
                                        {
                                            kind: 'Fill',
                                            color: '#ff0000',
                                            fillOpacity: 1
                                        }
                                    ]
                                }
                            ]
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should recognize mark type based on pointSize property', (done) => {
            const style = {
                color: "color('#ff0000', 1)",
                pointSize: 6
            };
            parser.readStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            name: '',
                            rules: [
                                {
                                    filter: undefined,
                                    name: '',
                                    symbolizers: [
                                        {
                                            kind: 'Mark',
                                            color: '#ff0000',
                                            fillOpacity: 1
                                        }
                                    ]
                                }
                            ]
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
    });

    describe('writeStyle', () => {
        it('should write fill symbolizer', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 1
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            color: "color('#ff0000', 1)"
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });

        it('should write title inside meta property', (done) => {
            const style = {
                name: 'Title',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 1
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            color: "color('#ff0000', 1)",
                            meta: {
                                title: "'Title'"
                            }
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should write label names in meta property', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: 'Label',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 1
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            color: "color('#ff0000', 1)",
                            meta: {
                                names: `'Label'`
                            }
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should write pointSize based on radius property of mark symbolizer', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: undefined,
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Mark',
                                color: '#ff0000',
                                fillOpacity: 1,
                                radius: 6
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            color: "color('#ff0000', 1)",
                            pointSize: 6
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should use conditions with multiple rules', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: ['==', 'height', 10],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['!=', 'height', 10],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#00ff00',
                                fillOpacity: 1
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            color: {
                                conditions: [
                                    [ true, 'color(\'#00ff00\', 1)' ],
                                    [ '(!(${height} === undefined || ${height} === null) && ${height} !== 10)', 'color(\'#0000ff\', 1)' ],
                                    [ '(!(${height} === undefined || ${height} === null) && ${height} === 10)', 'color(\'#ff0000\', 1)' ]
                                ]
                            }
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should create conditions with AND/OR operator', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: ['||', ['==', 'height', 10], ['==', 'category', 1]],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['&&', ['==', 'height', 10], ['==', 'category', 2]],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            show: '((!(${height} === undefined || ${height} === null) && ${height} === 10) && (!(${category} === undefined || ${category} === null) && ${category} === 2)) || ((!(${height} === undefined || ${height} === null) && ${height} === 10) || (!(${category} === undefined || ${category} === null) && ${category} === 1))',
                            color: {
                                conditions: [
                                    [ '((!(${height} === undefined || ${height} === null) && ${height} === 10) && (!(${category} === undefined || ${category} === null) && ${category} === 2))', 'color(\'#0000ff\', 1)' ],
                                    [ '((!(${height} === undefined || ${height} === null) && ${height} === 10) || (!(${category} === undefined || ${category} === null) && ${category} === 1))', 'color(\'#ff0000\', 1)' ],
                                    [ true, 'color(\'#ffffff\', 1)' ]
                                ]
                            }
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });

        it('should create conditions for number value', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: ['==', 'height', 10],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['>', 'height', 10],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['<', 'height', 10],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['>=', 'height', 10],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['<=', 'height', 10],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['!=', 'height', 10],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#00ff00',
                                fillOpacity: 1
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            color: {
                                conditions: [
                                    [ true, 'color(\'#00ff00\', 1)' ],
                                    [ '(!(${height} === undefined || ${height} === null) && ${height} !== 10)', 'color(\'#0000ff\', 1)' ],
                                    [ '(!(${height} === undefined || ${height} === null) && ${height} <= 10)', 'color(\'#0000ff\', 1)' ],
                                    [ '(!(${height} === undefined || ${height} === null) && ${height} >= 10)', 'color(\'#0000ff\', 1)' ],
                                    [ '(!(${height} === undefined || ${height} === null) && ${height} < 10)', 'color(\'#0000ff\', 1)' ],
                                    [ '(!(${height} === undefined || ${height} === null) && ${height} > 10)', 'color(\'#0000ff\', 1)' ],
                                    [ '(!(${height} === undefined || ${height} === null) && ${height} === 10)', 'color(\'#ff0000\', 1)' ]
                                ]
                            }
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
        it('should create conditions for string value', (done) => {
            const style = {
                name: '',
                rules: [
                    {
                        filter: ['==', 'name', 'mesh_1'],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#ff0000',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['!=', 'name', 'mesh_1'],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['==', 'name', null],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        filter: ['*=', 'name', 'me'],
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#0000ff',
                                fillOpacity: 1
                            }
                        ]
                    },
                    {
                        name: '',
                        symbolizers: [
                            {
                                kind: 'Fill',
                                color: '#00ff00',
                                fillOpacity: 1
                            }
                        ]
                    }
                ]
            };
            parser.writeStyle(style)
                .then((parsed) => {
                    try {
                        expect(parsed).toEqual({
                            color: {
                                conditions: [
                                    [ true, 'color(\'#00ff00\', 1)' ],
                                    [ '(!(${name} === undefined || ${name} === null) && regExp(\'me\').test(${name}) === true)', 'color(\'#0000ff\', 1)' ],
                                    [ '(!(${name} === undefined) && ${name} === null)', 'color(\'#0000ff\', 1)' ],
                                    [ '(!(${name} === undefined || ${name} === null) && ${name} !== \'mesh_1\')', 'color(\'#0000ff\', 1)' ],
                                    [ '(!(${name} === undefined || ${name} === null) && ${name} === \'mesh_1\')', 'color(\'#ff0000\', 1)' ]
                                ]
                            }
                        });
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
        });
    });

});
