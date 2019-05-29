/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { connect } = require('react-redux');
const { createSelector } = require('reselect');
const { compose, withState, defaultProps, branch, lifecycle } = require('recompose');

const inlineWidgets = require('./inlineWidgets');

const {
    selectStyleTemplate,
    updateStatus,
    addStyle,
    createStyle,
    updateStyleCode,
    editStyleCode,
    deleteStyle,
    setDefaultStyle
} = require('../../actions/styleeditor');

const { updateOptionsByOwner } = require('../../actions/additionallayers');
const { updateSettingsParams } = require('../../actions/layers');
const { getLayerCapabilities } = require('../../actions/layerCapabilities');

const BorderLayout = require('../../components/layout/BorderLayout');
const Editor = require('../../components/styleeditor/Editor');
const withMask = require('../../components/misc/enhancers/withMask');
const loadingState = require('../../components/misc/enhancers/loadingState');
const emptyState = require('../../components/misc/enhancers/emptyState');
const Loader = require('../../components/misc/Loader');
const Message = require('../../components/I18N/Message');

const {
    templateIdSelector,
    statusStyleSelector,
    codeStyleSelector,
    geometryTypeSelector,
    formatStyleSelector,
    loadingStyleSelector,
    errorStyleSelector,
    layerPropertiesSelector,
    initialCodeStyleSelector,
    addStyleSelector,
    selectedStyleSelector,
    canEditStyleSelector,
    getAllStyles,
    styleServiceSelector,
    getUpdatedLayer,
    selectedStyleFormatSelector
} = require('../../selectors/styleeditor');

const { getEditorMode, STYLE_OWNER_NAME, getStyleTemplates } = require('../../utils/StyleEditorUtils');

const stylesTemplates = getStyleTemplates();

const permissionDeniedEnhancers = emptyState(({canEdit}) => !canEdit, {glyph: 'exclamation-mark', title: <Message msgId="styleeditor.noPermission"/>});

const loadingEnhancers = (funcBool) => loadingState(
    funcBool,
    {
        size: 150,
        style: {
            margin: 'auto'
        }
    },
    props => <div style={{position: 'relative', height: '100%', display: 'flex'}}><Loader {...props}/></div>
);

const StyleCodeEditor = compose(
    defaultProps({
        inlineWidgets
    }),
    connect(
        createSelector(
            [
                codeStyleSelector,
                formatStyleSelector,
                layerPropertiesSelector,
                errorStyleSelector,
                loadingStyleSelector,
                canEditStyleSelector
            ],
            (code, format, hintProperties, error, loading, canEdit) => ({
                code,
                mode: getEditorMode(format),
                hintProperties,
                error: error.edit || null,
                loading,
                canEdit
            })
        ),
        {
            onChange: code => editStyleCode(code)
        }
    ),
    loadingEnhancers(({code, error}) => !code && !error),
    permissionDeniedEnhancers,
    emptyState(({error}) => error && error.status === 404, {glyph: 'exclamation-mark', title: <Message msgId="styleeditor.styleNotFound"/>})
)(props => (
    <BorderLayout>
        <Editor {...props} />
    </BorderLayout>
));

const StyleTemplates = compose(
    defaultProps({
        templates: stylesTemplates
    }),
    connect(
        createSelector(
            [
                templateIdSelector,
                addStyleSelector,
                geometryTypeSelector,
                canEditStyleSelector,
                styleServiceSelector,
                loadingStyleSelector
            ],
            (selectedStyle, add, geometryType, canEdit, { formats = [] } = {}, loading) => ({
                selectedStyle,
                add: add && selectedStyle,
                geometryType,
                canEdit,
                availableFormats: formats,
                loading
            })
        ),
        {
            onSelect: selectStyleTemplate,
            onClose: addStyle.bind(null, false),
            onSave: createStyle
        }
    ),
    permissionDeniedEnhancers,
    loadingEnhancers(({geometryType}) => !geometryType),
    withState('filterText', 'onFilter', ''),
    withState('styleSettings', 'onUpdate', {})
)(require('../../components/styleeditor/StyleTemplates'));

const StyleList = compose(
    connect(
        createSelector(
            [
                statusStyleSelector,
                getAllStyles
            ],
            (status, { defaultStyle, enabledStyle, availableStyles }) => ({
                status,
                defaultStyle,
                enabledStyle,
                availableStyles
            })
        ),
        {
            onSelect: updateSettingsParams
        }
    ),
    withState('filterText', 'onFilter', ''),
    withMask(
        ({ status, readOnly }) => status === 'template' && !readOnly,
        () => <StyleTemplates />,
        {
            maskContainerStyle: {
                display: 'flex',
                position: 'relative'
            },
            maskStyle: {
                overflowY: 'auto',
                left: 0
            }
        }
    )
)(require('../../components/styleeditor/StyleList'));

const StyleToolbar = compose(
    withState('showModal', 'onShowModal'),
    connect(
        createSelector(
            [
                statusStyleSelector,
                templateIdSelector,
                errorStyleSelector,
                initialCodeStyleSelector,
                codeStyleSelector,
                loadingStyleSelector,
                selectedStyleSelector,
                canEditStyleSelector,
                getAllStyles,
                styleServiceSelector,
                selectedStyleFormatSelector
            ],
            (status, templateId, error, initialCode, code, loading, selectedStyle, canEdit, { defaultStyle }, { formats = [ 'sld' ] } = {}, format) => ({
                status,
                templateId,
                error,
                isCodeChanged: initialCode !== code,
                loading,
                selectedStyle: defaultStyle === selectedStyle ? '' : selectedStyle,
                editEnabled: canEdit,
                // enable edit only if service support current format
                disableCodeEditing: formats.indexOf(format) === -1
            })
        ),
        {
            onSelectStyle: updateStatus.bind(null, 'template'),
            onEditStyle: updateStatus.bind(null, 'edit'),
            onBack: updateStatus.bind(null, ''),
            onReset: updateOptionsByOwner.bind(null, STYLE_OWNER_NAME, [{}]),
            onAdd: addStyle.bind(null, true),
            onUpdate: updateStyleCode,
            onDelete: deleteStyle,
            onSetDefault: setDefaultStyle
        }
    )
)(require('../../components/styleeditor/StyleToolbar'));

const ReadOnlyStyleList = compose(
    connect(createSelector(
        [
            getUpdatedLayer
        ],
        (layer) => ({
            layer
        })
    ), {
        onInit: getLayerCapabilities
    }),
    lifecycle({
        componentWillMount() {
            if (this.props.onInit && this.props.layer) {
                this.props.onInit(this.props.layer);
            }
        }
    })
)(
    () =>
        <BorderLayout className="ms-style-editor-container" footer={<div style={{ height: 25 }} />}>
            <StyleList readOnly />
        </BorderLayout>
);

module.exports = {
    StyleSelector: branch(
        ({ readOnly }) => readOnly,
        () => ReadOnlyStyleList
    )(StyleList),
    StyleTemplates,
    StyleToolbar,
    StyleCodeEditor
};
