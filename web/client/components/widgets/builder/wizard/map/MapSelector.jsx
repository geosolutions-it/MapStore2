/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');


require('rxjs');
const GeoStoreDAO = require('../../../../../api/GeoStoreDAO');

const BorderLayout = require('../../../../layout/BorderLayout');

const Toolbar = require('../../../../misc/toolbar/Toolbar');
const BuilderHeader = require('../../BuilderHeader');

const { compose, withState, mapPropsStream, withHandlers } = require('recompose');
const mcEnhancer = require('../../../../maps/enhancers/mapCatalog');
const MapCatalog = mcEnhancer(require('../../../../maps/MapCatalog'));
/**
 * Builder page that allows layer's selection
 */
module.exports = compose(
    withState('selected', "setSelected", null),
    withHandlers({
        onMapChoice: ({ onMapSelected = () => { } } = {}) => map => GeoStoreDAO.getData(map.id)
            .then(res => onMapSelected({
                map: res.map,
                layers: res.layers
            }))
    }),
    mapPropsStream(props$ =>
        props$.distinctUntilKeyChanged('selected').filter(({ selected } = {}) => selected).startWith({})

            .combineLatest(props$, ({ canProceed } = {}, props) => ({
                canProceed,
                ...props
            })
            )
    )
)(({ onClose = () => { }, setSelected = () => { }, onMapChoice = () => { }, selected } = {}) =>
    (<BorderLayout
        className="bg-body layer-selector"
        header={<BuilderHeader onClose={onClose}>
            <Toolbar
                btnDefaultProps={{
                    bsStyle: "primary",
                    bsSize: "sm"
                }}
                buttons={[{
                onClick: () => onMapChoice(selected),
                visible: true,
                disabled: !selected,
                glyph: "arrow-right"
            }]} />
        </BuilderHeader>}
    >
        <MapCatalog selected={selected} onSelected={r => setSelected(r)} />
    </BorderLayout>));
