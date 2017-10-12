const React = require('react');
const ReactDOM = require('react-dom');

const expect = require('expect');
const emptyState = require('../emptyState');

const enhanceChildren = emptyState(
    ({children = []} = {}) => children.length === 0,
    {
        content: <div id="EMPTY_CONTENT">EMPTY</div>
    }
);
const enhanceProp = emptyState(
    ({prop}) => !prop,
    {
        content: <div id="EMPTY_CONTENT">EMPTY</div>
    }
);
const CMP = enhanceChildren(({children = []}) => <div>{children}</div>);
const PropCMP = enhanceProp(({prop}) => <div id="PropCMP">{prop}</div>);
describe('emptyState enhancher', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('emptyState rendering with empty content', () => {
        ReactDOM.render(<CMP />, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#EMPTY_CONTENT');
        expect(el).toExist();
    });
    it('emptyState rendering with content (children)', () => {
        ReactDOM.render(<CMP><div content="CONTENT">CONTENT</div></CMP>, document.getElementById("container"));
        const container = document.getElementById('container');
        const el = container.querySelector('#EMPTY_CONTENT');
        expect(el).toNotExist();
        const content = container.querySelector('#CONTENT');
        expect(content).toNotExist();
    });
    it('emptyState rendering with content (prop)', () => {
        ReactDOM.render(<PropCMP />, document.getElementById("container"));
        const container = document.getElementById('container');
        let empty = container.querySelector('#EMPTY_CONTENT');
        expect(empty).toExist();
        let content = container.querySelector('#CONTENT');
        expect(content).toNotExist();
        ReactDOM.render(<PropCMP prop={"CONTENT"}><div content="CONTENT"></div></PropCMP>, document.getElementById("container"));
        empty = container.querySelector('#EMPTY_CONTENT');
        expect(empty).toNotExist();
        content = container.querySelector('#PropCMP');
        expect(content).toExist();
    });
});
