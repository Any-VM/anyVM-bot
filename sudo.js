#!/usr/bin/env node
const { exec } = require('child_process');
const { execSync } = require('child_process');
const { error } = require('console');
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


// Check if user already exists

try {
    exec(`grep '^${account}:' /etc/passwd`, (error, stdout, stderr) => {
       
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (stdout) {
            console.log('User already exists!');
            try {
                execSync(`echo ${passwd}  | sudo -S usermod -aG sudo ${account}`);
                console.log('User added to sudo group successfully!');
            } catch (error) {
                console.error(`exec error: ${error}`);
                return;
            }
return;
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
        execSync(`echo ${passwd}  | sudo -S su node -c "sudo useradd -m ${account}"`); 
        console.log('User added successfully!');
    } catch (error) {
        console.error(`useradd error: ${error}`);
        return;
    }
   
    try {
        execSync(`echo ${passwd} | sudo -S usermod -aG sudo ${account}`);
        console.log('User added to sudo group successfully!');
    } catch (error) {
        console.error(`exec error: ${error}`);
        return;
    }

    try {
        execSync(`echo ${passwd}  | sudo -S su node -c "echo -e '${password}\n${password}' | sudo passwd ${account}"`);
        console.log('Password set successfully!');
    } catch (error) {
        console.error(`passwd error: ${error}`);
        return;
    }
    console.log(`Password: ${password}`);
    console.log(`Account: ${account}`);
}
