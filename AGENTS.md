# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Project SDK

This project uses **Expo SDK 54** with React Native 0.81.5.

## Physical Device Testing (Expo Go)

Expo Go is a **pre-built binary** — its native modules (C/Java/Kotlin code) are compiled and cannot change. Your JS dependencies must match the native modules inside Expo Go EXACTLY, or you will get `Exception in HostFunction` crashes.

### Critical Version Pinning Rules

1. **Never run `npx expo install --fix` blindly** — it may install versions newer than what Expo Go contains.
2. **Always pin to exact SDK versions** — use `npx expo-doctor` to verify.
3. **react-native-worklets** must match Expo Go's exact version:
   - SDK 54 expects `react-native-worklets@0.5.1`
   - Installing 0.8.3 or 0.9.x causes HostFunction crashes
   - `expo install --fix` is the authoritative source for Expo Go versions
4. **react-native-gesture-handler** must stay in v2.x for SDK 54:
   - v3.x is NOT in Expo Go SDK 54 and will crash
5. **react-native-reanimated** must stay in v4.1.x for SDK 54:
   - v4.3.x may have incompatible native API changes

### Running on Physical iPhone

1. Install **Expo Go** from the App Store (it's always the latest SDK, currently 54)
2. Run `npx expo start --clear` in project root
3. Scan the QR code with iPhone camera
4. If you see "Project is incompatible with Expo Go", check SDK version matches

## Project Skills

Custom skills for this project can be placed in `.agents/skills/`. Models will use them when building.
