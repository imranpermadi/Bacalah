const { withAndroidManifest, withGradleProperties } = require('@expo/config-plugins');

function setOrUpdate(list, key, value) {
  const item = list.find((p) => p.type === 'property' && p.key === key);
  if (item) {
    item.value = value;
  } else {
    list.push({ type: 'property', key, value });
  }
}

module.exports = function withSlimBuild(config) {
  // 1. Gradle Properties: arm64-v8a + useLegacyPackaging=true (kompatibel penuh dengan Xiaomi HyperOS)
  config = withGradleProperties(config, (config) => {
    setOrUpdate(config.modResults, 'reactNativeArchitectures', 'arm64-v8a');
    setOrUpdate(config.modResults, 'expo.useLegacyPackaging', 'true');
    return config;
  });

  // 2. AndroidManifest: Hapus SYSTEM_ALERT_WINDOW & DUMP yang memicu pemblokiran installer Android 14
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (manifest['uses-permission']) {
      manifest['uses-permission'] = manifest['uses-permission'].filter((p) => {
        const name = p.$?.['android:name'];
        return (
          name !== 'android.permission.SYSTEM_ALERT_WINDOW' &&
          name !== 'android.permission.DUMP'
        );
      });
    }
    return config;
  });

  return config;
};
