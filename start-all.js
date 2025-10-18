import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, 'backend');
const projectRoot = __dirname;
let frontend;
const backend = spawn('node', ['servidor.js'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true
});
backend.on('error', (err) => {
    process.exit(1);
});
backend.on('close', (code) => {
    if (frontend) frontend.kill();
    process.exit(1);
});
setTimeout(() => {
    frontend = spawn('npm', ['run', 'start'], {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
    });
    frontend.on('error', (err) => {
        backend.kill();
        process.exit(1);
    });
    frontend.on('close', (code) => {
        backend.kill();
        process.exit(1);
    });
    process.on('SIGINT', () => {
        backend.kill();
        if (frontend) frontend.kill();
        process.exit(0);
    });
}, 2000);