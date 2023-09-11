/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import ReactDOM from "react-dom";
import expect from "expect";

import NumberFormat from "../../../../I18N/Number";
import { getFormatter, registerFormatter, unregisterFormatter } from "../index";

describe("Tests for the formatter functions", () => {
    it("test getFormatter for booleans", () => {
        const formatter = getFormatter({ localType: "boolean" });
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(formatter({ value: true }).type).toBe("span");
        expect(formatter({ value: true }).props.children).toBe("true");
        expect(formatter({ value: false }).props.children).toBe("false");
        expect(formatter({ value: null })).toBe(null);
        expect(formatter({ value: undefined })).toBe(null);
    });
    it("test getFormatter for strings", () => {
        const value = "Test https://google.com with google link";
        const formatter = getFormatter({ localType: "string" });
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(formatter({ value: "Test no links" })[0]).toBe("Test no links");
        expect(formatter({ value })[0]).toBe("Test ");
        expect(formatter({ value })[1].props.href).toBe("https://google.com");
        expect(formatter({ value })[2]).toBe(" with google link");
        expect(formatter({ value: null })).toBe(null);
        expect(formatter({ value: undefined })).toBe(null);
    });
    it("test getFormatter for number", () => {
        const formatter = getFormatter({ localType: "number" });
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(formatter({ value: 44.3333434353535 }).type).toBe(NumberFormat);
        expect(formatter({ value: 44.3333434353535 }).props.value).toBe(
            44.3333434353535
        );
        expect(formatter({ value: null })).toBe(null);
        expect(formatter({ value: undefined })).toBe(null);
        expect(formatter({ value: 0 }).props.value).toBe(0);
    });
    it("test getFormatter for int", () => {
        const formatter = getFormatter({ localType: "int" });
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(formatter({ value: 2455567 }).type).toBe(NumberFormat);
        expect(formatter({ value: 2455567 }).props.value).toBe(2455567);
        expect(formatter({ value: null })).toBe(null);
        expect(formatter({ value: undefined })).toBe(null);
        expect(formatter({ value: 0 }).props.value).toBe(0);
    });
    it("test getFormatter for geometry", () => {
        const formatter = getFormatter({ localType: "Geometry" });
        expect(typeof formatter).toBe("function");
        expect(formatter()).toBe(null);
        expect(
            formatter({
                value: {
                    properties: {},
                    geometry: { type: "Point", coordinates: [1, 2] }
                }
            })
        ).toBe(null);
        expect(formatter({ value: null })).toBe(null);
        expect(formatter({ value: undefined })).toBe(null);
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
        const dateFormatter = getFormatter({ localType: "date" }, undefined, {
            dateFormats
        });
        const dateTimeFormatter = getFormatter(
            { localType: "date-time" },
            undefined,
            { dateFormats }
        );
        const timeFormatter = getFormatter({ localType: "time" }, undefined, {
            dateFormats
        });
        expect(typeof dateFormatter).toBe("function");
        expect(dateFormatter()).toBe(null);
        expect(dateFormatter({ value: "2015-02-01T12:45:00Z" })).toBe("2015");
        expect(typeof dateTimeFormatter).toBe("function");
        expect(dateTimeFormatter()).toBe(null);
        expect(dateTimeFormatter({ value: "2015-02-01Z" })).toBe("2015 01");
        expect(typeof timeFormatter).toBe("function");
        expect(timeFormatter()).toBe(null);
        expect(timeFormatter({ value: "12:45:00Z" })).toBe("12:45");
        expect(timeFormatter({ value: "1970-01-01T02:30:00Z" })).toBe("02:30"); // still able to format time even when found a full date (sometimes GeoServer returns full date instead of time only)
    });

    it("test getFormatter for invalid date-time YYYY-MM-DD[Z]", () => {
        const dateFormats = {
            "date-time": "YYYY-MM-DD[Z]"
        };
        const dateTimeWithZFormatter = getFormatter(
            { localType: "date-time" },
            undefined,
            { dateFormats }
        );
        expect(typeof dateTimeWithZFormatter).toBe("function");
        expect(dateTimeWithZFormatter({ value: "2015-02-01Z" })).toBe(
            "2015-02-01Z"
        );
        expect(dateTimeWithZFormatter({ value: "2015-02-01" })).toBe(
            "2015-02-01Z"
        );
        expect(dateTimeWithZFormatter({ value: "2015/02/01" })).toBe(
            "2015-02-01Z"
        );
        expect(dateTimeWithZFormatter({ value: "2015/02/01 03:20:10" })).toBe(
            "2015-02-01Z"
        );
        expect(dateTimeWithZFormatter({ value: "2015-02-01T12:45:00Z"})).toBe('2015-02-01Z');
    });
});
