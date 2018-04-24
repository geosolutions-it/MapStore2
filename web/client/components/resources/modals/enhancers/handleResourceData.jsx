/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { compose, withStateHandlers, withState, branch, withHandlers, renderComponent} = require('recompose');
const {set} = require('../../../../utils/ImmutableUtils');
const Message = require('../../../I18N/Message');
const ConfirmDialog = require('../ConfirmModal');

/**
 * Enhancer to manage resource data for a Save dialog.
 * Stores the original data to handle changes.
 */
module.exports = compose(
    withStateHandlers(
        ({resource = {}}) => ({
            originalData: resource,
            metadata: {
                name: resource.name,
                description: resource.description
            },
            resource: {
                id: resource.id,
                attributes: resource.attributes,
                metadata: {
                    name: resource.name,
                    description: resource.description
                }
            }

        }),
        {
            onUpdate: ({resource}) => (key, value) => ({
                hasChanges: true,
                resource: set(key, value, resource)
            }),
            onUpdateLinkedResource: ({ linkedResources = {} }) => (key, data, category, options = {}) => ({
                linkedResources: set(key, {
                    category,
                    data,
                    ...options
                }, linkedResources)
            })
        }
    ),
    // manage close confirm
    withState('confirmClose', 'onCloseConfirm', false),
    branch(
        ({ confirmClose }) => confirmClose,
        renderComponent(({ onCloseConfirm, onClose }) =>
        (<ConfirmDialog
            show
            confirmText={<Message msgId="dashboard.saveDialog.close" />}
            cancelText={<Message msgId="dashboard.saveDialog.cancel" />}
            onConfirm={() => onClose()}
            onClose={() => onCloseConfirm(false)}
            >
            <Message msgId="map.details.fieldsChanged" />
            <br/>
            <Message msgId="map.details.sureToClose" />
            </ConfirmDialog>))
    ),
    withHandlers({
        onClose: ({
                hasChanges,
                onClose = () => {},
                onCloseConfirm = () => {}}
            ) => () =>
                hasChanges
                ? onCloseConfirm(true)
                : onClose()
    }),
    // manage save handler
    withHandlers({
        onSave: ({onSave = () => {}, category = "DASHBOARD", data, linkedResources}) => resource => onSave({
            category,
            linkedResources,
            data,
            ...resource
        })
    })
);
