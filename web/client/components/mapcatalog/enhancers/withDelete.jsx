/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import Message from '../../I18N/Message';
import ConfirmDialog from '../../misc/ConfirmDialog';

export default (Component) => ({
    onDelete = () => {},
    ...props
}) => {
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [resourceToDelete, setResourceToDelete] = React.useState();

    return (
        <>
            <Component
                {...props}
                onDelete={resource => {
                    setResourceToDelete(resource);
                    setShowConfirm(true);
                }}/>
            <ConfirmDialog
                draggable={false}
                modal
                show={showConfirm}
                onClose={() => {
                    setResourceToDelete();
                    setShowConfirm(false);
                }}
                onConfirm={() => {
                    setShowConfirm(false);
                    onDelete(resourceToDelete);
                    setResourceToDelete();
                }}
                confirmButtonBSStyle="default"
                confirmButtonContent={<Message msgId="confirm"/>}
                closeText={<Message msgId="cancel"/>}
                closeGlyph="1-close">
                <Message msgId="mapCatalog.deleteConfirmContent" msgParams={{mapName: resourceToDelete?.name}}/>
            </ConfirmDialog>
        </>
    );
};
