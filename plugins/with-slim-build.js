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
  // 1. Gradle Properties: armeabi-v7a + arm64-v8a + useLegacyPackaging=true
  // Kompatibel penuh dengan Tecno Spark (32-bit), Xiaomi Redmi HyperOS (64-bit), dan semua HP Android
  config = withGradleProperties(config, (config) => {
    setOrUpdate(config.modResults, 'reactNativeArchitectures', 'armeabi-v7a,arm64-v8a');
    setOrUpdate(config.modResults, 'expo.useLegacyPackaging', 'true');
    return config;
  });

  // 2. AndroidManifest: Hapus paksa SYSTEM_ALERT_WINDOW & DUMP dengan tools:node="remove"
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    manifest['uses-permission'] = manifest['uses-permission'].filter((p) => {
      const name = p.$?.['android:name'];
      return (
        name !== 'android.permission.SYSTEM_ALERT_WINDOW' &&
        name !== 'android.permission.DUMP'
      );
    });

    manifest['uses-permission'].push({
      $: {
        'android:name': 'android.permission.SYSTEM_ALERT_WINDOW',
        'tools:node': 'remove',
      },
    });
    manifest['uses-permission'].push({
      $: {
        'android:name': 'android.permission.DUMP',
        'tools:node': 'remove',
      },
    });

    return config;
  });

  return config;
};
