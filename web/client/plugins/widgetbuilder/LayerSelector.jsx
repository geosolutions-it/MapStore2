/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const Catalog = require('./Catalog');
const Rx = require('rxjs');
const BorderLayout = require('../../components/layout/BorderLayout');
const BuilderHeader = require('./BuilderHeader');
const {recordToLayer} = require('../../utils/CatalogUtils');
const canGenerateCharts = require('../../observables/wigets/canGenerateCharts');
const {compose, withState, mapPropsStream} = require('recompose');
/**
 * Builder page that allows layer's selection
 */
module.exports = compose(
     withState('selected', "setSelected", null),
     mapPropsStream(props$ =>
         props$.distinct(({selected} = {}) => selected).filter(({selected} = {}) => selected)
         .switchMap(
             ({selected, setLayer = () => {}} = {}) =>
                canGenerateCharts(recordToLayer(selected))
                    .do(setLayer(recordToLayer(selected)))
                    .mapTo({canProceed: true})
                    .catch((error) => Rx.Observable.of({error, canProceed: false}))
        ).startWith({})
        .combineLatest(props$, ({canProceed} = {}, props) => ({
            canProceed,
            ...props
        })
        )
    )
)(({onClose = () => {}, setSelected = () => {}, selected, canProceed} = {}) =>
    (<BorderLayout
        className="bg-body"
        header={<BuilderHeader onClose={onClose}>{canProceed ? "Can Proceed" : ""}</BuilderHeader>}
        >
        <Catalog selected={selected} catalog={{type: "csw", URL: "https://demo.geo-solutions.it/geoserver/csw"}} onRecordSelected={r => setSelected(r)} />
    </BorderLayout>));
