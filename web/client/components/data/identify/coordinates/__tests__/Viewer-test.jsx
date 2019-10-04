const React = require('react');
const ReactDOM = require('react-dom');
const expect = require('expect');
const Viewer = require('../Viewer');
describe('Identify Coordinate Viewer Component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Viewer rendering with defaults', () => {
        ReactDOM.render(<Viewer />, document.getElementById("container"));
        const el = document.querySelector('.col-xs-12');
        expect(el).toExist();
    });
    it('Viewer rendering with className', () => {
        ReactDOM.render(<Viewer className="TEST"/>, document.getElementById("container"));
        const el = document.querySelector('.TEST');
        expect(el).toExist();
    });

    it('decimal coordinates', () => {
        ReactDOM.render(
            <Viewer
                coordinate={{ lat: 40, lon: 10 }}
            />,
            document.getElementById("container")
        );

        expect(document.querySelector('.ms-coordinates-decimal span').innerHTML).toBe("40");
        expect(document.querySelector('.ms-coordinates-decimal span:nth-child(2)').innerHTML).toBe("10");
    });
    it('aeronautical coordinates', () => {
        ReactDOM.render(
            <Viewer
                formatCoord="aeronautical"
                coordinate={{ lat: 40, lon: 10 }}
            />,
            document.getElementById("container")
        );

        const elements = document.querySelectorAll('.ms-coordinates-aeronautical > span');
        expect(elements.length).toBe(3);
        const coords = document.querySelectorAll('.coordinate-dms');
        expect(coords.length).toBe(2);
        expect(coords[0].querySelector('span span').innerHTML).toBe("40");
        expect(coords[0].querySelector('span span:nth-child(3)').innerHTML).toBe("0");
        expect(coords[0].querySelector('span span:nth-child(5)').innerHTML).toBe("0");
        expect(coords[0].querySelector('span span:nth-child(7)').innerHTML).toBe("N");
        expect(coords[1].querySelector('span span').innerHTML).toBe("10");
        expect(coords[1].querySelector('span span:nth-child(3)').innerHTML).toBe("0");
        expect(coords[1].querySelector('span span:nth-child(5)').innerHTML).toBe("0");
        expect(coords[1].querySelector('span span:nth-child(7)').innerHTML).toBe("E");
    });
});
