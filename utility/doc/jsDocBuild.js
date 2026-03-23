const { execSync } = require('child_process');
const { configPath } = require('./jsDocUtils');

try {

    const output = execSync(`docma -c ${configPath} --dest web/docs`, {
        env: { ...process.env, NODE_OPTIONS: '--no-deprecation', FORCE_COLOR: '1' },
        encoding: 'utf8'
    });

    console.log(output); // eslint-disable-line
    if (output.includes("ERROR:")) { // check errors
        console.error("\n❌ Fail: Errors found in JSDoc.");
        process.exit(1);
    }

    console.log("✅ Build successful."); // eslint-disable-line
} catch (error) {
    console.error("❌ Error during execution of Docma:", error.message);
    process.exit(1);
}
