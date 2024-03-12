export const parseCommitDataMessage = (commitData = "") => {
    const splitData = commitData.split('\n');
    return {
        message: splitData.find((x)=> x.includes('Message:'))?.split('Message: ')?.[1] ?? 'no-message',
        commit: splitData.find((x)=> x.includes('Commit:'))?.split('Commit: ')?.[1] ?? 'no-commit',
        date: splitData.find((x)=> x.includes('Date:'))?.split('Date: ')?.[1] ?? 'no-date'
    };
};
