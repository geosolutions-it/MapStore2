/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');

const Rx = require('rxjs');
const BorderLayout = require('../../components/layout/BorderLayout');
const {selectedCatalogSelector} = require('../../selectors/catalog');
const Toolbar = require('../../components/widgets/builder/wizard/common/layerselector/Toolbar');
const BuilderHeader = require('./BuilderHeader');
const InfoPopover = require('../../components/widgets/widget/InfoPopover');
const {Message, HTML} = require('../../components/I18N/I18N');
const {recordToLayer} = require('../../utils/CatalogUtils');
const canGenerateCharts = require('../../observables/wigets/canGenerateCharts');
const {compose, withState, mapPropsStream, branch} = require('recompose');
const {onEditorChange} = require('../../actions/widgets');
const {addSearch} = require('../../observables/wms');

const Catalog = compose(
    branch(
       ({catalog} = {}) => !catalog,
       connect(createSelector(selectedCatalogSelector, catalog => ({catalog})))
    ),
)(require('./Catalog'));
/**
 * Builder page that allows layer's selection
 */
module.exports = compose(
     connect( () => {}, {
         onLayerChoice: (l) => onEditorChange("layer", l)
     }),
     withState('selected', "setSelected", null),
     withState('layer', "setLayer", null),
     mapPropsStream(props$ =>
         props$.distinctUntilKeyChanged('selected').filter(({selected} = {}) => selected)
         .switchMap(
             ({selected, setLayer = () => {}} = {}) =>
                canGenerateCharts(recordToLayer(selected))
                    .switchMap(() => addSearch(recordToLayer(selected)))
                    .do(l => setLayer(l))
                    .mapTo({canProceed: true})
                    .catch((error) => Rx.Observable.of({error, canProceed: false}))
        ).startWith({})
        .combineLatest(props$, ({canProceed} = {}, props) => ({
            canProceed,
            ...props
        })
        )
    )
)(({onClose = () => {}, setSelected = () => {}, onLayerChoice = () => {}, selected, canProceed, layer, catalog} = {}) =>
    (<BorderLayout
        className="bg-body layer-selector"
        header={<BuilderHeader onClose={onClose}>
        <Toolbar canProceed={canProceed} onProceed={() => onLayerChoice(layer)} />
        { selected && !canProceed ? <InfoPopover
            glyph="exclamation-mark"
            bsStyle="warning"
            title={<Message msgId="widgets.builder.errors.noWidgetsAvailableTitle" />}
            text={<HTML msgId="widgets.builder.errors.noWidgetsAvailableDescription"/>} /> : null}
    </BuilderHeader>}
        >
        <Catalog selected={selected} catalog={catalog} onRecordSelected={r => setSelected(r)} />
    </BorderLayout>));
