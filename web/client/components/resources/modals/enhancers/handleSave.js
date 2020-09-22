/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import Rx from 'rxjs';
import { mapPropsStream, createEventHandler } from 'recompose';

import { updateResource, updateResourceAttribute } from '../../../../api/persistence';

export default mapPropsStream(props$ => {
    const { handler: onSave, stream: saveEventStream$ } = createEventHandler();
    const saveStream$ =
        saveEventStream$
            .withLatestFrom(props$)
            .switchMap(([resource, props]) =>
                updateResource(resource)
                    .flatMap(rid => resource.category === 'MAP' ? updateResourceAttribute({
                        id: rid,
                        name: 'detailsSettings',
                        value: JSON.stringify(resource.attributes?.detailsSettings || {})
                    }) : Rx.Observable.of(rid))
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
                        if (props.setErrors) {
                            props.setErrors([...(props.errors || []), e]);
                        }

                        if (props.onSaveError) {
                            props.onSaveError(e, props.errors);
                        }

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
