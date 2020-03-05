import expect from 'expect';
import jest from "jest-mock";
expect.spyOn = (...args) => {
    const result = jest.spyOn(...args);
    result.andCall = result.mockImplementation;
    return result;
};
expect.createSpy = (...args) => {
    return jest.fn(...args);
};
expect.restoreSpies = (...args) => {
    return jest.restoreAllMocks(...args);
};
expect.extend({
    toIncludeKey(received, key) {
        const message = () => this.utils.matcherHint('toIncludeKey', undefined, '', {
            isNot: this.isNot,
            promise: this.promise
        }) + '\n\n' +
            `Received: ${this.utils.printReceived(received)}` +
            `Key: ${key}`;
        return {
            pass: Object.keys(received).indexOf(key) !== -1,
            message
        };
    },
    toIncludeKeys(received, keys) {
        const message = () => this.utils.matcherHint('toIncludeKey', undefined, '', {
            isNot: this.isNot,
            promise: this.promise
        }) + '\n\n' +
            `Received: ${this.utils.printReceived(received)}` +
            `Key: ${keys}`;
        return {
            pass: keys.reduce((acc, key) => {
                return acc && Object.keys(received).indexOf(key) !== -1;
            }, true),
            message
        };
    }
});
