#!/bin/bash

# NOTE: Make sure this file is  executable by running chmod +x init-db.sh

echo "Waiting for Mongo to start..."

until nc -z "test-mongodb-taas" "27017"; do
  >&2 echo "Mongo is unavailable - sleeping"
  sleep 1
done

echo "Mongo started."

## Run test environment

yarn dev
echo "Test environment ready, go node container shell to run tests"

