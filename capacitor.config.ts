import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.athar.app',
  appName: 'Athar',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
  },
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
}

export default config
