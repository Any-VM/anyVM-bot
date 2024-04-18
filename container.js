#!/usr/bin/env node
const { exec } = require('child_process');
const { execSync } = require('child_process');
const account = process.env.ACCOUNT;
const password = process.env.PASSWORD;
const passwd = process.env.PASSWD

const allowList = /^[a-zA-Z0-9-]+$/;
const blockList = ['wall', 'rm', 'su']; 

function validateInput(input) {
    const inputLower = input.toLowerCase();
    if (input.length > 10 || !allowList.test(input) || blockList.some(blockedWord => inputLower.includes(blockedWord.toLowerCase()))) {
        return false;
    }
    return true;
}

if (!validateInput(username)) {
    console.error('Invalid username or password. They should not be longer than 10 characters and should only contain alphanumeric characters and hyphens, and should not contain blocked words.');
    process.exit(1);
}

try {
    exec(``, (error, stdout, stderr) => {
        console.log('Checking if user exists...');
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (stdout) {
            console.log('Container already exists!');
//            process.exit(1); // pretty sure this will only restart the bot
        } else {
            console.log('Container does not exist, creating the container...');

            addUser();
        }
    });
} catch (error) {
    console.error(`exec error: ${error}`);
}

// i think we can just create a special user and give it a group which is
// defined in `/etc/sudoers` (edit the file with `visudo`). something like `bot`
// should work perfectly fine.
function addContainer() {
    try {
        execSync(`echo ${passwd} | sudo -S su node -c "sudo useradd -m -s /bin/bash ${account}"`);
        console.log('Container created successfully!');
        console.log(account)
    } catch (error) {
        console.error(`container creation error: ${error}`);
        return;
    }

    try {
        execSync(`echo ${passwd} | sudo -S usermod -aG nonsudoers ${account}`);
        console.log('User added to sudo group successfully!');
    } catch (error) {
        console.error(`exec error: ${error}`);
        return;
    }

    try {
        execSync(`echo ${passwd} | sudo -S su node -c "echo -e '${password}\n${password}' | sudo passwd ${account}"`);
        console.log('Password set successfully!');
    } catch (error) {
        console.error(`passwd error: ${error}`);
        return;
    }
    
}