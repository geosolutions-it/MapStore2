import React from 'react';
import expect from 'expect';
import ReactDOM from 'react-dom';
import EmptyStreetView from '../EmptyStreetView';

describe('EmptyStreetView', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    const getMainDiv = () => {
        return document.getElementsByClassName('empty-street-view')[0];
    };
    it('Test for default props', () => {
        ReactDOM.render(<EmptyStreetView/>, document.getElementById("container"));
        const mainDiv = getMainDiv();
        expect(mainDiv).toExist();
    });
    it('Test for loading', () => {
        ReactDOM.render(<EmptyStreetView loading/>, document.getElementById("container"));
        const mainDiv = getMainDiv();
        expect(mainDiv).toExist();
        expect(mainDiv.getElementsByClassName('spinner')).toExist();
    });
    it('Test for title', () => {
        ReactDOM.render(<EmptyStreetView title="title"/>, document.getElementById("container"));
        const mainDiv = getMainDiv();
        expect(mainDiv).toExist();
        expect(mainDiv.getElementsByTagName('h1')).toExist();
        expect(mainDiv.getElementsByTagName('h1')[0].innerHTML).toBe('title');
    });
    it('Test for description', () => {
        ReactDOM.render(<EmptyStreetView description="description"/>, document.getElementById("container"));
        const mainDiv = getMainDiv();
        expect(mainDiv).toExist();
        expect(mainDiv.getElementsByClassName('empty-state-description')).toExist();
        expect(mainDiv.getElementsByClassName('empty-state-description')[0].innerHTML).toBe('description');
    });


});
