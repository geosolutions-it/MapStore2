import expect from 'expect';
import { find } from 'lodash';
import { generateInteractionMetadataTree } from '../InteractionUtils';
import widgets1 from '../../test-resources/widgets/widgets1.json';

const TEST_DATA = {
    MAP_STATE_1: {
        center: {
            x: -8237494.408387185,
            y: 4970351.706798052
        },
        zoom: 5,
        projection: "EPSG:3857"
    },
    LAYERS_1: [{
        type: 'wms',
        visibility: true,
        name: "topp:states",
        id: 'mapstore:states__7'
    },
    {
        type: 'wms',
        visibility: true,
        name: "mapstore:Types",
        id: 'mapstore:Types__6'
    },
    {
        type: 'wms',
        visibility: true,
        id: 'mapstore:Meteorite_Landings_from_NASA_Open_Data_Portal__5'
    }],
    WIDGETS_1: [widgets1.widgets]
};
describe('InteractionUtils', () => {
    describe('generateInteractionMetadataTree', () => {
        it('generates interaction metadata tree for map and widgets', () => {

            const plugins = ['Map', 'Widgets'];
            const tree = generateInteractionMetadataTree(plugins, TEST_DATA.WIDGETS_1, TEST_DATA.MAP_STATE_1, TEST_DATA.LAYERS_1);

            expect(tree.children.length).toBe(2);
            const mapNode = find(tree.children, {name: 'map'});

            // has map node
            expect(mapNode).toExist();
            expect(mapNode.type).toBe('element');

            // has layers collection
            const layersCollection = find(mapNode.children, {name: 'layers'});
            expect(layersCollection.type).toBe('collection');
            expect(layersCollection.children.length).toBe(3); // 3 layers

            // layers have correct metadata
            const layerNode = find(layersCollection.children, {name: 'topp:states'});
            expect(layerNode).toExist();
            expect(layerNode.interactionMetadata).toExist();
            expect(layerNode.interactionMetadata.targets.length).toBe(1);
            expect(layerNode.interactionMetadata.events[0].dataType).toBe('FEATURE_INFO');
        });
    });
});
