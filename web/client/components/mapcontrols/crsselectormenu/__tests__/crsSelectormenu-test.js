const React = require('react');
const ReactDOM = require('react-dom');
const { ListGroupItem } = require('react-bootstrap');
const expect = require('expect');
const CustomMenu = require('../crsSelectormenu');
describe('crsSelectormenu component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('crsSelectormenu rendering with defaults', () => {
        ReactDOM.render(<CustomMenu>
            [<ListGroupItem
            key={'EPSG:4326'} eventKey={'EPSG:4326'}>
                EPSG:4326
            </ListGroupItem>]</CustomMenu>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('.dropdown-menu');
        expect(el).toExist();
        const selected = container.querySelector('.dropdown-menu span div:nth-child(2)').textContent;
        expect(selected).toExist();
        expect(selected).toBe('EPSG:4326');
    });
});
