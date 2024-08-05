import assert from 'node:assert';
import { argv } from 'node:process';

// Get the React Native version from first argument
const reactNativeVersion = argv[2];
assert(!!reactNativeVersion, 'Expected a React Native semver version as first argument');

fetchReactNativeVersion()
  .then((reactNativeVersion) => console.log(reactNativeVersion))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/** * Fetch the React Native version from semver range. */
async function fetchReactNativeVersion() {
  return fetch(`https://cdn.jsdelivr.net/npm/react-native@${reactNativeVersion}/package.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to fetch React Native version from "react-native@${reactNativeVersion}"`)
      }
      return response.json();
    })
    .then((reactNativePackagefile) => reactNativePackagefile.version);
}
