/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';


import ConfirmDialog from '../../layout/ConfirmDialog';

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
                show={showConfirm}
                onCancel={() => {
                    setResourceToDelete();
                    setShowConfirm(false);
                }}
                onConfirm={() => {
                    setShowConfirm(false);
                    onDelete(resourceToDelete);
                    setResourceToDelete();
                }}
                preventHide
                titleId={"mapCatalog.deleteConfirmContent"}
                titleParams={{mapName: resourceToDelete?.name}}
                variant="danger"
                confirmId="confirm"
                cancelId="cancel">
            </ConfirmDialog>
        </>
    );
};
