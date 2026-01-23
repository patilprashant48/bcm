const https = require('https');

const options = {
    hostname: 'bcm-6f7f.onrender.com',
    path: '/api/admin/projects?status=NEW',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTMiLCJlbWFpbCI6ImFkbWluQGJjbS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3Mzc1NTI4NjAsImV4cCI6MTczODE1NzY2MH0.xxx' // Replace with actual token
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);

        try {
            const json = JSON.parse(data);
            console.log('\nParsed Response:');
            console.log('Success:', json.success);
            console.log('Projects Count:', json.projects?.length || 0);
            if (json.projects && json.projects.length > 0) {
                console.log('\nFirst Project:');
                console.log(JSON.stringify(json.projects[0], null, 2));
            }
        } catch (e) {
            console.log('Failed to parse JSON:', e.message);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.end();

console.log('Testing admin projects endpoint...');
console.log('URL: https://bcm-6f7f.onrender.com/api/admin/projects?status=NEW\n');
