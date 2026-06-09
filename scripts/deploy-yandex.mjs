/**
 * Сборка и заливка dist/ в Яндекс Object Storage (S3-совместимый API).
 * Требует: AWS CLI v2 в PATH, переменные в .env
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const DEPLOY_ENV_KEYS = new Set([
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'BUCKET_NAME',
    'YANDEX_STORAGE_ENDPOINT',
]);

/** Только ключи деплоя. VITE_* не трогаем — иначе /api/v1 из .env затрёт .env.production при build. */
function loadDeployEnv() {
    const envPath = resolve(root, '.env');
    if (!existsSync(envPath)) {
        console.warn('⚠️  .env не найден — используйте переменные окружения');
        return;
    }
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        if (!DEPLOY_ENV_KEYS.has(key)) continue;
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        process.env[key] = val;
    }
}

/** Vite не перезаписывает process.env — снимаем dev VITE_* перед production build */
function clearViteEnvForProductionBuild() {
    for (const key of Object.keys(process.env)) {
        if (key.startsWith('VITE_')) delete process.env[key];
    }
}

function run(cmd, args, opts = {}) {
    const display = [cmd, ...args].map((a) => (/\s/.test(String(a)) ? `"${a}"` : a)).join(' ');
    console.log(`\n> ${display}`);
    const r = spawnSync(cmd, args, {
        stdio: 'inherit',
        cwd: root,
        shell: false,
        windowsHide: true,
        ...opts,
    });
    if (r.status !== 0) {
        process.exit(r.status ?? 1);
    }
}

function runNpm(script) {
    console.log(`\n> npm run ${script}`);
    const r = spawnSync('npm', ['run', script], {
        stdio: 'inherit',
        cwd: root,
        shell: true,
        windowsHide: true,
    });
    if (r.status !== 0) process.exit(r.status ?? 1);
}

loadDeployEnv();

const bucket = process.env.BUCKET_NAME;
const keyId = process.env.AWS_ACCESS_KEY_ID;
const secret = process.env.AWS_SECRET_ACCESS_KEY;
const endpoint = process.env.YANDEX_STORAGE_ENDPOINT || 'https://storage.yandexcloud.net';

if (!bucket || !keyId || !secret) {
    console.error('❌ Нужны BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY в .env');
    process.exit(1);
}

console.log('📦 Сборка production (API из .env.production)...');
clearViteEnvForProductionBuild();
runNpm('build');

const dist = resolve(root, 'dist');
if (!existsSync(resolve(dist, 'index.html'))) {
    console.error('❌ dist/index.html не найден после сборки');
    process.exit(1);
}

console.log(`\n☁️  Заливка в s3://${bucket}/ ...`);
const awsCmd = process.platform === 'win32' ? 'aws.exe' : 'aws';
const awsEnv = { ...process.env, AWS_ACCESS_KEY_ID: keyId, AWS_SECRET_ACCESS_KEY: secret };
for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'http_proxy', 'https_proxy', 'all_proxy']) {
    delete awsEnv[key];
}
awsEnv.NO_PROXY = '*';
run(
    awsCmd,
    ['s3', 'sync', dist, `s3://${bucket}/`, '--delete', '--endpoint-url', endpoint],
    { env: awsEnv }
);

console.log('\n✅ Готово. Проверь сайт в инкогнито и сбрось CDN-кэш, если включён.');
