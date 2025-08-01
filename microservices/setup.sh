#!/bin/bash

# Movie List Microservices Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Movie List Microservices Architecture..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) detected"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work."
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        print_warning "Docker daemon is not running. Please start Docker."
        return 1
    fi
    
    print_success "Docker is available and running"
    return 0
}

# Create environment file
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cat > .env << EOL
# Environment Configuration
NODE_ENV=development

# JWT Secrets (Change these in production!)
JWT_SECRET=movie-list-super-secret-jwt-key-development-only
JWT_REFRESH_SECRET=movie-list-refresh-secret-development-only

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database URLs
MONGODB_URI=mongodb://localhost:27017/movielist
AUTH_DB_URI=mongodb://localhost:27017/movielist-auth
MOVIE_DB_URI=mongodb://localhost:27017/movielist-movies
REVIEW_DB_URI=mongodb://localhost:27017/movielist-reviews
NOTIFICATION_DB_URI=mongodb://localhost:27017/movielist-notifications

# Service URLs
API_GATEWAY_URL=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:3001
MOVIE_SERVICE_URL=http://localhost:3002
REVIEW_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004

# Service Ports
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
MOVIE_SERVICE_PORT=3002
REVIEW_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004

# External Services
RABBITMQ_URL=amqp://localhost:5672
REDIS_URL=redis://localhost:6379

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
PASSWORD_SALT_ROUNDS=12
EOL
        print_success "Environment file (.env) created"
    else
        print_success "Environment file already exists"
    fi
}

# Install dependencies for all services
install_dependencies() {
    print_status "Installing dependencies for all services..."
    
    # Install root dependencies
    if [ -f package.json ]; then
        npm install
    fi
    
    # List of services
    services=("api-gateway" "auth-service" "movie-service" "review-service" "notification-service")
    
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            print_status "Installing dependencies for $service..."
            cd "$service"
            npm install
            cd ..
            print_success "$service dependencies installed"
        else
            print_warning "$service directory not found, skipping..."
        fi
    done
}

# Create log directories
setup_logs() {
    print_status "Setting up log directories..."
    
    services=("api-gateway" "auth-service" "movie-service" "review-service" "notification-service")
    
    for service in "${services[@]}"; do
        if [ -d "$service" ]; then
            mkdir -p "$service/logs"
            touch "$service/logs/.gitkeep"
        fi
    done
    
    print_success "Log directories created"
}

# Start infrastructure services with Docker
start_infrastructure() {
    if check_docker; then
        print_status "Starting infrastructure services (MongoDB, Redis, RabbitMQ)..."
        
        # Create a minimal docker-compose for infrastructure only
        cat > docker-compose.infrastructure.yml << EOL
version: '3.8'

services:
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
  rabbitmq_data:
EOL
        
        docker-compose -f docker-compose.infrastructure.yml up -d
        
        print_status "Waiting for services to start..."
        sleep 10
        
        print_success "Infrastructure services started"
        print_status "MongoDB: http://localhost:27017"
        print_status "Redis: http://localhost:6379"
        print_status "RabbitMQ Management: http://localhost:15672 (admin/password)"
    else
        print_warning "Docker not available. Please start MongoDB, Redis, and RabbitMQ manually."
    fi
}

# Create sample data
create_sample_data() {
    print_status "Creating sample data..."
    
    # This would typically connect to MongoDB and create sample movies, users, etc.
    # For now, we'll just create a sample data script
    
    cat > create-sample-data.js << EOL
// Sample data creation script
// Run this after services are started: node create-sample-data.js

const mongoose = require('mongoose');

// Sample movies data
const sampleMovies = [
    {
        title: "The Shawshank Redemption",
        genre: ["Drama"],
        year: 1994,
        director: "Frank Darabont",
        cast: ["Tim Robbins", "Morgan Freeman"],
        plot: "Two imprisoned men bond over a number of years...",
        poster: "https://example.com/poster1.jpg",
        rating: 9.3
    },
    {
        title: "The Godfather",
        genre: ["Crime", "Drama"],
        year: 1972,
        director: "Francis Ford Coppola",
        cast: ["Marlon Brando", "Al Pacino"],
        plot: "The aging patriarch of an organized crime dynasty...",
        poster: "https://example.com/poster2.jpg",
        rating: 9.2
    }
];

console.log('Sample data script created. Run with: node create-sample-data.js');
EOL
    
    print_success "Sample data script created"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Create start script
    cat > start-dev.sh << EOL
#!/bin/bash
echo "🚀 Starting Movie List Microservices in Development Mode..."

# Start all services concurrently
npm run dev:all
EOL
    
    # Create stop script
    cat > stop-dev.sh << EOL
#!/bin/bash
echo "🛑 Stopping Movie List Microservices..."

# Kill all node processes (be careful with this in production!)
pkill -f "node.*server.js"
pkill -f "nodemon"

echo "All services stopped"
EOL
    
    # Create health check script
    cat > health-check.sh << EOL
#!/bin/bash
echo "🏥 Checking service health..."

services=(
    "http://localhost:3000/health"
    "http://localhost:3001/health"
    "http://localhost:3002/health"
    "http://localhost:3003/health"
    "http://localhost:3004/health"
)

for service in "\${services[@]}"; do
    if curl -f "\$service" > /dev/null 2>&1; then
        echo "✅ \$service - OK"
    else
        echo "❌ \$service - DOWN"
    fi
done
EOL
    
    chmod +x start-dev.sh stop-dev.sh health-check.sh
    
    print_success "Development scripts created"
}

# Main setup function
main() {
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║    Movie List Microservices Architecture Setup            ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_node
    setup_environment
    install_dependencies
    setup_logs
    start_infrastructure
    create_sample_data
    create_dev_scripts
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                    Setup Complete! 🎉                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo "1. Start all services: ./start-dev.sh"
    echo "2. Check service health: ./health-check.sh"
    echo "3. Access API Gateway: http://localhost:3000"
    echo "4. Access individual services:"
    echo "   - Auth Service: http://localhost:3001"
    echo "   - Movie Service: http://localhost:3002"
    echo "   - Review Service: http://localhost:3003"
    echo "   - Notification Service: http://localhost:3004"
    echo ""
    echo "Infrastructure Services:"
    echo "- MongoDB: localhost:27017"
    echo "- Redis: localhost:6379"
    echo "- RabbitMQ Management: http://localhost:15672"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"
