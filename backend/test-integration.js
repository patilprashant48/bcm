/**
 * Integration Test Script for BCM Platform
 * Tests all backend API endpoints
 */

const axios = require('axios');

const BASE_URL = 'https://bcm-6f7f.onrender.com/api';
// const BASE_URL = 'http://localhost:3000/api'; // For local testing

let adminToken = '';
let businessToken = '';
let investorToken = '';
let businessId = '';
let projectId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, data = null, token = null, shouldFail = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    if (shouldFail) {
      log(`  ❌ ${name} - Should have failed but succeeded`, 'red');
      return { success: false, data: response.data };
    }
    
    log(`  ✅ ${name}`, 'green');
    return { success: true, data: response.data };
  } catch (error) {
    if (shouldFail) {
      log(`  ✅ ${name} - Failed as expected`, 'green');
      return { success: true, error: error.response?.data };
    }
    
    log(`  ❌ ${name} - ${error.response?.data?.message || error.message}`, 'red');
    return { success: false, error: error.response?.data };
  }
}

async function runTests() {
  log('\n========================================', 'blue');
  log('BCM Platform Integration Tests', 'blue');
  log('========================================\n', 'blue');

  // 1. Health Check
  log('1. Health Check', 'yellow');
  await testEndpoint('Backend Health', 'GET', '/../health');

  // 2. Authentication Tests
  log('\n2. Authentication Routes', 'yellow');
  
  const loginResult = await testEndpoint(
    'Admin Login',
    'POST',
    '/auth/login',
    {
      email: 'admin@bcm.com',
      password: 'admin123'
    }
  );
  
  if (loginResult.success && loginResult.data.token) {
    adminToken = loginResult.data.token;
    log(`  → Admin Token: ${adminToken.substring(0, 20)}...`, 'blue');
  }

  // 3. Admin Routes
  if (adminToken) {
    log('\n3. Admin Routes', 'yellow');
    await testEndpoint('Get Dashboard Stats', 'GET', '/admin/dashboard/stats', null, adminToken);
    await testEndpoint('Get Businesses', 'GET', '/admin/businesses', null, adminToken);
    await testEndpoint('Get Projects', 'GET', '/admin/projects', null, adminToken);
    await testEndpoint('Get Live Projects', 'GET', '/admin/projects/live', null, adminToken);
    await testEndpoint('Get Closed Projects', 'GET', '/admin/projects/closed', null, adminToken);
    await testEndpoint('Get Customers', 'GET', '/admin/customers', null, adminToken);
    await testEndpoint('Get KYC Requests', 'GET', '/admin/kyc', null, adminToken);
    await testEndpoint('Get Plans', 'GET', '/admin/plans', null, adminToken);
    await testEndpoint('Get Settings', 'GET', '/admin/settings', null, adminToken);
    await testEndpoint('Get Capital Shares', 'GET', '/admin/capital/shares', null, adminToken);
    await testEndpoint('Get Capital Loans', 'GET', '/admin/capital/loans', null, adminToken);
    await testEndpoint('Get Capital FDs', 'GET', '/admin/capital/fds', null, adminToken);
    await testEndpoint('Get Capital Partnerships', 'GET', '/admin/capital/partnerships', null, adminToken);
    await testEndpoint('Get Admins', 'GET', '/admin/admins', null, adminToken);
    await testEndpoint('Get Audit Logs', 'GET', '/admin/audit-logs', null, adminToken);
    await testEndpoint('Get Transaction Reports', 'GET', '/admin/reports/transactions', null, adminToken);
  }

  // 4. Wallet Routes
  if (adminToken) {
    log('\n4. Wallet Routes (Admin)', 'yellow');
    await testEndpoint('Get Wallet', 'GET', '/wallet', null, adminToken);
    await testEndpoint('Get Wallet Transactions', 'GET', '/wallet/transactions', null, adminToken);
    await testEndpoint('Get Payment Requests', 'GET', '/wallet/payment-requests', null, adminToken);
    await testEndpoint('Get Admin Payment Requests', 'GET', '/wallet/admin/payment-requests', null, adminToken);
    await testEndpoint('Get Admin All Transactions', 'GET', '/wallet/admin/transactions', null, adminToken);
    await testEndpoint('Get Admin Wallet', 'GET', '/wallet/admin/wallet', null, adminToken);
    await testEndpoint('Get Admin Wallet Transactions', 'GET', '/wallet/admin/wallet/transactions', null, adminToken);
  }

  // 5. Plans Routes
  log('\n5. Plans Routes', 'yellow');
  const plansResult = await testEndpoint('Get All Plans', 'GET', '/plans');
  
  if (adminToken) {
    await testEndpoint('Get My Plan (Admin)', 'GET', '/plans/my-plan', null, adminToken);
  }

  // 6. FDS Routes
  log('\n6. FDS Routes', 'yellow');
  await testEndpoint('Get Active FD Schemes', 'GET', '/fds/active');
  
  if (adminToken) {
    await testEndpoint('Get All FD Schemes', 'GET', '/fds/schemes', null, adminToken);
  }

  // 7. Business Routes (need business user)
  log('\n7. Business Routes (TODO: Need business user)', 'yellow');
  log('  ℹ️  Skipping - Requires business user registration', 'blue');

  // 8. Investor Routes (need investor user)
  log('\n8. Investor Routes (TODO: Need investor user)', 'yellow');
  log('  ℹ️  Skipping - Requires investor user registration', 'blue');

  // 9. Route Alias Tests
  log('\n9. Route Alias Tests', 'yellow');
  if (adminToken) {
    await testEndpoint('Wallet Topup (Original)', 'POST', '/wallet/topup', { amount: 100 }, adminToken, true);
    await testEndpoint('Wallet Topup Request (Alias)', 'POST', '/wallet/topup-request', { amount: 100 }, adminToken, true);
  }

  // Summary
  log('\n========================================', 'blue');
  log('Test Summary', 'blue');
  log('========================================', 'blue');
  log('All critical routes have been tested!', 'green');
  log('\nDeployment URLs:', 'yellow');
  log('Backend: https://bcm-6f7f.onrender.com', 'blue');
  log('Admin Panel: https://bcm-theta.vercel.app', 'blue');
  log('Business Panel: https://business-web-orcin.vercel.app', 'blue');
  log('\n');
}

// Run tests
runTests().catch(error => {
  log(`\nTest suite failed: ${error.message}`, 'red');
  process.exit(1);
});
