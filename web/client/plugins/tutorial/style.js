/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const introStyle = {
    backgroundColor: 'transparent',
    color: '#fff',
    mainColor: '#fff',
    textAlign: 'center',
    header: {
        padding: 5,
        fontFamily: 'Georgia, serif',
        fontSize: '2.8em'
    },
    main: {
        fontSize: '1.0em',
        padding: 5
    },
    footer: {
        padding: 10
    },
    button: {
        color: '#fff',
        backgroundColor: '#078aa3'
    },
    close: {
        display: 'none'
    },
    skip: {
        color: '#fff'
    }
};

const defaultStyle = {
    mainColor: '#888',
    header: {
        fontFamily: 'Georgia, serif',
        fontSize: '1.5em',
        borderBottom: '1px solid #ddd'
    },
    main: {
        fontSize: '0.9em'
    },
    button: {
        color: '#fff',
        backgroundColor: '#078aa3'
    },
    skip: {
        color: '#AAA'
    }
};

/*

// step example

{
    title: 'Welcome in MapStore2',
    text: 'click next to start the tour',
    // add custom
    // texts: {deDE:'Hallo', enUS:'Hello', frFR:'Bonjour', itIT:'Ciao'}
    selector: '#selector',
    position: 'top', // top, top-left, top-right, bottom, bottom-left, bottom-right, right and left
    type: 'click', // hover
    isFixed: false,
    allowClicksThruHole: false,
    style: {
        ... -> style
    }
    // trigger: The DOM element that will trigger the tooltip
};

// style example

{
    backgroundColor: '#333',
    borderRadius: 10,
    color: '#333',
    mainColor: '#333',
    textAlign: 'left',
    width: 10,
    header: {
        backgroundColor: '#333',
        borderRadius: 10,
        color: '#333',
        mainColor: '#333',
        textAlign: 'left',
        width: 10
    },
    main: {
        backgroundColor: '#333',
        borderRadius: 10,
        color: '#333',
        mainColor: '#333',
        textAlign: 'left',
        width: 10
    },
    button: {
        backgroundColor: '#333',
        borderRadius: 10,
        color: '#333',
        mainColor: '#333',
        textAlign: 'left',
        width: 10
    },
    skip: {
        backgroundColor: '#333',
        borderRadius: 10,
        color: '#333',
        mainColor: '#333',
        textAlign: 'left',
        width: 10
    },
    back: {
        backgroundColor: '#333',
        borderRadius: 10,
        color: '#333',
        mainColor: '#333',
        textAlign: 'left',
        width: 10
    },
    close: {
        backgroundColor: '#333',
        borderRadius: 10,
        color: '#333',
        mainColor: '#333',
        textAlign: 'left',
        width: 10
    },
    hole: {
        backgroundColor: '#333',
        borderRadius: 10,
        color: '#333',
        mainColor: '#333',
        textAlign: 'left',
        width: 10
    },
    beacon: {
        offsetX: 10,
        offsetY: 10,
        inner: '#333',
        outer: '#333'
    }
}
*/

module.exports = {
    introStyle,
    defaultStyle
};
