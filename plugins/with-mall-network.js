const fs = require('node:fs/promises');
const path = require('node:path');
const {
  withAndroidManifest,
  withDangerousMod,
  withInfoPlist,
} = require('expo/config-plugins');

function networkPolicy(url) {
  const endpoint = new URL(url);
  if (!['http:', 'https:'].includes(endpoint.protocol))
    throw new Error('商城接口只支持 HTTP/HTTPS');
  const host = endpoint.hostname;
  if (!/^[a-z0-9.:[\]-]+$/i.test(host)) throw new Error('商城接口主机格式无效');
  const http = endpoint.protocol === 'http:';
  return {
    ios: http
      ? {
          [host]: {
            NSExceptionAllowsInsecureHTTPLoads: true,
            NSIncludesSubdomains: false,
          },
        }
      : {},
    android: `<?xml version="1.0" encoding="utf-8"?>\n<network-security-config>\n  <base-config cleartextTrafficPermitted="false" />\n${http ? `  <domain-config cleartextTrafficPermitted="true">\n    <domain includeSubdomains="false">${host}</domain>\n  </domain-config>\n` : ''}</network-security-config>\n`,
    debug:
      '<?xml version="1.0" encoding="utf-8"?>\n<network-security-config>\n  <base-config cleartextTrafficPermitted="true" />\n</network-security-config>\n',
  };
}

function withMallNetwork(config, { url }) {
  const policy = networkPolicy(url);
  config = withInfoPlist(config, (mod) => {
    const ats = mod.modResults.NSAppTransportSecurity || {};
    const exceptions = { ...ats.NSExceptionDomains };
    // Remove the exception owned by the previous build when the endpoint changes.
    delete exceptions[mod.modResults.MallHTTPHost || '47.87.129.28'];
    const host = Object.keys(policy.ios)[0];
    if (host) mod.modResults.MallHTTPHost = host;
    else delete mod.modResults.MallHTTPHost;
    mod.modResults.NSAppTransportSecurity = {
      ...ats,
      NSExceptionDomains: { ...exceptions, ...policy.ios },
    };
    return mod;
  });
  config = withAndroidManifest(config, (mod) => {
    mod.modResults.manifest.application[0].$['android:networkSecurityConfig'] =
      '@xml/mall_network_security_config';
    return mod;
  });
  return withDangerousMod(config, [
    'android',
    async (mod) => {
      for (const variant of ['main', 'debug', 'debugOptimized']) {
        const folder = path.join(
          mod.modRequest.platformProjectRoot,
          'app',
          'src',
          variant,
          'res',
          'xml'
        );
        await fs.mkdir(folder, { recursive: true });
        await fs.writeFile(
          path.join(folder, 'mall_network_security_config.xml'),
          variant === 'main' ? policy.android : policy.debug
        );
      }
      return mod;
    },
  ]);
}

module.exports = withMallNetwork;
module.exports.networkPolicy = networkPolicy;
