#!/usr/bin/env node - 

const https = require('https');
const { exec } = require('child_process');
require('dotenv').config();
const URI = process.env.ANNOUNCEMENT_WEBHOOK;
const version = "1.1";

function printhelp() {
    console.log("Usage: announcement.js <flags> <message, must be in \"quotes\">");
    console.log("Options:");
    console.log(" -h    Show all flags, aka this menu");
    console.log(" -v    Print version to console");
    console.log(" -n    Do not send to wall");
    console.log(" -c    Do not send to wall or webhook, print to console");
}

function postToWebhook(message) {
    const data = JSON.stringify({ content: message });
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(URI, options, (res) => {
        console.log(`Webhook response: ${res.statusCode}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`Response body: ${chunk}`);
        });
    });

    req.on('error', (e) => {
        console.error(`Error posting to webhook: ${e}`);
    });

    req.write(data);
    req.end();
}

function postToWall(message) {
    exec(`wall "${message}"`, (error, stdout, stderr) => {
        if (error) {
            console.error("Error posting to wall:", error);
            return;
        }
        if (stderr) {
            console.error("Error posting to wall:", stderr);
            return;
        }
        console.log(stdout);
    });
}

if (process.argv.length === 2 || process.argv[2] === "-h") {
    printhelp();
} else if (process.argv[2] === "-v") {
    console.log(version);
} else if (process.argv[2] === "-c") {
    console.log(process.argv.slice(3).join(' '));
} else if (process.argv[2] === "-n") {
    const message = process.argv.slice(3).join(' ');
    postToWebhook(message);
} else {
    const message = process.argv.slice(2).join(' ');
    postToWebhook(message);
    postToWall(message);
}
