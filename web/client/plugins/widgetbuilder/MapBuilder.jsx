/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {onEditorChange, insertWidget, setPage} = require('../../actions/widgets');
const {wizardSelector, wizardStateToProps} = require('./commons');
const BorderLayout = require('../../components/layout/BorderLayout');
const BuilderHeader = require('./BuilderHeader');

const Toolbar = connect(wizardSelector, {
        setPage,
        insertWidget
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/map/Toolbar'));
const { compose, branch, renderComponent } = require('recompose');
/*
 * in case you don't have a layer selected (e.g. dashboard) the chartbuilder
 * prompts a catalog view to allow layer selection
 */
const chooseMapEnhancer = compose(
    connect(wizardSelector),
    branch(
        ({ editorData = {} } = {}) => !editorData.map,
        renderComponent(require('./MapSelector'))
    )
);
const Builder = connect(
    wizardSelector,
    {
        onChange: onEditorChange
    },
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/MapWizard'));
module.exports = chooseMapEnhancer(({enabled, onClose = () => {}} = {}) =>
    (<BorderLayout
        className = "map-selector"
        header={<BuilderHeader onClose={onClose}><Toolbar /></BuilderHeader>}
        >
        {enabled ? <Builder /> : null}
    </BorderLayout>));
