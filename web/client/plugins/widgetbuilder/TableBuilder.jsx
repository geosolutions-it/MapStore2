import { mapPropsStream } from 'recompose';

/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const {get} = require('lodash');
const { isGeometryType } = require('../../utils/ogc/WFS/base');
const { compose, renameProps, branch, renderComponent } = require('recompose');
const InfoPopover = require('../../components/widgets/widget/InfoPopover');
const Message = require('../../components/I18N/Message');
const BorderLayout = require('../../components/layout/BorderLayout');

const { insertWidget, onEditorChange, setPage, openFilterEditor, changeEditorSetting } = require('../../actions/widgets');

const builderConfiguration = require('../../components/widgets/enhancers/builderConfiguration');

const {
    wizardStateToProps,
    wizardSelector
} = require('./commons');

const Builder = connect(
    wizardSelector,
    {
        setPage,
        setValid: valid => changeEditorSetting("valid", valid),
        onEditorChange,
        insertWidget
    },
    wizardStateToProps
)(compose(
    builderConfiguration,
    renameProps({
        editorData: "data",
        onEditorChange: "onChange"
    }),
    mapPropsStream(props$ => props$.merge(
        props$
            .distinctUntilChanged(({ featureTypeProperties: oldFT } = {}, { featureTypeProperties: newFT } = {}) => oldFT === newFT)
            // set propTypes to all attributes when
            .do(({ featureTypeProperties = [], onChange = () => {} } = {}) => {
                if (onChange && featureTypeProperties.length > 0) {
                    onChange("options.propertyName", featureTypeProperties.filter(a => !isGeometryType(a)).map(ft => ft.name));
                }
            }).ignoreElements()
        ))
)(require('../../components/widgets/builder/wizard/TableWizard')));

const BuilderHeader = require('./BuilderHeader');
const Toolbar = connect(wizardSelector, {
    openFilterEditor,
    setPage,
    insertWidget
},
    wizardStateToProps
)(require('../../components/widgets/builder/wizard/table/Toolbar'));

/*
 * in case you don't have a layer selected (e.g. dashboard) the chartbuilder
 * prompts a catalog view to allow layer selection
 */
const chooseLayerEhnancer = compose(
    connect(wizardSelector),
    branch(
        ({ layer } = {}) => !layer,
        renderComponent(require('./LayerSelector'))
    )
);

module.exports = chooseLayerEhnancer(({ enabled, onClose = () => { }, editorData = {}, dependencies, ...props } = {}) =>

    (<BorderLayout
        header={
            <BuilderHeader onClose={onClose}>
                <Toolbar onClose={onClose} />
                {get(editorData, "options.propertyName.length") === 0 ? <InfoPopover
                    glyph="exclamation-mark"
                    bsStyle="warning"
                    text={<Message msgId="widgets.builder.errors.checkAtLeastOneAttribute" />} /> : null}
            </BuilderHeader>}
    >
        {enabled ? <Builder editorData={editorData} dependencies={dependencies} {...props} /> : null}
    </BorderLayout>));
