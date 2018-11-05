/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const API = require('../SLDService');

const layer = {
    url: 'http://localhost:8080/geoserver/wms',
    name: 'mylayer',
    thematic: {
        params: [{
            field: 'param3'
        }]
    }
};

const layerWithThema = {
    url: 'http://localhost:8080/geoserver/wms',
    name: 'mylayer',
    thematic: {
        params: [{
            field: 'param3'
        }]
    },
    params: {
        SLD: 'aaa'
    }
};

const layerWithDataTable = {
    url: 'http://localhost:8080/geoserver/wms',
    name: 'mylayer2',
    thematic: {
        datatable: 'datatable'
    }
};

const colors = [{
    name: 'otherreds',
    colors: ['#000', '#f00']
}];

const layerWithColors = {
    url: 'http://localhost:8080/geoserver/wms',
    name: 'mylayer',
    thematic: {
        colors
    }
};

const layerWithAdditionalColors = {
    url: 'http://localhost:8080/geoserver/wms',
    name: 'mylayer',
    thematic: {
        additionalColors: colors
    }
};

const params = {
    param1: 'value1',
    param2: 'value2',
    param3: 'value3'
};

const fields = {
    Attributes: {
        Attribute: [{
            type: 'Long',
            name: 'zzz'
        }, {
            type: 'Float',
            name: 'aaa'
        }, {
            type: 'String',
            name: 'none'
        }]
    }
};

const classification = {
    Rules: {
        Rule: [{
            PolygonSymbolizer: {
                Fill: {
                    CssParameter: {
                        "$": "#FF0000"
                    }
                }
            },
            Filter: {
                And: {
                    PropertyIsGreaterThan: {
                        Literal: 1
                    },
                    PropertyIsLessThan: {
                        Literal: 10
                    }
                }
            }
        }]
    }
};

const lineClassification = {
    Rules: {
        Rule: [{
            LineSymbolizer: {
                Stroke: {
                    CssParameter: {
                        "$": "#FF0000"
                    }
                }
            },
            Filter: {
                And: {
                    PropertyIsGreaterThan: {
                        Literal: 1
                    },
                    PropertyIsLessThan: {
                        Literal: 10
                    }
                }
            }
        }]
    }
};

const pointClassification = {
    Rules: {
        Rule: [{
            PointSymbolizer: {
                Graphic: {
                    Mark: {
                        Fill: {
                            CssParameter: {
                                "$": "#FF0000"
                            }
                        }
                    }
                }
            },
            Filter: {
                And: {
                    PropertyIsGreaterThan: {
                        Literal: 1
                    },
                    PropertyIsLessThan: {
                        Literal: 10
                    }
                }
            }
        }]
    }
};

const invalidClassification = {
    Rules: {
        Rule: [{
            Filter: {
                And: {
                    PropertyIsGreaterThan: {
                        Literal: 1
                    },
                    PropertyIsLessThan: {
                        Literal: 10
                    }
                }
            }
        }]
    }
};

const classificationWithZeros = {
    Rules: {
        Rule: [{
            PolygonSymbolizer: {
                Fill: {
                    CssParameter: {
                        "$": "#FF0000"
                    }
                }
            },
            Filter: {
                And: {
                    PropertyIsGreaterThan: {
                        Literal: 0
                    },
                    PropertyIsLessThan: {
                        Literal: 10
                    }
                }
            }
        }]
    }
};

const paramsDef = [{
    type: "aggregate",
    name: "aggregate"
}, {
    name: "param1"
}];

describe('Test correctness of the SLDService APIs', () => {
    it('check getStyleService', () => {
        const result = API.getStyleService(layer, params);
        expect(result.indexOf('http://localhost:8080/geoserver/rest/sldservice/mylayer/classify.xml')).toBe(0);
        expect(result.indexOf('fullSLD=true') > 0).toBe(true);
        expect(result.indexOf('param1=value1') > 0).toBe(true);
        expect(result.indexOf('param2=value2') > 0).toBe(true);
    });

    it('check getStyleMetadataService', () => {
        const result = API.getStyleMetadataService(layer, params);
        expect(result.indexOf('http://localhost:8080/geoserver/rest/sldservice/mylayer/classify.json')).toBe(0);
        expect(result.indexOf('param1=value1') > 0).toBe(true);
        expect(result.indexOf('param2=value2') > 0).toBe(true);
    });
    it('check getStyleParameters', () => {
        const result = API.getStyleParameters(layer, params);
        expect(result).toIncludeKey('SLD');
        expect(result).toIncludeKey('viewparams');
        expect(result.SLD.indexOf('http://localhost:8080/geoserver/rest/sldservice/mylayer/classify.xml')).toBe(0);
        expect(result.viewparams.indexOf('param3') >= 0).toBe(true);
    });
    it('check getMetadataParameters', () => {
        const result = API.getMetadataParameters(layer, params);
        expect(result).toIncludeKey('param1');
        expect(result).toIncludeKey('viewparams');
        expect(result.param1).toBe('value1');
    });
    it('check getFieldsService', () => {
        const result = API.getFieldsService(layer);
        expect(result.indexOf('http://localhost:8080/geoserver/rest/sldservice/mylayer/attributes.json')).toBe(0);
    });
    it('check getFieldsService with datatable', () => {
        const result = API.getFieldsService(layerWithDataTable);
        expect(result.indexOf('http://localhost:8080/geoserver/rest/sldservice/datatable/attributes.json')).toBe(0);
    });
    it('check readFields', () => {
        const result = API.readFields(fields);
        expect(result.length).toBe(2);
        expect(result[0].name).toBe('aaa');
    });
    it('check readClassification polygon', () => {
        const result = API.readClassification(classification);
        expect(result.length).toBe(1);
        expect(result[0].color).toBe('#FF0000');
        expect(result[0].type).toBe('Polygon');
        expect(result[0].min).toBe(1);
        expect(result[0].max).toBe(10);
    });
    it('check readClassification line', () => {
        const result = API.readClassification(lineClassification);
        expect(result.length).toBe(1);
        expect(result[0].color).toBe('#FF0000');
        expect(result[0].type).toBe('LineString');
        expect(result[0].min).toBe(1);
        expect(result[0].max).toBe(10);
    });
    it('check readClassification point', () => {
        const result = API.readClassification(pointClassification);
        expect(result.length).toBe(1);
        expect(result[0].color).toBe('#FF0000');
        expect(result[0].type).toBe('Point');
        expect(result[0].min).toBe(1);
        expect(result[0].max).toBe(10);
    });
    it('check readClassification invalid', () => {
        let error = false;
        try {
            API.readClassification(invalidClassification);
        } catch(e) {
            error = true;
        }
        expect(error).toBe(true);
    });
    it('check readClassification with zeros', () => {
        const result = API.readClassification(classificationWithZeros);
        expect(result.length).toBe(1);
        expect(result[0].color).toBe('#FF0000');
        expect(result[0].min).toBe(0);
        expect(result[0].max).toBe(10);
    });
    it('check getThematicParameters', () => {
        const result = API.getThematicParameters(paramsDef);
        expect(result.length).toBe(2);
        expect(result[0].values).toExist();
    });
    it('check getColors only standard', () => {
        const result = API.getColors(undefined, layer, 10);
        expect(result.length).toBe(5);
        expect(result[0].colors).toExist();
        expect(result[0].colors.length).toBe(10);
    });
    it('check getColors custom colors', () => {
        const result = API.getColors(colors, layer, 10);
        expect(result.length).toBe(1);
        expect(result[0].colors).toExist();
        expect(result[0].colors.length).toBe(10);
    });
    it('check getColors layer colors', () => {
        const result = API.getColors(undefined, layerWithColors, 10);
        expect(result.length).toBe(1);
        expect(result[0].colors).toExist();
        expect(result[0].colors.length).toBe(10);
    });
    it('check getColors layer with additional colors', () => {
        const result = API.getColors(undefined, layerWithAdditionalColors, 10);
        expect(result.length).toBe(6);
        expect(result[0].colors).toExist();
        expect(result[0].colors.length).toBe(10);
    });
    it('check hasThematicStyle on no thematized layer', () => {
        const result = API.hasThematicStyle(layer);
        expect(result).toBe(false);
    });
    it('check hasThematicStyle on thematized layer', () => {
        const result = API.hasThematicStyle(layerWithThema);
        expect(result).toBe(true);
    });
    it('check removeThematicStyle', () => {
        const result = API.removeThematicStyle(layerWithThema);
        expect(result.SLD).toNotExist();
    });
});
