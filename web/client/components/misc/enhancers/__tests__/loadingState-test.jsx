const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const loadingState = require('../loadingState');

const enhanceDefault = loadingState();
const enhanceCustom = loadingState(({prop}) => prop);
const CMP = enhanceDefault(({children = []}) => <div id="CMP">{children}</div>);
const Custom = enhanceCustom(({prop}) => <div id="Custom">{prop}</div>);
describe('loadingState enhancher', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('loadingState rendering with default', () => {
        ReactDOM.render(<CMP />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#CMP');
        expect(el).toExist();
    });
    it('loadingState rendering with loading state', () => {
        ReactDOM.render(<CMP loading/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const loading = container.querySelector('.mapstore-full-size-loader');
        expect(loading).toExist();
        const content = container.querySelector('#CONTENT');
        expect(content).toNotExist();
    });
    it('loadingState rendering with custom loading function', () => {
        ReactDOM.render(<Custom prop/>, document.getElementById("container"));
        let container = document.getElementById('container');
        let loading = container.querySelector('.mapstore-full-size-loader');
        expect(loading).toExist();
        let content = container.querySelector('#Custom');
        expect(content).toNotExist();
        ReactDOM.render(<Custom />, document.getElementById("container"));
        container = document.getElementById('container');
        loading = container.querySelector('.mapstore-full-size-loader');
        expect(loading).toNotExist();
        content = container.querySelector('#Custom');
        expect(content).toExist();
    });
});
