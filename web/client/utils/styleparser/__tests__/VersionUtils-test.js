import expect from 'expect';
import { parseCommitDataMessage } from '../../VersionUtils';

describe('VersionUtils', () => {
    it('parseCommitDataMessage', () => {
        const commitData = 'Message: test\nCommit: 123456\nDate: 2022-01-01';
        const result = parseCommitDataMessage(commitData);
        expect(result.message).toBe('test');
        expect(result.commit).toBe('123456');
        expect(result.date).toBe('2022-01-01');
    });
});
