// metro.config.js
// Ajustes do Metro recomendados pela documentação do Expo para o Firebase JS SDK:
//  - 'cjs' em sourceExts: alguns módulos do Firebase são publicados como .cjs;
//  - unstable_enablePackageExports = false: faz o Metro resolver o build
//    "react-native" do firebase/auth (o que exporta getReactNativePersistence),
//    evitando o erro "Component auth has not been registered yet".

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
