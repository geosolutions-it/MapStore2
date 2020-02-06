/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Toolbar = require('../misc/toolbar/Toolbar');
const ResizableModal = require('../misc/ResizableModal');
const Portal = require('../misc/Portal');
const Message = require('../I18N/Message');
const { Alert } = require('react-bootstrap');

/**
 * Component for rendering Toolbar for Style Editor.
 * @memberof components.styleeditor
 * @name StyleToolbar
 * @class
 * @prop {string} status status of style editor, '', 'edit' or 'template'
 * @prop {array|node} buttons additional buttons, array of buttons object or toolbar node
 * @prop {bool} editEnabled enable/disable edit/templates buttons
 * @prop {array} defaultStyles array of style names not editable
 * @prop {bool} enableSetDefaultStyle enable/disable set default style button
 * @prop {bool} loading loading state
 */

const StyleToolbar = ({
    status,
    buttons = [],
    templateId,
    error,
    isCodeChanged,
    showModal,
    onShowModal,
    loading,
    selectedStyle,
    layerDefaultStyleName,
    editEnabled,
    enableSetDefaultStyle,
    defaultStyles = [
        'generic',
        'point',
        'line',
        'polygon',
        'raster'
    ],
    onBack = () => {},
    onAdd = () => {},
    onReset = () => {},
    onDelete = () => {},
    onSelectStyle = () => {},
    onEditStyle = () => {},
    onUpdate = () => {},
    onSetDefault = () => {},
    disableCodeEditing
}) => (
    <div>
        <Toolbar
            btnDefaultProps={{
                className: 'square-button-md',
                bsStyle: 'primary'
            }}
            buttons={[
                {
                    glyph: 'arrow-left',
                    visible: !!status,
                    tooltipId: 'styleeditor.backToList',
                    disabled: !!loading,
                    onClick: () => {
                        if (status === 'edit' && isCodeChanged) {
                            onShowModal({
                                title: <Message msgId="styleeditor.closeWithoutSaveAlertTitle"/>,
                                message: (<Alert bsStyle="warning" style={{ margin: 0 }}>
                                    <Message msgId="styleeditor.closeWithoutSaveAlert"/>
                                </Alert>),
                                buttons: [
                                    {
                                        text: <Message msgId="close"/>,
                                        bsStyle: 'primary',
                                        onClick: () => {
                                            onShowModal(null);
                                            onBack();
                                            onReset();
                                        }
                                    }
                                ]
                            });
                        } else {
                            onBack();
                            onReset();
                        }
                    }
                },
                {
                    glyph: '1-stilo',
                    tooltipId: 'styleeditor.createNewStyle',
                    visible: !status && editEnabled ? true : false,
                    disabled: !!loading,
                    onClick: () => onSelectStyle()
                },
                {
                    glyph: 'code',
                    tooltipId: 'styleeditor.editSelectedStyle',
                    visible: !status && editEnabled ? true : false,
                    disabled: !!loading
                        || defaultStyles.indexOf(selectedStyle) !== -1
                        // empty or "" means layer's default style.
                        // You can edit this only if it not one of GeoServer's default
                        || !selectedStyle && defaultStyles.indexOf(layerDefaultStyleName) !== -1
                        || disableCodeEditing,
                    onClick: () => onEditStyle()
                },
                {
                    glyph: 'ok',
                    tooltipId: 'styleeditor.saveCurrentStyle',
                    disabled: !!(error && error.edit && error.edit.status) || !!loading || defaultStyles.indexOf(selectedStyle) !== -1,
                    visible: status === 'edit' && editEnabled ? true : false,
                    onClick: () => onUpdate()
                },
                {
                    glyph: 'plus',
                    tooltipId: 'styleeditor.addSelectedTemplate',
                    visible: status === 'template' && templateId && editEnabled ? true : false,
                    disabled: !!loading,
                    onClick: () => onAdd()
                },
                {
                    glyph: 'trash',
                    tooltipId: 'styleeditor.deleteSelectedStyle',
                    disabled: !!loading || defaultStyles.indexOf(selectedStyle) !== -1 || !selectedStyle,
                    visible: !status && editEnabled ? true : false,
                    onClick: () => {
                        onShowModal({
                            title: <Message msgId="styleeditor.deleteStyleAlertTitle"/>,
                            message: (<Alert bsStyle="warning" style={{ margin: 0 }}>
                                <Message msgId="styleeditor.deleteStyleAlert"/>
                            </Alert>),
                            buttons: [
                                {
                                    text: <Message msgId="styleeditor.delete"/>,
                                    bsStyle: 'primary',
                                    onClick: () => {
                                        onShowModal(null);
                                        onDelete(selectedStyle);
                                    }
                                }
                            ]
                        });
                    }
                },
                {
                    glyph: 'star',
                    tooltipId: 'styleeditor.setDefaultStyle',
                    disabled: !!loading || defaultStyles.indexOf(selectedStyle) !== -1 || !selectedStyle,
                    visible: enableSetDefaultStyle && !status && editEnabled ? true : false,
                    onClick: () => onSetDefault()
                },
                ...(!!status ? [] : buttons)
            ]} />
        <Portal>
            <ResizableModal
                show={showModal}
                fitContent
                title={showModal && showModal.title}
                onClose={() => onShowModal(null)}
                buttons={showModal && showModal.buttons}>
                {showModal && showModal.message}
            </ResizableModal>
        </Portal>
    </div>
);

module.exports = StyleToolbar;
