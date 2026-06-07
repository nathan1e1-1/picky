/**
 * Regression test for native module compatibility.
 * 
 * Ensures packages stay within Expo SDK 54's supported ranges
 * to prevent HostFunction crashes in Expo Go.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Native Module Compatibility', () => {
  it('uses react-native compatible with Expo SDK 54', () => {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const rnVersion = packageJson.dependencies['react-native'];
    expect(rnVersion).toBeDefined();
    // Expo SDK 54 uses React Native 0.81.x
    expect(rnVersion).toMatch(/^0\.81\./);
  });

  it('uses expo in the SDK 54 range', () => {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const expoVersion = packageJson.dependencies['expo'];
    expect(expoVersion).toBeDefined();
    expect(expoVersion).toMatch(/^\~?54\./);
  });

  it('pins react-native-worklets to the version expected by Expo SDK 54', () => {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const workletsVersion = packageJson.dependencies['react-native-worklets'];
    expect(workletsVersion).toBeDefined();
    
    // Expo SDK 54 expects worklets 0.5.x
    // Using a different version causes HostFunction crash in Expo Go
    expect(workletsVersion).toMatch(/^0\.5\./);
  });

  it('uses react-native-gesture-handler compatible with Expo SDK 54', () => {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const ghVersion = packageJson.dependencies['react-native-gesture-handler'];
    expect(ghVersion).toBeDefined();
    // Expo SDK 54 expects gesture-handler ~2.28.0
    // v3.x is NOT in Expo Go SDK 54 and will crash
    expect(ghVersion).toMatch(/^\~?2\./);
  });

  it('uses react-native-reanimated compatible with Expo SDK 54', () => {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const reanimatedVersion = packageJson.dependencies['react-native-reanimated'];
    expect(reanimatedVersion).toBeDefined();
    // Expo SDK 54 expects reanimated ~4.1.x
    expect(reanimatedVersion).toMatch(/^\~?4\./);
  });
});
