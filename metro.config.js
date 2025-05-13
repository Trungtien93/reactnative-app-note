const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs'); // Thêm hỗ trợ .cjs
defaultConfig.resolver.unstable_enablePackageExports = false; // 👈 Dòng fix lỗi auth crash Hermes

module.exports = defaultConfig;
