
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require("react");
const {compose, withProps, withStateHandlers, withPropsOnChange} = require("recompose");
const {connect} = require("react-redux");
const { onEditRule, delRules, onCacheClean} = require('../../actions/rulesmanager');
const {rulesEditorToolbarSelector} = require('../../selectors/rulesmanager');
const Toolbar = require('../../components/misc/toolbar/Toolbar');
const Modal = require("../../components/manager/rulesmanager/ModalDialog");
const Message = require("../../components/I18N/Message");

const ToolbarWithModal = ({modalsProps, loading, ...props}) => {
    return (
        <div>
            <Toolbar {...props}/>
            <Modal {...modalsProps}/>
            <div className={`toolbar-loader ${loading ? 'ms-circle-loader-md' : ''}`}/>
        </div>
    );
};

const EditorToolbar = compose(
    connect(
        rulesEditorToolbarSelector,
        {
            deleteRules: delRules,
            editOrCreate: onEditRule,
            cleanCache: onCacheClean
        }
    ),
    withStateHandlers(() => ({
        modal: "none"
    }), {
        cancelModal: () => () => ({
            modal: "none"
        }),
        showModal: () => (modal) => ({
            modal
        })
    }),
    withProps(({
        showAdd, showEdit, showModal, showInsertBefore, showInsertAfter, showDel, showCache,
        editOrCreate = () => {}
    }) => ({
        buttons: [{
            glyph: 'plus',
            tooltipId: 'rulesmanager.tooltip.addT',
            visible: showAdd,
            onClick: editOrCreate.bind(null, 0, true)
        }, {
            glyph: 'pencil',
            tooltipId: 'rulesmanager.tooltip.editT',
            visible: showEdit,
            onClick: editOrCreate.bind(null, 0, false)
        }, {
            glyph: 'add-row-before',
            tooltipId: 'rulesmanager.tooltip.addBeT',
            visible: showInsertBefore,
            onClick: editOrCreate.bind(null, -1, true)
        }, {
            glyph: 'add-row-after',
            tooltipId: 'rulesmanager.tooltip.addAfT',
            visible: showInsertAfter,
            onClick: editOrCreate.bind(null, 1, true)
        }, {
            glyph: 'trash',
            tooltipId: 'rulesmanager.tooltip.deleteT',
            visible: showDel,
            onClick: () => {
                showModal("delete");
            }
        }, {
            glyph: 'clear-brush',
            tooltipId: 'rulesmanager.tooltip.cacheT',
            visible: showCache,
            onClick: () => {
                showModal("cache");
            }
        }]
    })),
    withPropsOnChange(["modal"], ({modal, cancelModal, deleteRules, cleanCache}) => {
        switch (modal) {
        case "delete":
            return {
                modalsProps: {
                    showDialog: true,
                    title: "rulesmanager.deltitle",
                    buttons: [{
                        text: <Message msgId="no"/>,
                        bsStyle: 'primary',
                        onClick: cancelModal
                    },
                    {
                        text: <Message msgId="yes"/>,
                        bsStyle: 'primary',
                        onClick: () => { cancelModal(); deleteRules(); }
                    }
                    ],
                    closeAction: cancelModal,
                    msg: "rulesmanager.delmsg"
                }
            };
        case "cache":
            return {
                modalsProps: {
                    showDialog: true,
                    title: "rulesmanager.cachetitle",
                    buttons: [{
                        text: <Message msgId="no"/>,
                        bsStyle: 'primary',
                        onClick: cancelModal
                    },
                    {
                        text: <Message msgId="yes"/>,
                        bsStyle: 'primary',
                        onClick: () => { cancelModal(); cleanCache(); }
                    }
                    ],
                    closeAction: cancelModal,
                    msg: "rulesmanager.cachemsg"
                }
            };
        default:
            return {
                modalsProps: {showDialog: false,
                    title: "",
                    buttons: [],
                    closeAction: cancelModal,
                    msg: ""
                }
            };
        }

    })
)( ToolbarWithModal);

module.exports = EditorToolbar;
