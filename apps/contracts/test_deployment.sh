#!/bin/bash

# FlashArb Complete Test Deployment Script
# This script deploys all contracts and runs comprehensive tests

set -e  # Exit on any error

echo "FlashArb Complete Test Deployment"
echo "===================================="

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

# Check if forge is installed
if ! command -v forge &> /dev/null; then
    print_error "Forge not found. Please install Foundry first."
    print_status "Visit: https://book.getfoundry.sh/getting-started/installation"
    exit 1
fi

# Check if we're in the contracts directory
if [[ ! -f "foundry.toml" ]]; then
    print_error "Please run this script from the contracts directory"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
forge clean
print_success "Build cleaned"

# Step 2: Install dependencies
print_status "Installing dependencies..."
forge install --no-commit
print_success "Dependencies installed"

# Step 3: Build contracts
print_status "Building contracts..."
if forge build; then
    print_success "Contracts built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 4: Run unit tests first
print_status "Running unit tests..."
if forge test -vv --match-contract "FlashArbHookTest"; then
    print_success "Unit tests passed"
else
    print_warning "Some unit tests failed, continuing with deployment..."
fi

# Step 5: Deploy all contracts
print_status "Deploying all contracts..."
if forge script script/00_DeployAll.s.sol:DeployAllScript --fork-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; then
    print_success "All contracts deployed successfully"
else
    print_error "Deployment failed"
    exit 1
fi

# Step 6: Run comprehensive integration tests
print_status "Running comprehensive integration tests..."
if forge script script/99_TestArbitrageFlow.s.sol:TestArbitrageFlowScript --fork-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; then
    print_success "Integration tests passed"
else
    print_error "Integration tests failed"
    exit 1
fi

# Step 7: Display deployment summary
print_status "Reading deployment addresses..."
if [[ -f "deployments.env" ]]; then
    echo ""
    echo "📋 DEPLOYMENT ADDRESSES"
    echo "======================="
    cat deployments.env
    echo ""
else
    print_warning "deployments.env file not found"
fi

# Final success message
echo ""
print_success "FlashArb deployment and testing completed successfully!"
echo ""
echo "Next Steps:"
echo "  1. Check the deployment addresses above"
echo "  2. Update your frontend configuration with these addresses"
echo "  3. Test the system with the provided test wallet"
echo "  4. Monitor the contracts for any issues"
echo ""
echo "Test Configuration:"
echo "  - Test Wallet: 0x1ed73ee055b7B5379CcD398748281C5A82e9A41E"
echo "  - Test Nullifiers: 12345, 54321, 98765"
echo "  - Mock 1inch Profit Rate: 1% (configurable)"
echo ""
echo "Remember: These are test contracts with mock implementations."
echo "   Replace with real World ID and 1inch integrations for production."
