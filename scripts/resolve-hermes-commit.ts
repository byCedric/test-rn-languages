import assert from 'node:assert';
import { argv } from 'node:process';

// Get the React Native version from first argument
const reactNativeVersion = argv[2];
assert(!!reactNativeVersion, 'Expected a React Native semver version as first argument');

fetchReactNativeHermesCommit()
  .then((hermesCommit) => console.log(hermesCommit))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/**
 * Fetch the Hermes commit hash included in the React Native version.
 * This pulls the `sdks/.hermesversion` file from the React Native package, and returns the commit hash.
 */
async function fetchReactNativeHermesCommit() {
  return fetch(`https://cdn.jsdelivr.net/npm/react-native@${reactNativeVersion}/sdks/.hermesversion`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to fetch Hermes version from "react-native@${reactNativeVersion}"`)
      }
      return response.text();
    })
    .then((hermesVersionWithCommit) => {
      // Example: hermes-2022-05-20-RNv0.69.0-ee8941b8874132b8f83e4486b63ed5c19fc3f111
      return hermesVersionWithCommit.split('-').pop();
    });
}
