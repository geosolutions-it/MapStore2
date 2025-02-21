
const fs = require('fs');
const path = require('path');

['pre-commit'].forEach((githook) => {
    fs.copyFileSync(
        path.join(__dirname, githook),
        path.join(__dirname, '..', '..', '.git', 'hooks', githook)
    );
});
