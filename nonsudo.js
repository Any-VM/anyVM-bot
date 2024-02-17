#!/usr/bin/env node
const { exec } = require('child_process');
const { execSync } = require('child_process');
const account = process.env.ACCOUNT;
const password = process.env.PASSWORD;


const allowList = /^[a-zA-Z0-9-]+$/;
const blockList = ['wall', 'rm', 'su']; 

function validateInput(input) {
    const inputLower = input.toLowerCase();
    if (input.length > 10 || !allowList.test(input) || blockList.some(blockedWord => inputLower.includes(blockedWord.toLowerCase()))) {
        return false;
    }
    return true;
}

if (!validateInput(account)) {
    console.error('Invalid account or password. They should not be longer than 10 characters and should only contain alphanumeric characters and hyphens, and should not contain blocked words.');
    process.exit(1);
}

try {
    exec(`grep '^${account}:' /etc/passwd`, (error, stdout, stderr) => {
        console.log('Checking if user exists...');
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (stdout) {
            console.log('User already exists!');
            process.exit(1);
        } else {
            console.log('User does not exist, adding user...');

            addUser();
        }
    });
} catch (error) {
    console.error(`exec error: ${error}`);
}

function addUser() {
 

    try {
        execSync(`echo Skull0987$ | sudo -S su node -c "sudo useradd -m -s /bin/bash ${account}"`);
        console.log('User added successfully!');
        console.log(account)
    } catch (error) {
        console.error(`useradd error: ${error}`);
        return;
    }

    try {
        execSync(`echo Skull0987$ | sudo -S usermod -aG nonsudoers ${account}`);
        console.log('User added to sudo group successfully!');
    } catch (error) {
        console.error(`exec error: ${error}`);
        return;
    }

    try {
        execSync(`echo Skull0987$ | sudo -S su node -c "echo -e '${password}\n${password}' | sudo passwd ${account}"`);
        console.log('Password set successfully!');
    } catch (error) {
        console.error(`passwd error: ${error}`);
        return;
    }
    
}