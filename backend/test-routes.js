// Test if auth routes can be loaded
try {
    console.log('Testing route loading...\n');

    console.log('1. Loading auth.routes.js...');
    const authRoutes = require('./routes/auth.routes');
    console.log('✅ auth.routes loaded successfully');

    console.log('\n2. Loading authController.js...');
    const authController = require('./controllers/authController');
    console.log('✅ authController loaded successfully');

    console.log('\n3. Checking authController.login...');
    if (typeof authController.login === 'function') {
        console.log('✅ login function exists');
    } else {
        console.log('❌ login function missing!');
    }

    console.log('\n✅ All route dependencies loaded successfully!');
    console.log('\nThe issue is likely in production deployment configuration.');

} catch (error) {
    console.error('\n❌ Error loading routes:');
    console.error(error.message);
    console.error('\nFull error:');
    console.error(error);
}
