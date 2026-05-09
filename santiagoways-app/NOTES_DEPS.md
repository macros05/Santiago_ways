# Dependency notes

## fs-extra

Declared as a direct dependency as a workaround for a missing transitive
declaration in `expo-modules-autolinking@3.0.24` (and `3.0.25`).

The compiled output of `expo-modules-autolinking` requires `fs-extra` in
`build/platforms/apple.js`, `build/platforms/android.js`,
`build/ReactImportsPatcher.js`, and `build/autolinking/mergeLinkingOptions.js`,
but the package's `package.json` does not declare it as a runtime dep, and
nothing else in the Expo SDK 54 dep tree pulls it in transitively. Without
this workaround, `use_expo_modules!` in the iOS Podfile fails with:

    Couldn't parse JSON coming from `expo-modules-autolinking` command:
    unexpected end of input at line 1 column 1.

(the underlying error is `Cannot find module 'fs-extra'`, which goes to
stderr while the Ruby script reads empty stdout and tries to JSON-parse it).

Track the upstream fix and remove this entry once it lands. Search the Expo
issue tracker for `fs-extra autolinking`:
https://github.com/expo/expo/issues
