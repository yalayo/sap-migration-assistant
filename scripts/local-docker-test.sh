#!/bin/bash

# Local Docker testing script
echo "🐳 Building S/4HANA Migration Assistant Docker image..."

# Build the Docker image
docker build -t s4hana-migration-assistant .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    
    echo "🚀 Starting test container..."
    # Run the container for testing
    docker run -d --name s4hana-test -p 8080:8080 \
        -e NODE_ENV=test \
        -e SESSION_SECRET=test-secret-key \
        s4hana-migration-assistant
    
    echo "⏳ Waiting for container to start..."
    sleep 10
    
    echo "🔍 Testing health endpoint..."
    # Test the health endpoint
    if curl -f http://localhost:8080/api/health; then
        echo ""
        echo "✅ Container is running successfully!"
        echo "🌐 Application available at: http://localhost:8080"
        echo ""
        echo "To stop the container:"
        echo "  docker stop s4hana-test"
        echo "  docker rm s4hana-test"
    else
        echo "❌ Health check failed!"
        echo "📋 Container logs:"
        docker logs s4hana-test
        docker stop s4hana-test
        docker rm s4hana-test
        exit 1
    fi
else
    echo "❌ Docker build failed!"
    exit 1
fi