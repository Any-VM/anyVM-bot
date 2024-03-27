#!/usr/bin/env node
const { getAccountAndPassword } = require('./server.js');
const username = process.argv[2];
const newpassword = process.env.NEWPASSWORD;
const { execSync } = require('child_process');
console.log('Changing password...');
try {
    execSync(`echo ${passwd} | sudo -S bash -c 'echo "${username}:${newpassword}" | chpasswd'`);
    console.log('Password changed successfully!');
} catch (error) {
    console.error(`chpasswd error: ${error}`);
}