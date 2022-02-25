import expect from "expect";
import {getXLabelFormatter, getYLabelFormatter, registerFormatter} from "../GridLabelsUtils";

const customFormatter = () => (projection) => {
    switch (projection) {
    case "EPSG:4326":
        return v => `${v}_custom_latlon`;
    case "EPSG:3857":
        return v => `${v}_custom_mercator`;
    default:
        return v => `${v}_custom_${projection}`;
    }
};

describe('Test GridLabelsUtils getXLabelFormatter', () => {
    afterEach(() => {
        registerFormatter("custom", undefined);
    });
    it('Standard formatter meters', () => {
        const formatter = getXLabelFormatter("EPSG:3857");
        expect(formatter(1200302)).toBe("1200302");
    });
    it('Standard formatter degrees', () => {
        const formatter = getXLabelFormatter("EPSG:4326");
        expect(formatter(45)).toBe("45° 00′ 00″ E");
        expect(formatter(-45)).toBe("45° 00′ 00″ W");
    });
    it('Custom formatter EPSG:4326', () => {
        const formatter = getXLabelFormatter("EPSG:4326", customFormatter("x"));
        expect(formatter(45)).toBe("45_custom_latlon");
    });
    it('Custom formatter EPSG:3857', () => {
        const formatter = getXLabelFormatter("EPSG:3857", customFormatter("x"));
        expect(formatter(45)).toBe("45_custom_mercator");
    });
    it('Custom formatter unknown', () => {
        const formatter = getXLabelFormatter("EPSG:3003", customFormatter("x"));
        expect(formatter(45)).toBe("45_custom_EPSG:3003");
    });
    it('Custom registered formatter EPSG:4326', () => {
        registerFormatter("custom", customFormatter);
        const formatter = getXLabelFormatter("EPSG:4326", "custom");
        expect(formatter(45)).toBe("45_custom_latlon");
    });
});

describe('Test GridLabelsUtils getYLabelFormatter', () => {
    it('Standard formatter meters', () => {
        const formatter = getYLabelFormatter("EPSG:3857");
        expect(formatter(1200302)).toBe("1200302");
    });
    it('Standard formatter degrees', () => {
        const formatter = getYLabelFormatter("EPSG:4326");
        expect(formatter(45)).toBe("45° 00′ 00″ N");
        expect(formatter(-45)).toBe("45° 00′ 00″ S");
    });
});
