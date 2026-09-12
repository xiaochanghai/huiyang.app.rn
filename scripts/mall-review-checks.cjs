const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
const { networkPolicy } = require('../plugins/with-mall-network');

(async () => {
  const http = networkPolicy('http://47.87.129.28:6060');
  assert.deepEqual(Object.keys(http.ios), ['47.87.129.28']);
  assert.equal(
    http.ios['47.87.129.28'].NSExceptionAllowsInsecureHTTPLoads,
    true
  );
  assert(
    http.android.includes('<base-config cleartextTrafficPermitted="false" />')
  );
  assert(
    http.android.includes(
      '<domain includeSubdomains="false">47.87.129.28</domain>'
    )
  );
  const secure = networkPolicy('https://mall.example.com');
  assert.deepEqual(secure.ios, {});
  assert(!secure.android.includes('cleartextTrafficPermitted="true"'));
  assert.throws(() => networkPolicy('ftp://example.com'));
  assert.equal(
    fs.readFileSync(
      'android/app/src/main/res/xml/mall_network_security_config.xml',
      'utf8'
    ),
    http.android
  );
  assert(
    fs
      .readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8')
      .includes(
        'android:networkSecurityConfig="@xml/mall_network_security_config"'
      )
  );
  const plist = fs.readFileSync('ios/EUCloud/Info.plist', 'utf8');
  assert(plist.includes('<key>47.87.129.28</key>'));
  assert(/<key>NSAllowsArbitraryLoads<\/key>\s*<false\/>/.test(plist));

  const filename = path.resolve('src/features/mall/quantity-drafts.ts');
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = module.paths;
  loaded._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename
  );
  const { QuantityDrafts } = loaded.exports;
  const registry = new QuantityDrafts();
  const events = [];
  let release;
  registry.register({}, async () => {
    events.push('quantity');
    await new Promise((resolve) => {
      release = resolve;
    });
    events.push('saved');
  });
  const operation = registry.flush().then(() => events.push('submit'));
  assert.deepEqual(events, ['quantity']);
  release();
  await operation;
  assert.deepEqual(events, ['quantity', 'saved', 'submit']);
  const failing = new QuantityDrafts();
  const unregister = failing.register({}, async () => {
    throw new Error('quantity failed');
  });
  await assert.rejects(failing.flush(), /quantity failed/);
  unregister();
  await failing.flush();
  console.log(
    'PASS: scoped native network policy, HTTPS policy, quantity flush ordering, failure propagation and unmount cleanup.'
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
