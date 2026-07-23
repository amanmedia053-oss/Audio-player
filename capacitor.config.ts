import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amanmedia.love',
  appName: 'د مينې ډيوه',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#1c1b1f',
      style: 'DARK'
    }
  }
};

export default config;

