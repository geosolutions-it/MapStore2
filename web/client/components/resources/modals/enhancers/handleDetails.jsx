/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Rx from 'rxjs';
import { compose, lifecycle, withState, mapPropsStream } from 'recompose';

import GeoStoreApi from '../../../../api/GeoStoreDAO';
import MapUtils from '../../../../utils/MapUtils';

const getDetails = (detailsUri) => {
    const id = MapUtils.getIdFromUri(detailsUri);
    return Rx.Observable.defer(() => id ? GeoStoreApi.getData(id) : Promise.resolve());
};

const handleDetailsDownload = mapPropsStream(props$ =>
    props$.combineLatest(
        props$
            .pluck('resource')
            .distinctUntilChanged((res1, res2) => res1.id === res2.id)
            .switchMap(res =>
                getDetails(res.attributes.details)
                    .map(data => ({
                        detailsTextOriginal: data || 'NODATA'
                    }))
                    .startWith({resource: {}})
                    .catch(() => Rx.Observable.of({
                        detailsTextOriginal: 'NODATA'
                    }))
            )
            .startWith({}),
        (p1, p2) => ({
            ...p1,
            ...p2
        })
    )
);


export default compose(
    withState('showDetailsPreview', 'setShowPreview', false),
    withState('showDetailsSheet', 'setShowDetailsSheet', false),
    withState('detailsText', 'setDetailsText'),
    withState('detailsBackup', 'setDetailsBackup'),
    handleDetailsDownload,
    lifecycle({
        componentDidUpdate(oldProps) {
            if (oldProps.detailsTextOriginal !== this.props.detailsTextOriginal) {
                this.props.setDetailsText(this.props.detailsTextOriginal);
                this.props.setDetailsBackup(this.props.detailsTextOriginal);
            }
        }
    }),
    Component => ({
        setShowPreview,
        setShowDetailsSheet,
        setDetailsText,
        setDetailsBackup,
        setDetailsTextOriginal,
        ...props
    }) => (
        <Component
            {...props}
            onShowDetailsSheet={() => {
                setDetailsBackup(props.detailsText);
                setShowDetailsSheet(true);
            }}
            onHideDetailsSheet={() => setShowDetailsSheet(false)}
            onShowDetailsPreview={() => setShowPreview(true)}
            onHideDetailsPreview={() => setShowPreview(false)}
            onUpdateDetailsText={text => setDetailsText(text)}/>
    )
);
