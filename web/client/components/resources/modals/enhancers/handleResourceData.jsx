/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {isString, isUndefined} from 'lodash';
import React from 'react';
import { branch, compose, renderComponent, withHandlers, withState, withStateHandlers } from 'recompose';

import {set} from '../../../../utils/ImmutableUtils';
import Message from '../../../I18N/Message';
import ConfirmDialog from '../ConfirmModal';

/**
 * Enhancer to manage resource data for a Save dialog.
 * Stores the original data to handle changes.
 * @deprecated
 */
export default compose(
    withStateHandlers(
        ({resource = {}, linkedResources = {}, user = {}}) => {
            const detailsSettingsString = resource.detailsSettings || resource.attributes?.detailsSettings;
            let detailsSettings = {};

            if (isString(detailsSettingsString)) {
                try {
                    detailsSettings = JSON.parse(detailsSettingsString);
                } catch (e) {
                    detailsSettings = {};
                }
            } else {
                detailsSettings = detailsSettingsString || {};
            }

            return {
                originalData: resource,
                metadata: {
                    name: resource.name,
                    description: resource.description
                },
                attributes: {
                    ...resource.attributes,
                    context: resource.context || resource.attributes && resource.attributes.context,
                    detailsSettings
                },
                resource: {
                    id: resource.id,
                    attributes: {
                        ...resource.attributes,
                        context: resource.context || resource.attributes && resource.attributes.context,
                        detailsSettings
                    },
                    metadata: {
                        name: resource.name,
                        description: resource.description,
                        advertised: isUndefined(resource.advertised) ? true : resource.advertised
                    },
                    createdAt: resource.creation,
                    modifiedAt: resource.lastUpdate,
                    creator: user?.role === 'ADMIN' ? resource.creator : '',
                    editor: user?.role === 'ADMIN' ? resource.editor : ''
                },
                linkedResources
            };
        },
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
                confirmText={<Message msgId="saveDialog.close" />}
                cancelText={<Message msgId="saveDialog.cancel" />}
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
        onSave: ({onSave = () => {}, category = "DASHBOARD", data, additionalAttributes = {}, linkedResources}) => resource => onSave({
            category,
            linkedResources,
            data,
            ...resource,
            attributes: {
                ...resource.attributes,
                ...additionalAttributes
            }
        })
    })
);
