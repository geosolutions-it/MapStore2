
/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const { compose, branch, withState, withHandlers, defaultProps } = require('recompose');

const handleSave = require('../modals/enhancers/handleSave').default;
const handleSaveModal = require('../modals/enhancers/handleSaveModal').default;
const handleResourceDownload = require('../modals/enhancers/handleResourceDownload');

/*
 * EditDialog
 * Automatically downloads missing data and manage resource changes. Manages save, triggering onSaveSuccess
 */
const EditDialog = compose(
    handleResourceDownload,
    withHandlers({
        onClose: ({
            setEdit = () => {},
            setErrors = () => {}
        }) => () => {
            setEdit(false);
            setErrors([]);
        }
    }),
    branch(
        ({ resource }) => resource && resource.id,
        compose(
            handleSave,
            handleSaveModal
        )
    )
)(require('../modals/Save'));

const resourceGrid = compose(
    withState('resource', 'setResource'),
    defaultProps({
        bsSize: "small",
        metadataModal: EditDialog
    }),
    withState('resource', 'setResource'),
    withState('edit', 'setEdit', false),
    withState('errors', 'setErrors', ({errors = []}) => errors),
    withHandlers({
        onEdit: ({ setEdit = () => { }, setResource = () => { } }) => (resource) => {
            if (resource) {
                setResource(resource);
                setEdit(true);
            } else {
                setResource(undefined);
                setEdit(false);
            }

        }
    })
);

module.exports = resourceGrid;
