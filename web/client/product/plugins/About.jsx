/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');

const About = require('../components/viewer/about/About');
const AboutContent = require('../components/viewer/about/AboutContent');

module.exports = {
    AboutPlugin: assign(About, {
        DrawerMenu: {
            name: 'about',
            position: 4,
            title: 'aboutLbl',
            renderInModal: true,
            panel: AboutContent
        }
    }),
    reducers: {}
};
