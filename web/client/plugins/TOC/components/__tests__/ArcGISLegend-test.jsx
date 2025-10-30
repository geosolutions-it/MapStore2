import React from 'react';
import ReactDOM from 'react-dom';
import ArcGISLegend from '../ArcGISLegend';
import mockAxios from 'axios-mock-adapter';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import expect from 'expect';

const axiosMock = new mockAxios(axios);

describe('ArcGISLegend', () => {

    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.setAttribute('id', 'container');
        document.body.appendChild(container);
    });

    afterEach(() => {
        ReactDOM.unmountComponentAtNode(container);
        document.body.innerHTML = '';
    });

    it('should display a loader during loading', async () => {
        const node = { url: 'https://fake.server.com/arcgis/rest/services/test/MapServer' };

        axiosMock.onGet(/legend/).reply(() => {
            return new Promise(() => {});
        });

        await act(async () => {
            ReactDOM.render(<ArcGISLegend node={node} />, document.getElementById("container"));
        });

        expect(document.getElementById("container").querySelector('.mapstore-loader')).toExist();
    });

    it('renders legend items when API responds', async function() {
        this.timeout(5000); // Timeout plus long pour être sûr

        const node = { url: 'https://fake.server.com/arcgis/rest/services/test/MapServer' };

        // Données fictives pour la légende
        const mockData = {
            layers: [
                {
                    layerId: 0,
                    layerName: "Layer 0",
                    legend: [
                        {
                            id: 1,
                            label: "Point",
                            imageData: "fakebase64",
                            contentType: "image/png",
                            width: 12,
                            height: 12
                        }
                    ]
                }
            ]
        };

        // Réponse mockée
        axiosMock.onGet(/legend/).reply(200, mockData);

        // Render du composant
        await act(async () => {
            ReactDOM.render(<ArcGISLegend node={node} />, container);
        });

        // Petit délai pour que useEffect et setState se terminent
        await new Promise(resolve => setTimeout(resolve, 0));

        // Vérification basique
        const legendItems = container.querySelectorAll('.ms-legend-rule');
        expect(legendItems.length).toBe(1);
        expect(legendItems[0].textContent).toContain("Point");
    });
});
