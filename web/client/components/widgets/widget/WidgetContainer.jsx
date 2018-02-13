/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../I18N/Message');
const BorderLayout = require('../../layout/BorderLayout');
const ConfirmModal = require('../../maps/modals/ConfirmModal');

module.exports = ({
    id,
    title,
    confirmDelete= false,
    toggleDeleteConfirm = () => {},
    onDelete=() => {},
    topLeftItems,
    topRightItems,
    children
    }) =>
    (<div className="mapstore-widget-card" id={id}>
        <BorderLayout header={(<div className="mapstore-widget-info">
                    <div className="mapstore-widget-header">
                        {topLeftItems}
                        <span className="widget-title">{title}</span>
                        <span className="mapstore-widget-options">
                            {topRightItems}
                        </span>
                    </div>
                </div>)}>
                {children}
        </BorderLayout>
        {confirmDelete ? <ConfirmModal
            confirmText={<Message msgId="widgets.widget.menu.delete" />}
            titleText={<Message msgId="widgets.widget.menu.delete" />}
            body={<Message msgId="widgets.widget.menu.confirmDelete" />}
            show={confirmDelete}
            onClose={() => toggleDeleteConfirm(false)}
            onConfirm={() => onDelete(id) }/> : null}
    </div>
);
