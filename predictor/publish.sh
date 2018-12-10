#!/bin/bash

REGISTRY=registry.24hr.se
SERVICE_NAME=espress-sound-labeler/predictor

# exit on error
set -e

VERSION=$(cat version.txt)

echo $VERSION

SERVICE_RELEASE=${VERSION}
SERVICE_VERSION_LATEST=latest

# tag
echo "Building version $REGISTRY/$SERVICE_NAME:$SERVICE_RELEASE"

export TAG_NAME="${SERVICE_NAME}:${SERVICE_RELEASE}"
export TAG_NAME_LATEST="${SERVICE_NAME}:${SERVICE_VERSION_LATEST}"

docker build --build-arg VERSION="$VERSION" --rm=true -t $TAG_NAME -f Dockerfile .
docker tag $TAG_NAME $REGISTRY/$TAG_NAME
docker tag $TAG_NAME $REGISTRY/$TAG_NAME_LATEST

echo ""
echo "Done building."
echo ""

echo "Pushing $TAG_NAME"

docker push $REGISTRY/$TAG_NAME
docker push $REGISTRY/$TAG_NAME_LATEST

echo "Done."
echo ""

