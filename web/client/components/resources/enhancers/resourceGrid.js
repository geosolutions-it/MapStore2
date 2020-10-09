
/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const { compose, branch, withState, withHandlers, defaultProps, mapProps } = require('recompose');

const handleSave = require('../modals/enhancers/handleSave').default;
const handleSaveModal = require('../modals/enhancers/handleSaveModal').default;
const handleResourceDownload = require('../modals/enhancers/handleResourceDownload');
const handleDetailsDownload = require('../modals/enhancers/handleDetailsDownload').default;

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
        branch(
            ({ show }) => !show,
            handleDetailsDownload,
            compose(
                handleSave,
                handleSaveModal
            )
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
    withState('showDetailsSheet', 'setShowDetailsSheet', false),
    withState('loadingResource', 'setLoadingResource', false),
    withState('loadedResource', 'setLoadedResource'),
    withHandlers({
        onEdit: ({ setEdit = () => { }, setResource = () => { } }) => (resource) => {
            if (resource) {
                setResource(resource);
                setEdit(true);
            } else {
                setResource(undefined);
                setEdit(false);
            }

        },
        onShowDetailsSheet: ({ setShowDetailsSheet = () => { }, setLoadingResource = () => { }, setResource = () => { }, loadedResource }) => (resource) => {
            if (resource) {
                const details = resource?.details || resource?.attributes?.details;
                const detailsLoaded = loadedResource?.details || loadedResource?.attributes?.details;

                if (resource?.id !== loadedResource?.id || details !== detailsLoaded) {
                    setLoadingResource(true);
                }

                setResource(resource);
                setShowDetailsSheet(true);
            }
        },
        onHideDetailsSheet: ({ setShowDetailsSheet = () => { } }) => () => {
            setShowDetailsSheet(false);
        },
        onResourceLoad: ({ setLoadedResource = () => { }, setLoadingResource = () => { } }) => (resource, linkedResources) => {
            setLoadedResource({...resource, linkedResources});
            setLoadingResource(false);
        }
    }),
    mapProps(({loading, loadingResource, loadedResource, ...other}) => ({
        ...other,
        loadedResource,
        loading: loading || loadingResource || false,
        detailsText: loadedResource?.linkedResources?.details?.data === 'NODATA' ? undefined : loadedResource?.linkedResources?.details?.data
    }))
);

module.exports = resourceGrid;
