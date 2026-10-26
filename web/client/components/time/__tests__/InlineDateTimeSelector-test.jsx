import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import expect from 'expect';
import moment from 'moment';
import InlineDateTimeSelector from '../InlineDateTimeSelector';
describe('InlineDateTimeSelector component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('InlineDateTimeSelector rendering with defaults', () => {
        ReactDOM.render(<InlineDateTimeSelector />, document.getElementById("container"));
        const container = document.getElementById('container');
        const inputs = container.querySelectorAll('input');
        expect(inputs).toExist();
        expect(inputs[0]).toExist();
        expect(inputs[1].readOnly).toBe(true); // month should not be editable
    });
    it('Test InlineDateTimeSelector onIconClick (disabled by default)', () => {
        const actions = {
            onIconClick: () => {}
        };
        const spyonIconClick = expect.spyOn(actions, 'onIconClick');
        ReactDOM.render(<InlineDateTimeSelector onIconClick={actions.onIconClick} />, document.getElementById("container"));
        const el = document.querySelector('.ms-inline-datetime-icon');
        TestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonIconClick).toNotHaveBeenCalled();
    });
    it('Test InlineDateTimeSelector onIconClick when clickable flag is on', () => {
        const actions = {
            onIconClick: () => { }
        };
        const spyonIconClick = expect.spyOn(actions, 'onIconClick');
        ReactDOM.render(<InlineDateTimeSelector clickable onIconClick={actions.onIconClick} />, document.getElementById("container"));
        const el = document.querySelector('.ms-inline-datetime-icon');
        TestUtils.Simulate.click(el); // <-- trigger event callback
        expect(spyonIconClick).toHaveBeenCalled();
    });
    it('Test InlineDateTimeSelector edit days', () => {
        const actions = {
            onUpdate: () => { }
        };
        const spyonUpdate = expect.spyOn(actions, 'onUpdate');
        ReactDOM.render(<InlineDateTimeSelector date="2018-12-21T15:00:00.000Z" onUpdate={actions.onUpdate} />, document.getElementById("container"));
        const input = document.querySelectorAll('input');
        TestUtils.Simulate.change(input[0], { target: { value: '2' } });
        expect(spyonUpdate).toNotHaveBeenCalled();
        TestUtils.Simulate.blur(input[0]);
        expect(spyonUpdate).toHaveBeenCalled();
        expect(spyonUpdate.calls[0].arguments[0]).toBe("2018-12-02T15:00:00.000Z");
    });
    it('Test InlineDateTimeSelector edit year too big ', () => {
        // avoid to update when time exceeds min/max time (+/-864e13 milliseconds -- from Apr 20 -271821 to 13 Sep 275760)
        const actions = {
            onUpdate: () => { }
        };
        const spyonUpdate = expect.spyOn(actions, 'onUpdate');
        ReactDOM.render(<InlineDateTimeSelector date="2018-12-21T15:00:00.000Z" onUpdate={actions.onUpdate} />, document.getElementById("container"));
        const input = document.querySelectorAll('input');
        TestUtils.Simulate.change(input[2], { target: { value: '275761' } });
        TestUtils.Simulate.blur(input[2]);
        TestUtils.Simulate.change(input[2], { target: { value: '-271822' } });
        TestUtils.Simulate.blur(input[2]);
        expect(spyonUpdate).toNotHaveBeenCalled();
        TestUtils.Simulate.change(input[2], { target: { value: '275759' } });
        TestUtils.Simulate.blur(input[2]);
        TestUtils.Simulate.change(input[2], { target: { value: '-271820' } });
        TestUtils.Simulate.blur(input[2]);
        expect(spyonUpdate).toHaveBeenCalled();
        expect(spyonUpdate.calls.length).toBe(2);
    });
    it('keeps empty and out-of-range text editable before committing a valid end date', () => {
        const onUpdate = expect.createSpy();
        ReactDOM.render(<InlineDateTimeSelector
            date="1981-03-06T01:36:05.000Z"
            isValidDate={date => moment(date).isAfter('1583-01-01T00:00:00.000Z')}
            onUpdate={onUpdate}/>, document.getElementById('container'));
        const year = document.querySelector('.ms-dt-year input');
        TestUtils.Simulate.change(year, { target: { value: '198' } });
        expect(year.value).toBe('198');
        TestUtils.Simulate.blur(year);
        expect(year.value).toBe('198');
        expect(year.getAttribute('aria-invalid')).toBe('true');
        expect(document.querySelector('.has-error')).toExist();
        expect(onUpdate).toNotHaveBeenCalled();
        TestUtils.Simulate.change(year, { target: { value: '' } });
        TestUtils.Simulate.blur(year);
        expect(year.value).toBe('');
        expect(onUpdate).toNotHaveBeenCalled();
        ['1', '19', '198', '1980'].forEach(value => {
            TestUtils.Simulate.change(year, { target: { value } });
            expect(year.value).toBe(value);
        });
        expect(onUpdate).toNotHaveBeenCalled();
        TestUtils.Simulate.blur(year);
        expect(onUpdate.calls.length).toBe(1);
        expect(onUpdate.calls[0].arguments[0]).toBe('1980-03-06T01:36:05.000Z');
        expect(document.querySelector('.has-error')).toNotExist();
    });
    it('commits on Enter without submitting the form or committing again on blur', () => {
        const onUpdate = expect.createSpy();
        const preventDefault = expect.createSpy();
        ReactDOM.render(<InlineDateTimeSelector date="2018-12-21T15:00:00.123Z" onUpdate={onUpdate}/>, document.getElementById('container'));
        const seconds = document.querySelector('.ms-dt-seconds input');
        TestUtils.Simulate.change(seconds, { target: { value: '25' } });
        TestUtils.Simulate.keyDown(seconds, { key: 'Enter', preventDefault });
        TestUtils.Simulate.blur(seconds);
        expect(preventDefault).toHaveBeenCalled();
        expect(onUpdate.calls.length).toBe(1);
        expect(onUpdate.calls[0].arguments[0]).toBe('2018-12-21T15:00:25.123Z');
    });
    it('restores the committed date on Escape', () => {
        const onUpdate = expect.createSpy();
        ReactDOM.render(<InlineDateTimeSelector date="2018-12-21T15:00:00.000Z" onUpdate={onUpdate}/>, document.getElementById('container'));
        const day = document.querySelector('.ms-dt-day input');
        TestUtils.Simulate.change(day, { target: { value: '' } });
        TestUtils.Simulate.blur(day);
        expect(document.querySelector('.has-error')).toExist();
        TestUtils.Simulate.keyDown(day, { key: 'Escape' });
        expect(day.value).toBe('21');
        expect(document.querySelector('.has-error')).toNotExist();
        expect(onUpdate).toNotHaveBeenCalled();
    });
    it('rejects impossible dates and nonnumeric input while allowing correction', () => {
        const onUpdate = expect.createSpy();
        ReactDOM.render(<InlineDateTimeSelector date="2020-02-21T15:00:00.000Z" onUpdate={onUpdate}/>, document.getElementById('container'));
        const day = document.querySelector('.ms-dt-day input');
        ['31', 'abc'].forEach(value => {
            TestUtils.Simulate.change(day, { target: { value } });
            TestUtils.Simulate.blur(day);
            expect(day.value).toBe(value);
            expect(day.getAttribute('aria-invalid')).toBe('true');
            expect(onUpdate).toNotHaveBeenCalled();
        });
        TestUtils.Simulate.change(day, { target: { value: '29' } });
        TestUtils.Simulate.blur(day);
        expect(onUpdate.calls[0].arguments[0]).toBe('2020-02-29T15:00:00.000Z');
    });
    it('combines drafts across fields to correct a leap day', () => {
        const onUpdate = expect.createSpy();
        ReactDOM.render(<InlineDateTimeSelector date="2020-02-29T15:00:00.000Z" onUpdate={onUpdate}/>, document.getElementById('container'));
        const year = document.querySelector('.ms-dt-year input');
        const day = document.querySelector('.ms-dt-day input');
        TestUtils.Simulate.change(year, { target: { value: '2021' } });
        TestUtils.Simulate.blur(year);
        expect(onUpdate).toNotHaveBeenCalled();
        TestUtils.Simulate.change(day, { target: { value: '28' } });
        TestUtils.Simulate.blur(day);
        expect(onUpdate.calls[0].arguments[0]).toBe('2021-02-28T15:00:00.000Z');
    });
    it('synchronizes draft values and validation when the external date changes', () => {
        const container = document.getElementById('container');
        ReactDOM.render(<InlineDateTimeSelector date="1981-03-06T01:36:05.000Z"/>, container);
        const year = document.querySelector('.ms-dt-year input');
        TestUtils.Simulate.change(year, { target: { value: '' } });
        TestUtils.Simulate.blur(year);
        ReactDOM.render(<InlineDateTimeSelector date="1986-03-06T01:36:05.000Z"/>, container);
        expect(year.value).toBe('1986');
        expect(document.querySelector('.has-error')).toNotExist();
    });
    it('keeps increment buttons responsive and respects the date validator', () => {
        const onUpdate = expect.createSpy();
        ReactDOM.render(<InlineDateTimeSelector
            date="1981-03-06T01:36:05.000Z"
            isValidDate={date => moment(date).isAfter('1980-03-06T01:36:05.000Z')}
            onUpdate={onUpdate}
            showButtons/>, document.getElementById('container'));
        const buttons = document.querySelectorAll('.ms-dt-year button');
        TestUtils.Simulate.click(buttons[1]);
        expect(onUpdate).toNotHaveBeenCalled();
        TestUtils.Simulate.click(buttons[0]);
        expect(onUpdate.calls[0].arguments[0]).toBe('1982-03-06T01:36:05.000Z');
    });
});
