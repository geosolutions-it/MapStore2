
const { execSync } = require('child_process');

try {
    execSync('npm run json:check');
} catch (e) {
    throw new Error(`

        #################################

        Error: json file not formatted correctly, please run:


            npm run json:write


        and then commit

        #################################

    `);
}
