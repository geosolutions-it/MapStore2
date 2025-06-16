
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { compose, withProps, withStateHandlers, withPropsOnChange } from 'recompose';
import { connect } from 'react-redux';
import { onEditRule, delRules, onCacheClean, delGSInstance, onEditGSInstance } from '../../actions/rulesmanager';
import { rulesEditorToolbarSelector } from '../../selectors/rulesmanager';
import Toolbar from '../../components/misc/toolbar/Toolbar';
import Modal from '../../components/manager/rulesmanager/ModalDialog';
import Message from '../../components/I18N/Message';

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
            cleanCache: onCacheClean,
            // for gs instances
            editOrCreateGSInstance: onEditGSInstance,
            deleteGSInstances: delGSInstance
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
        showAdd,
        showEdit,
        showModal,
        showInsertBefore,
        showInsertAfter,
        showDel,
        showCache,
        editOrCreate = () => {},
        activeGrid = 'rules',
        // for gs instances
        editOrCreateGSInstance,
        showAddGSInstance,
        showEditGSInstance,
        showDelGSInstance
    }) => ({
        buttons: [{
            glyph: 'plus',
            tooltipId: 'rulesmanager.tooltip.addT',
            visible: showAdd && activeGrid === 'rules',
            onClick: editOrCreate.bind(null, 0, true)
        }, {
            glyph: 'pencil',
            tooltipId: 'rulesmanager.tooltip.editT',
            visible: showEdit && activeGrid === 'rules',
            onClick: editOrCreate.bind(null, 0, false)
        }, {
            glyph: 'add-row-before',
            tooltipId: 'rulesmanager.tooltip.addBeT',
            visible: showInsertBefore && activeGrid === 'rules',
            onClick: editOrCreate.bind(null, -1, true)
        }, {
            glyph: 'add-row-after',
            tooltipId: 'rulesmanager.tooltip.addAfT',
            visible: showInsertAfter && activeGrid === 'rules',
            onClick: editOrCreate.bind(null, 1, true)
        }, {
            glyph: 'trash',
            tooltipId: 'rulesmanager.tooltip.deleteT',
            visible: showDel && activeGrid === 'rules',
            onClick: () => {
                showModal("delete");
            }
        }, {
            glyph: 'clear-brush',
            tooltipId: 'rulesmanager.tooltip.cacheT',
            visible: showCache && activeGrid === 'rules',
            onClick: () => {
                showModal("cache");
            }
        },
        // for gs instances
        {
            glyph: 'plus',
            tooltipId: 'rulesmanager.tooltip.addGSInstance',
            visible: showAddGSInstance && activeGrid === 'gsInstances',
            onClick: editOrCreateGSInstance.bind(null, true)
        }, {
            glyph: 'pencil',
            tooltipId: 'rulesmanager.tooltip.editGSInstance',
            visible: showEditGSInstance && activeGrid === 'gsInstances',
            onClick: editOrCreateGSInstance.bind(null, 0, false)
        }, {
            glyph: 'trash',
            tooltipId: 'rulesmanager.tooltip.deleteGSInstance',
            visible: showDelGSInstance && activeGrid === 'gsInstances',
            onClick: () => {
                showModal("delete-gs-instance");
            }
        }]
    })),
    withPropsOnChange(["modal"], ({modal, cancelModal, deleteRules, cleanCache, deleteGSInstances}) => {
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
        case "delete-gs-instance":
            return {
                modalsProps: {
                    showDialog: true,
                    title: "rulesmanager.delGSInstancetitle",
                    buttons: [{
                        text: <Message msgId="no"/>,
                        bsStyle: 'primary',
                        onClick: cancelModal
                    },
                    {
                        text: <Message msgId="yes"/>,
                        bsStyle: 'primary',
                        onClick: () => { cancelModal(); deleteGSInstances(); }
                    }
                    ],
                    closeAction: cancelModal,
                    msg: "rulesmanager.delGSInstancemsg"
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

export default EditorToolbar;
