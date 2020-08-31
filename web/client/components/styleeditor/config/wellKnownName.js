/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const wellKnownName = [
    {
        value: 'Circle',
        label: 'styleeditor.circle',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 160,100 A 60,60 0 0 1 100,160 60,60 0 0 1 40,100 60,60 0 0 1 100,40 60,60 0 0 1 160,100 Z',
                stroke: '#f2f2f2',
                fill: "#333333",
                strokeWidth: 4
            }]
        }
    },
    {
        value: 'Square',
        label: 'styleeditor.square',
        preview: {
            type: 'point',
            paths: [{
                d: 'M40 40 L160 40 L160 160 L40 160Z',
                stroke: '#f2f2f2',
                fill: "#333333",
                strokeWidth: 4
            }]
        }
    },
    {
        value: 'Triangle',
        label: 'styleeditor.triangle',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 160,151.96151 H 40 L 99.999999,48.038488 Z',
                stroke: '#f2f2f2',
                fill: "#333333",
                strokeWidth: 4
            }]
        }
    },
    {
        value: 'Star',
        label: 'styleeditor.star',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 165.07677,84.40286 131.87672,116.49613 139.49277,162.03972 98.710865,140.38195 57.749838,161.699 65.745291,116.22048 32.813927,83.851564 78.537289,77.40206 99.145626,36.079922 119.40876,77.572419 Z',
                stroke: '#f2f2f2',
                fill: "#333333",
                strokeWidth: 4
            }]
        }
    },
    {
        value: 'Cross',
        label: 'styleeditor.cross',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 84.99987,39.999998 V 84.999868 H 39.999999 V 115.00013 H 84.99987 V 160 H 115.00013 V 115.00013 H 160 V 84.999868 H 115.00013 V 39.999998 Z',
                stroke: '#f2f2f2',
                fill: "#333333",
                strokeWidth: 4
            }]
        }
    },
    {
        value: 'X',
        label: 'styleeditor.x',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 131.81971,46.966899 100,78.786612 68.180288,46.966898 46.966899,68.180287 78.786613,100 46.9669,131.81971 68.180287,153.0331 100,121.21339 131.81971,153.0331 153.0331,131.81971 121.21339,99.999999 153.0331,68.180286 Z',
                stroke: '#f2f2f2',
                fill: "#333333",
                strokeWidth: 4
            }]
        }
    },
    {
        value: 'shape://vertline',
        label: 'styleeditor.verticalLine',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 100,40 V 160 Z',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }]
        }
    },
    {
        value: 'shape://horline',
        label: 'styleeditor.horizontalLine',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 160,100 40.000002,100 Z',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }]
        }
    },
    {
        value: 'shape://slash',
        label: 'styleeditor.slash',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 142.42641,57.573591 57.573595,142.4264 Z',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }]
        }
    },
    {
        value: 'shape://backslash',
        label: 'styleeditor.backslash',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 142.42641,142.42641 57.573595,57.573594 Z',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }]
        }
    },
    {
        value: 'shape://dot',
        label: 'styleeditor.dot',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 95,100 105,100 Z',
                stroke: '#333333',
                strokeWidth: 10,
                fill: 'none'
            }]
        }
    },
    {
        value: 'shape://plus',
        label: 'styleeditor.plus',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 100,40 V 160 Z',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }, {
                d: 'M 160,100 40.000002,100 Z',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }]
        }
    },
    {
        value: 'shape://times',
        label: 'styleeditor.times',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 142.42641,57.573591 57.573595,142.4264 Z',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }, {
                d: 'M 142.42641,142.42641 57.573595,57.573594 Z',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }]
        }
    },
    {
        value: 'shape://oarrow',
        label: 'styleeditor.openArrow',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 40.027335,53.266123 159.77305,100 40.027335,146.73388',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }]
        }
    },
    {
        value: 'shape://carrow',
        label: 'styleeditor.closedArrow',
        preview: {
            type: 'point',
            paths: [{
                d: 'M 40.027335,53.266123 159.77305,100 40.027335,146.73388Z',
                stroke: '#333333',
                strokeWidth: 4,
                fill: 'none'
            }]
        }
    }
];

export default wellKnownName;
