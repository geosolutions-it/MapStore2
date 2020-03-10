/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import SaveModal from '../../resources/modals/Save';
import handleSaveModal from '../../resources/modals/enhancers/handleSaveModal';

const SaveDialog = handleSaveModal(SaveModal);

export default (Component) => ({
    user,
    saveDialogTitle = 'resources.resource.editResource',
    onSave = () => {},
    ...props
}) => {
    const [showSaveDialog, setShowSaveDialog] = React.useState(false);
    const [resource, setResource] = React.useState();

    return (
        <>
            <Component
                {...props}
                onEdit={resourceToEdit => {
                    setResource(resourceToEdit);
                    setShowSaveDialog(true);
                }}/>
            <SaveDialog
                show={showSaveDialog}
                user={user}
                resource={resource && {
                    ...resource,
                    ...(resource.thumbnail ? {
                        attributes: {
                            ...(resource.attributes || {}),
                            thumbnail: resource.thumbnail,
                            context: resource.context
                        }
                    } : {})}}
                clickOutEnabled={false}
                category="MAP"
                title={saveDialogTitle}
                onSave={resourceToSave => {
                    onSave(resourceToSave);
                    setResource();
                    setShowSaveDialog(false);
                }}
                onClose={() => {
                    setResource();
                    setShowSaveDialog(false);
                }}/>
        </>
    );
};
