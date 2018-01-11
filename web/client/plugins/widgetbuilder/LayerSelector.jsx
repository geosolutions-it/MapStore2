/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const Catalog = require('./Catalog');
const BorderLayout = require('../../components/layout/BorderLayout');
const BuilderHeader = require('./BuilderHeader');
/**
 * Builder page that allows layer's selection
 */
module.exports = ({onClose = () => {}} = {}) =>

    (<BorderLayout
        className="bg-body"
        header={<BuilderHeader onClose={onClose}/>}
        >
        <Catalog />
    </BorderLayout>);
