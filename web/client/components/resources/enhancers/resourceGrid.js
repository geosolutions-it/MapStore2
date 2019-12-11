
/*
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');
const { compose, branch, withState, withHandlers, defaultProps, mapPropsStream, createEventHandler } = require('recompose');

const handleSaveModal = require('../modals/enhancers/handleSaveModal');
const handleResourceDownload = require('../modals/enhancers/handleResourceDownload');
const { updateResource } = require('../../../api/persistence');

const handleSave = mapPropsStream(props$ => {
    const { handler: onSave, stream: saveEventStream$ } = createEventHandler();
    const saveStream$ =
        saveEventStream$
            .withLatestFrom(props$)
            .switchMap(([resource, props]) =>
                updateResource(resource)
                    .do(() => {
                        if (props) {
                            if (props.onClose) {
                                props.onClose();
                            }
                            if (props.onSaveSuccess) {
                                props.onSaveSuccess(resource);
                            }
                            if (props.onShowSuccessNotification) {
                                props.onShowSuccessNotification();
                            }
                        }
                    })
                    .concat(Rx.Observable.of({ loading: false }))
                    .startWith({ loading: true })
                    .catch(e => {
                        props.setErrors([...(props.errors || []), e]);
                        return Rx.Observable.of({
                            loading: false
                        });
                    })
            );
    return props$.combineLatest(
        saveStream$.startWith({}),
        (props, saveProps) => ({
            ...props,
            ...saveProps,
            errors: props.errors,
            onSave
        })
    );
});
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
