/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import ReactDOM, {unmountComponentAtNode} from "react-dom";
import expect from "expect";
import { act } from "react-dom/test-utils";

import {
    getFormatter,
    registerFormatter,
    unregisterFormatter
} from "../index";
let container = null;

describe("Tests for the formatter functions", () => {
    beforeEach(() => {
        // setup a DOM element as a render target
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        // cleanup on exiting
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });
    it("test getFormatter for booleans", () => {
        const formatter = getFormatter({ localType: "boolean" });
        act(() => {
            ReactDOM.render(formatter({ value: true }), container);
        });
        expect(container.textContent).toBe("true");

        act(() => {
            ReactDOM.render(formatter({ value: false }), container);
        });
        expect(container.textContent).toBe("false");
    });
    it("test getFormatter for strings", () => {
        const value = "Test https://google.com with google link";
        const Formatter = getFormatter({ localType: "string" });
        act(() => {
            ReactDOM.render(<Formatter value={value} />, container);
        });
        expect(container.textContent).toBe(value);
    });
    it("test getFormatter for number", () => {
        const Formatter = getFormatter({ localType: "number" });
        act(() => {
            ReactDOM.render(<Formatter />, container);
        });
        expect(container.textContent).toBe("");
        act(() => {
            ReactDOM.render(<Formatter  value={44.3333434353535} />, container);
        });
        expect(container.textContent).toBe("44.3333434353535");
        act(() => {
            ReactDOM.render(<Formatter  value={null} />, container);
        });
        expect(container.textContent).toBe("");
        act(() => {
            ReactDOM.render(<Formatter  value={undefined} />, container);
        });
        expect(container.textContent).toBe("");
        act(() => {
            ReactDOM.render(<Formatter  value={0} />, container);
        });
        expect(container.textContent).toBe("0");
    });
    it("test getFormatter for int", () => {
        const Formatter = getFormatter({ localType: "int" });
        act(() => {
            ReactDOM.render(<Formatter />, container);
        });
        expect(container.textContent).toBe("");
        act(() => {
            ReactDOM.render(<Formatter value={2455567} />, container);
        });
        expect(container.textContent).toBe("2455567");
        act(() => {
            ReactDOM.render(<Formatter value={null} />, container);
        });
        expect(container.textContent).toBe("");
        act(() => {
            ReactDOM.render(<Formatter value={undefined} />, container);
        });
        expect(container.textContent).toBe("");
        act(() => {
            ReactDOM.render(<Formatter value={0} />, container);
        });
        expect(container.textContent).toBe("0");
    });

    it("test getFormatter for geometry", () => {
        const Formatter = getFormatter({ localType: "Geometry" });
        act(() => {
            ReactDOM.render(<Formatter />, container);
        });
        expect(container.textContent).toBe("");
        act(() => {
            ReactDOM.render(<Formatter value={{
                properties: {},
                geometry: { type: "Point", coordinates: [1, 2] }
            }} />, container);
        });
        expect(container.textContent).toBe("");
        act(() => {
            ReactDOM.render(<Formatter value={null} />, container);
        });
        expect(container.textContent).toBe("");
        act(() => {
            ReactDOM.render(<Formatter value={undefined} />, container);
        });
        expect(container.textContent).toBe("");
    });

    describe("test featureGridFormatter", () => {
        beforeEach((done) => {
            document.body.innerHTML = '<div id="container"></div>';
            setTimeout(done);
        });

        afterEach((done) => {
            ReactDOM.unmountComponentAtNode(
                document.getElementById("container")
            );
            document.body.innerHTML = "";
            setTimeout(done);
        });
        it("base", () => {
            try {
                registerFormatter("test", ({ config, value }) => {
                    expect(config).toExist();
                    expect(value).toBe("test");
                    return <div>test</div>;
                });
                const Formatter = getFormatter(
                    { localType: "test" },
                    { featureGridFormatter: { name: "test" } }
                );
                ReactDOM.render(
                    <Formatter value="test" />,
                    document.getElementById("container")
                );
                expect(document.getElementById("container").innerHTML).toBe(
                    "<div>test</div>"
                );
            } finally {
                unregisterFormatter("test");
            }
        });
        it("with directRender option", () => {
            try {
                const TEST_FUNC = () => <div>test</div>;
                registerFormatter("test", TEST_FUNC);
                const formatter = getFormatter(
                    { localType: "test" },
                    {
                        featureGridFormatter: {
                            name: "test",
                            directRender: true
                        }
                    }
                );
                expect(formatter).toBe(TEST_FUNC);
            } finally {
                unregisterFormatter("test");
            }
        });
    });
    it("test getFormatter for date / date-time / time", () => {
        const dateFormats = {
            date: "YYYY",
            "date-time": "YYYY DD",
            time: "HH:mm"
        };
        const DateFormatter = getFormatter({ localType: "date" }, undefined, { dateFormats });
        const DateTimeFormatter = getFormatter({ localType: "date-time" }, undefined, { dateFormats });
        const TimeFormatter = getFormatter({ localType: "time" }, undefined, { dateFormats });

        act(() => {
            ReactDOM.render(<DateFormatter value="2015-02-01T12:45:00Z" />, container);
        });
        expect(container.textContent).toBe("2015");

        act(() => {
            ReactDOM.render(<DateTimeFormatter value="2015-02-01Z" />, container);
        });
        expect(container.textContent).toBe("2015 01");

        act(() => {
            ReactDOM.render(<TimeFormatter value="12:45:00Z" />, container);
        });
        expect(container.textContent).toBe("12:45");

        act(() => {
            ReactDOM.render(<TimeFormatter value="1970-01-01T02:30:00Z" />, container);
        });
        expect(container.textContent).toBe("02:30");
    });

    it("test getFormatter for invalid date-time YYYY-MM-DD[Z]", () => {
        const dateFormats = {
            "date-time": "YYYY-MM-DD[Z]"
        };
        const DateTimeWithZFormatter = getFormatter({ localType: "date-time" }, undefined, { dateFormats });

        act(() => {
            ReactDOM.render(<DateTimeWithZFormatter value="2015-02-01Z" />, container);
        });
        expect(container.textContent).toBe("2015-02-01Z");

        act(() => {
            ReactDOM.render(<DateTimeWithZFormatter value="2015-02-01" />, container);
        });
        expect(container.textContent).toBe("2015-02-01Z");

        act(() => {
            ReactDOM.render(<DateTimeWithZFormatter value="2015/02/01 03:20:10" />, container);
        });
        expect(container.textContent).toBe("2015-02-01Z");

        act(() => {
            ReactDOM.render(<DateTimeWithZFormatter value="2015-02-01T12:45:00Z" />, container);
        });
        expect(container.textContent).toBe("2015-02-01Z");
    });
});
