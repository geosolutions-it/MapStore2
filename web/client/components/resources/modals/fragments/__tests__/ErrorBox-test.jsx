import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import ErrorBox from '../ErrorBox';

describe("ErrorBox component", () => {
    const getContainerDiv = () => document.getElementById("container");
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(getContainerDiv());
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('creates component with defaults', () => {
        ReactDOM.render(<ErrorBox />, getContainerDiv());
        expect(document.querySelector(".dropzone-errorBox")).toNotExist();

    });

    it('test 403 Error', () => {
        const errors = [{
            status: 403,
            statusText: "Forbidden"
        }];
        ReactDOM.render(<ErrorBox errors={errors}/>, getContainerDiv());

        const ErrorSpan = document.querySelector(".errorForbidden");
        expect(ErrorSpan).toExist();
        expect(ErrorSpan.innerHTML).toContain("<span>dashboard.errors.forbidden</span>");
    });
    it('test 405 Error', () => {
        const errors = [{
            status: 405,
            statusText: "Forbidden"
        }];
        ReactDOM.render(<ErrorBox errors={errors}/>, getContainerDiv());
        const ErrorSpan = document.querySelector(`.error${errors[0].statusText}`);
        expect(ErrorSpan).toExist();
        expect(ErrorSpan.innerHTML).toBe("<span>dashboard.errors.forbidden405</span>");
    });
    it('test 409 Error', () => {
        const errors = [{
            status: 409,
            statusText: "Forbidden"
        }];
        ReactDOM.render(<ErrorBox errors={errors}/>, getContainerDiv());
        const ErrorSpan = document.querySelector(`.error${errors[0].statusText}`);
        expect(ErrorSpan).toExist();
        expect(ErrorSpan.innerHTML).toBe("<span>dashboard.errors.resourceAlreadyExists</span>");
    });
    it('test FORMAT Error', () => {
        const errors = [{
            status: "FORMAT",
            statusText: "error"
        }];
        ReactDOM.render(<ErrorBox errors={errors}/>, getContainerDiv());
        const ErrorSpan = document.querySelector(`.error${errors[0].statusText}`);
        expect(ErrorSpan).toExist();
        expect(ErrorSpan.innerHTML).toBe(`<span>map.errorFormat</span>`);
    });
    it('test SIZE Error', () => {
        const errors = [{
            status: "SIZE",
            statusText: "error"
        }];
        ReactDOM.render(<ErrorBox errors={errors}/>, getContainerDiv());
        const ErrorSpan = document.querySelector(`.error${errors[0].statusText}`);
        expect(ErrorSpan).toExist();
        expect(ErrorSpan.innerHTML).toBe(`<span>map.errorSize</span>`);
    });
    it('test 404 Error, not handled', () => {
        const errors = [{
            status: 404,
            statusText: "ForbiddenMethod"
        }];
        // this will not track the lack for statusText that could be missing in locale.messages
        ReactDOM.render(<ErrorBox errors={errors}/>, getContainerDiv());
        const ErrorSpan = document.querySelector(`.error${errors[0].statusText}`);
        expect(ErrorSpan).toExist();
        expect(ErrorSpan.innerHTML).toBe(`<span>${errors[0].statusText}</span>`);
    });

});
