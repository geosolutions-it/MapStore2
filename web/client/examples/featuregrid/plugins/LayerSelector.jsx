const React = require('react');
const {connect} = require('react-redux');
const {Panel, Nav, NavItem} = require('react-bootstrap');

const {layersSelector} = require('../../../selectors/layers');
const {selectedLayerIdSelector} = require('../../../selectors/featuregrid');
const LayerSelector = ({layers = [], selectedLayerId, onLayerSelect = () => {}} = {}) =>
    (<Panel key="layer-selctor" style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        width: "250px",
        height: "300px"
    }} header="Select a layer">
        <h4>Atlantis</h4>
        <Nav bsStyle="pills" activeKey={selectedLayerId} stacked onSelect={onLayerSelect}>
            {layers.map(l => <NavItem eventKey={l.id} >{l.title}</NavItem>)}
        </Nav>
    </Panel>);

const LayerSelectorPlugin = connect((state) => ({
    layers: layersSelector(state).filter(l => l.group === "Vector"),
    selectedLayerId: selectedLayerIdSelector(state)
}), {
    onLayerSelect: (selectedKey) => ({type: "FEATUREGRID_SAMPLE::SELECT_LAYER", id: selectedKey })
})(LayerSelector);


module.exports = {
    LayerSelectorPlugin
};
