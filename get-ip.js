const os = require('os');
const interfaces = os.networkInterfaces();
for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
        // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        if (interface.family === 'IPv4' && !interface.internal) {
            console.log(interface.address);
        }
    }
}
