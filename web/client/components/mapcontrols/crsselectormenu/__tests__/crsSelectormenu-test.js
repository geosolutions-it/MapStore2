const React = require('react');
const ReactDOM = require('react-dom');
const { ListGroupItem } = require('react-bootstrap');
const expect = require('expect');
const CrsSelectorMenu = require('../CrsSelectorMenu');
describe('CrsSelectorMenu component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('CrsSelectorMenu rendering with defaults', () => {
        ReactDOM.render(<CrsSelectorMenu selected={'EPSG:4326'} >
            [<ListGroupItem
                key={'EPSG:4326'} eventKey={'EPSG:4326'} selected={'EPSG:4326'}>
                EPSG:4326
            </ListGroupItem>,
            <ListGroupItem
                key={'EPSG:4266'} eventKey={'EPSG:4266'} selected={'EPSG:4266'}>
                EPSG:4266
            </ListGroupItem>]</CrsSelectorMenu>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.dropdown-menu');
        expect(el).toExist();
        const selected = container.querySelector('.dropdown-menu span div:nth-child(2)').textContent;
        expect(selected).toExist();
        expect(selected).toBe('EPSG:4326');
    });
});
