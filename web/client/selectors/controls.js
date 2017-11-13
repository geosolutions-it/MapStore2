const {get} = require('lodash');

module.exports = {
    queryPanelSelector: (state) => get(state, "controls.queryPanel.enabled"),
    wfsDownloadAvailable: state => !!get(state, "controls.wfsdownload.available"),
    cssStateSelector: state => {
        const browser = get(state, "browser.mobile") && ' mobile' || ' desktop';

        const drawer = get(state, "controls.drawer.enabled") && ' mapstore-drawer-open' || '';

        const featuregrid = get(state, "featuregrid.open") && ' mapstore-featuregrid-open' || '';
        const queryPanel = get(state, "controls.queryPanel.enabled") && ' mapstore-queryPanel-open' || '';

        const annotation = get(state, "controls.annotations.enabled") && ' mapstore-annotation-open' || '';
        const metadataexplorer = get(state, "controls.metadataexplorer.enabled") && ' mapstore-metadataexplorer-open' || '';
        const identify = get(state, "mapInfo.requests") && state.mapInfo.requests.length > 0 && ' mapstore-identify-open' || '';

        const rightPanel = metadataexplorer || annotation || identify ? ' mapstore-right-panel-open' : '';

        return browser + drawer + featuregrid + queryPanel + rightPanel;
    }
};
