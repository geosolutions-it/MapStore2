
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
import { onEditRule, delRules, onCacheClean, delGSInstance, onEditGSInstance, storeGSInstancesDDList, onCacheCleanMulti } from '../../actions/rulesmanager';
import { rulesEditorToolbarSelector } from '../../selectors/rulesmanager';
import Toolbar from '../../components/misc/toolbar/Toolbar';
import Modal from '../../components/manager/rulesmanager/ModalDialog';
import Message from '../../components/I18N/Message';
import {error} from '../../actions/notifications';
import GSCleanCacheMenu from './GSCleanCacheMenu';
import { hasConfiguredGSSlaves } from '../../utils/RuleServiceUtils';

const ToolbarWithModal = ({modalsProps, loading, ...props}) => {
    return (
        <div>
            <Toolbar {...props}/>
            {/* Clear cache list for stand-alone geofence only */}
            {props.showGSListToClearCache && (
                <GSCleanCacheMenu
                    onClose={props.toggleGSList}
                    show={props.showGSListToClearCache}
                    onSelectInstance={props.selectInstanceAndOpenModal}
                    onSelectAll={props.selectAllAndOpenModal}
                    gsInstances={props.gsInstances}
                    storeGSInstancesDDList={props.storeGSInstancesDDList}
                    onError={props.onError}
                />
            )}
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
            cleanCacheMulti: onCacheCleanMulti,
            // for gs instances
            editOrCreateGSInstance: onEditGSInstance,
            deleteGSInstances: delGSInstance,
            storeGSInstancesDDList,
            onError: error
        }
    ),
    withStateHandlers(() => ({
        modal: "none",
        // for clean cacche stand-alone geofence
        showGSListToClearCache: false,
        selectedGSInstanceToClearCache: null
    }), {
        cancelModal: () => () => ({
            modal: "none"
        }),
        showModal: () => (modal) => ({
            modal
        }),
        // for the clean cache of stand-alone geofence gs instances
        toggleGSList: ({ showGSListToClearCache }) => () => ({ showGSListToClearCache: !showGSListToClearCache }),
        selectInstanceAndOpenModal: () => (instance) => ({
            modal: "cacheSingleOrMulti",
            showGSListToClearCache: false,
            selectedGSInstanceToClearCache: instance
        }),
        selectAllAndOpenModal: () => () => ({
            modal: "cacheSingleOrMulti",
            showGSListToClearCache: false,
            selectedGSInstanceToClearCache: null
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
        showDelGSInstance,
        isStandAloneGeofence,
        toggleGSList,
        selectInstanceAndOpenModal,
        selectAllAndOpenModal,
        showGSListToClearCache,
        selectedGSInstanceToClearCache
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
            visible: showCache && activeGrid === 'rules' && !isStandAloneGeofence,
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
        }, {
            glyph: 'clear-brush',
            tooltipId: 'rulesmanager.tooltip.cacheT',
            visible: showCache && activeGrid === 'rules' && isStandAloneGeofence,
            onClick: () => {
                // Instead of opening the modal directly, we open the instance list
                toggleGSList();
            }
        }],
        selectInstanceAndOpenModal,
        selectAllAndOpenModal,
        toggleGSList,
        showGSListToClearCache,
        selectedGSInstanceToClearCache
    })),
    withPropsOnChange(["modal", "selectedGSInstanceToClearCache"], ({modal, cancelModal, deleteRules, cleanCache, deleteGSInstances, selectedGSInstanceToClearCache, isStandAloneGeofence, cleanCacheMulti, gsInstances}) => {
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
        case "cacheSingleOrMulti":
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
                        onClick: () => {
                            cancelModal();
                            if (isStandAloneGeofence) {
                                if (!selectedGSInstanceToClearCache) {
                                // props.gsInstances is the array of [{url, name, ...}]
                                    cleanCacheMulti(gsInstances);
                                } else {
                                    const masterName = selectedGSInstanceToClearCache?.name;
                                    // check if slaves gs instances configured and msterName included there
                                    if (hasConfiguredGSSlaves(masterName)) {
                                        // Use multi-cleaner
                                        cleanCacheMulti([selectedGSInstanceToClearCache]);
                                    } else {
                                        // Fallback for single instance (if you pass the whole object there too)
                                        cleanCache(selectedGSInstanceToClearCache.url);
                                    }
                                }
                            } else cleanCache();
                        }
                    }
                    ],
                    closeAction: cancelModal,
                    msg: selectedGSInstanceToClearCache ? "rulesmanager.cacheConfirmSingle" : "rulesmanager.cacheConfirmAll",
                    msgParams: selectedGSInstanceToClearCache ? {instanceName: selectedGSInstanceToClearCache.name} : {}
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
