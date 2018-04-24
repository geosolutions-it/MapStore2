/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { compose, branch, withState, withHandlers, defaultProps } = require('recompose');
const handleSaveModal = require('../modals/enhancers/handleSaveModal');
const handleResourceDownload = require('../modals/enhancers/handleResourceDownload');

/*
 * EditDialog
 * Automatically donwnloads missing data and manage resource changes. Also save.
 */
const EditDialog = compose(
    handleResourceDownload,
    withHandlers({
        onClose: ({ setEdit = () => { } }) => () => setEdit(false)
    }),
    branch(
        ({ resource }) => resource && resource.id,
        handleSaveModal
    )
)(require('../modals/Save'));

const resourceGrid = compose(
    defaultProps({
        bsSize: "small",
        metadataModal: EditDialog
    }),
    withState('resource', 'setResource'),
    withState('edit', 'setEdit', false),
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
