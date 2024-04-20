#!/usr/bin/env node
const { exec } = require('child_process');
const { execSync } = require('child_process');
const container = process.env.CONTAINER;
const password = process.env.PASSWORD;
const passwd = process.env.PASSWD;

var distro = "debian";

const allowList = /^[a-zA-Z0-9-]+$/;
const blockList = ['wall', 'rm', 'su']; 

function validateInput(input) {
    const inputLower = input.toLowerCase();
    if (input.length > 10 || !allowList.test(input) || blockList.some(blockedWord => inputLower.includes(blockedWord.toLowerCase()))) {
        return false;
    }
    return true;
}

if (!validateInput(password)) {
    console.error('Invalid password. They should not be longer than 10 characters and should only contain alphanumeric characters and hyphens, and should not contain blocked words.');
}

try {
    exec(`ssh root@192.168.1.23 pveum user add ${account}`, (error, stdout, stderr) => {
        console.log('Checking if user exists...');
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (stdout) {
            console.log('User already exists!');
        } else {
            console.log('User does not exist, creating the user...');
            createUser();
        }
    });
} catch (error) {
    console.error(`exec error: ${error}`);
}

// i think we can just use a container which will be for hosting the bot,
// then ssh into the host via the bot's container with some
// ssh keys. easy as fuck, right?
function createContainer() {
    try {
        execSync(`ssh root@192.168.1.23 sudo lxc-create -n ${containerName} `);
        console.log('Container created successfully!');
        console.log(container)
    } catch (error) {
        console.error(`Container creation error: ${error}`);
        return;
    }
}