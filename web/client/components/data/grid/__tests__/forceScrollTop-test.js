const React = require('react');
const ReactDOM = require('react-dom');
const { createSink, setObservableConfig} = require('recompose');
const expect = require('expect');

const rxjsConfig = require('recompose/rxjsObservableConfig').default;
setObservableConfig(rxjsConfig);

const forceScrollTop = require('../forceScrollTop');
describe('DataGrid forceScrollTop enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('with defaults', (done) => {
        const Sink = forceScrollTop(createSink(({ scrollToTop}) => {
            expect(scrollToTop).toNotExist();
            done();
        }));
        ReactDOM.render(<Sink />, document.getElementById("container"));
    });
    it('with virtualScroll', (done) => {
        const Sink = forceScrollTop(createSink(({ scrollToTopCounter, scrollToTop = () => { } }) => {
            if (!scrollToTopCounter) {
                scrollToTop();
            } else {
                expect(scrollToTopCounter).toBe(1);
                done();
            }

        }));
        ReactDOM.render(<Sink virtualScroll />, document.getElementById("container"));
    });
    it('onGridSort triggers scrollToTop', (done) => {
        const Sink = forceScrollTop(createSink(({ scrollToTopCounter, onGridSort = () => { } }) => {
            if (!scrollToTopCounter) {
                onGridSort();
            } else {
                expect(scrollToTopCounter).toBe(1);
                done();
            }

        }));
        ReactDOM.render(<Sink virtualScroll />, document.getElementById("container"));
    });
    it('onAddFilter triggers scrollToTop', (done) => {
        const Sink = forceScrollTop(createSink(({ scrollToTopCounter, onAddFilter = () => { } }) => {
            if (!scrollToTopCounter) {
                onAddFilter();
            } else {
                expect(scrollToTopCounter).toBe(1);
                done();
            }

        }));
        ReactDOM.render(<Sink virtualScroll />, document.getElementById("container"));
    });

});
