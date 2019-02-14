const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const no90Lat = require('../no90Lat');

describe('no90Lat enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('no90Lat rendering with defaults', (done) => {
        const onChange = (v) => {
            expect(parseFloat(v)).toBeLessThan(90);
        };
        const Sink = no90Lat(createSink( props => {
            expect(props).toExist();
            props.onChange("90");
            done();
        }));
        ReactDOM.render(<Sink coordinate="lat" onChange={onChange} />, document.getElementById("container"));
    });
    it('no90Lat rendering with negative value', (done) => {
        const onChange = (v) => {
            expect(parseFloat(v)).toBeMoreThan(-90);
        };
        const Sink = no90Lat(createSink(props => {
            expect(props).toExist();
            props.onChange("-90");
            done();
        }));
        ReactDOM.render(<Sink coordinate="lat" onChange={onChange} />, document.getElementById("container"));
    });
    it('no90Lat rendering with lon', (done) => {
        const onChange = (v) => {
            expect(parseFloat(v)).toBe(90);
        };
        const Sink = no90Lat(createSink(props => {
            expect(props).toExist();
            props.onChange("90");
            done();
        }));
        ReactDOM.render(<Sink coordinate="lon" onChange={onChange} />, document.getElementById("container"));
    });
});
