const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withSlimBuild(config) {
  return withGradleProperties(config, (config) => {
    // Menetapkan arsitektur native ke arm64-v8a saja (khusus HP Android modern)
    const existingIdx = config.modResults.findIndex(
      (item) => item.type === 'property' && item.key === 'reactNativeArchitectures'
    );
    if (existingIdx !== -1) {
      config.modResults[existingIdx].value = 'arm64-v8a';
    } else {
      config.modResults.push({
        type: 'property',
        key: 'reactNativeArchitectures',
        value: 'arm64-v8a',
      });
    }
    return config;
  });
};

