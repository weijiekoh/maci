#!/bin/bash

cd "$(dirname "$0")"
cd ..
mkdir -p build

NODE_OPTIONS=--max-old-space-size=4096 node build/buildSnarks.js -i circom/prod/quadVoteTally.circom -j build/qvtCircuit.json -p build/qvtPk.bin -v build/qvtVk.json -s build/QuadVoteTallyVerifier.sol -vs QuadVoteTallyVerifier

echo 'Copying QuadVoteTallyVerifier.sol to contracts/sol.'
cp ./build/QuadVoteTallyVerifier.sol ../contracts/sol/
