const { Client, GatewayIntentBits, MessageActionRow, MessageButton, ApplicationCommandOptionType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Command } = require('commander');
const program = new Command();
require('dotenv').config();
const fs = require('fs');
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const path = require('path');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
module.exports = {
    getAccountAndPassword: () => ({ username, newpassword, account, password}),
};


const events = require('events');
const eventEmitter = new events.EventEmitter();
module.exports = eventEmitter;

const commands = [
    {
        name: 'sudo',
        description: 'makes an account with sudo (only admin use)',
        options: [
            {
                name: 'account',                
                description: 'The name of the account',
                type: 3,
                required: true,
                
            },
            {
                name: 'password',                
                description: 'The password of the account',
                type: 3,
                required: true,
            },
            {
                name: 'accountid',                
                description: 'The Discord ID of the user',
                type: 3,
                required: true,
            },
        ],
    },
    {
        name: 'nonsudo',
        description: 'makes your account on the vm',
        options: [
            {
                name: 'account',
                type: 3, 
                description: 'The name of the account',
                required: true,
            },
            {
                name: 'password',
                type: 3, 
                description: 'The password of the account',
                required: true,
            },
        ],
    },

    {
        name: 'chngpasswd',
        description: 'Changes your password',
        options: [
            {
                name: 'newpassword',
                type: 3,
                description: 'New password',
                required: true,
            },
        ],
    },
    {
        name: 'stopvm',
        description: 'Stops the VM',
    },
    {
        name: 'execute',
        description: 'Executes a command',
        options: [
            {
                name: 'command',
                type: 3,
                description: 'The command to execute',
                required: true,
            },
        ],
    },
    {
        name: 'announcement',
        description: 'Announces a message',
        options: [
            {
                name: 'message',
                type: 3,
                description: 'The message to announce',
                required: true,
            },
            
        ],
    }
];

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.log('Caught exception: ', err, 'Exception origin: ', origin);
});
if (!token || !clientId || !guildId) {
    console.error('Missing environment variables. Please ensure that TOKEN, CLIENT_ID, and GUILD_ID are set.');
    process.exit(1);
}

program
    .command('execute')
    .description('Execute a command')
    .action(() => {
        console.log('Command executed!');
    });

client.once('ready', () => {
    console.log('Ready!');
});

const { exec, execSync } = require('child_process');
let account, password;

function readUserIds() {
    if (fs.existsSync('userids.json')) {
        const data = fs.readFileSync('userids.json', 'utf-8');
        return JSON.parse(data);
    } else {
        return {};
    }
}

function writeUserIds(userIds) {
    const data = JSON.stringify(userIds);
    fs.writeFileSync('userids.json', data, 'utf-8');
}

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        process.env.ACCOUNT = interaction.options.getString('account');
        process.env.PASSWORD = interaction.options.getString('password');
        console.log(account);
        eventEmitter.emit('interactionCreated', { account, password,});
        console.log('Emitting interactionCreated event');
        if (interaction.commandName === 'sudo') {
            const requiredRoleId = process.env.ROLE_ID;
            let discID = interaction.options.getString('accountid');
            discID = discID.replace(/<@!?(\d+)>/, '$1'); 
            await interaction.deferReply({ ephemeral: true });
            if (!interaction.member.roles.cache.has(requiredRoleId)) {
                try {
                    await interaction.editReply({ content: 'You do not have the required role to use this command.' });
                } catch (error) {
                    console.error(`Failed to send reply: ${error}`);
                }
                return;
            }
        
            console.log('Running sudo.js');
            exec(`node sudo.js ${process.env.ACCOUNT} ${process.env.PASSWORD}`, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                await interaction.followUp({ content: `sudo.js script executed! Output: ${stdout}`, ephemeral: true });
        
                
                let userIds;
                try {
                    userIds = JSON.parse(fs.readFileSync('userids.json', 'utf-8'));
                } catch (error) {
                    
                    userIds = {};
                }
        
                
                userIds[discID] = process.env.ACCOUNT; 
        
                
                writeUserIds(userIds);
            });
        }
        }  if (interaction.commandName === 'nonsudo') {        
            const userIds = readUserIds();
            process.env.ACCOUNT = interaction.options.getString('account');
            process.env.PASSWORD = interaction.options.getString('password');
            const discordId = interaction.user.id; 
            if (Object.keys(userIds).includes(discordId)) {
                await interaction.reply({ content: 'You can only use the nonsudo command once.', ephemeral: true });
                return;
            }
        
            console.log(process.env.ACCOUNT);
        
            await interaction.deferReply({ ephemeral: true });
            exec(`node nonsudo.js ${process.env.ACCOUNT} ${process.env.PASSWORD}`, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                await interaction.followUp({ content: `nonsudo.js script executed! Output: ${stdout}`, ephemeral: true });
        
                userIds[discordId] = process.env.ACCOUNT; 
        
                writeUserIds(userIds);
            });
        }
        else if (interaction.commandName === 'chngpasswd') {
            process.env.NEWPASSWORD = interaction.options.getString('newpassword');
            const discordId = interaction.user.id;
            const userids = JSON.parse(fs.readFileSync(path.join(__dirname, 'userids.json'), 'utf-8'));
    
            await interaction.deferReply({ ephemeral: true });
        
            username = userids[discordId];            
            if (!username) {
                await interaction.followUp({ content: 'No account associated with your Discord ID.', ephemeral: true });
                return;
            }

        try {
            exec(`node chngpasswd.js ${username} ${process.env.NEWPASSWORD }`);
            
        } catch (error) {
            console.error(`chngpasswd.js error: ${error}`);
            await interaction.followUp({ content: 'Failed to change password.', ephemeral: true });
        }
        await interaction.followUp({ content: 'Password changed successfully!', ephemeral: true });
    }else if (interaction.commandName === 'stopvm') {
        await interaction.deferReply();
        const requiredRoleId = process.env.ROLE_ID;
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            try {
                await interaction.editReply({ content: 'You do not have the required role to use this command.' });
                
            } catch (error) {
                console.error(`Failed to send reply: ${error}`);
            } 
            return;
        }
            try {
                const { stdout, stderr } = execSync(`echo Skull0987$ | sudo -S /usr/sbin/shutdown -h now`, { stdio: 'pipe' });
                interaction.followUp({ content: `Command executed: /usr/sbin/shutdown -h +1\nOutput: ${stdout}\nError: ${stderr}`, ephemeral: false });
            } catch (error) {
                console.error(`exec error: ${error}`);
                interaction.followUp({ content: `An error occurred while executing the command: ${error.message}`, ephemeral: false });
                return;
            }
            await interaction.followUp({ content: 'vm will stop now', ephemeral: false });
            return;
    
    }
    else if (interaction.commandName === 'execute') {
        const requiredRoleId = process.env.ROLE_ID;
        const command = interaction.options.getString('command');
        await interaction.deferReply();
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            try {
                await interaction.editReply({ content: 'You do not have the required role to use this command.' });
            } catch (error) {
                console.error(`Failed to send reply: ${error}`);
            }
            return;
        }
        try {
            const stdout = execSync(`echo Skull0987$ | sudo -S ${command}`);
            const output = stdout.toString(); 
            console.log(`stdout: ${output}`);
            interaction.followUp({ content: `Command executed: ${command}\nOutput: ${output}`, ephemeral: true });
            return;
        } catch (error) {
            console.error(`exec error: ${error}`);
            interaction.followUp({ content: `An error occurred while executing the command: ${error.message}`, ephemeral: true });
            return;
        }
    }
    else if (interaction.commandName === 'announcement') {
        const requiredRoleId = process.env.ROLE_ID;
        const message = interaction.options.getString('message');
        await interaction.deferReply();
        if (interaction.member.roles.cache.has(requiredRoleId)) {
            exec(`echo Skull0987$ | sudo -S node announcement.js -n ${message}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                interaction.followUp({ content: `Announcement made! Output: ${stdout}`, ephemeral: true });
            });
        } else {
            interaction.followUp({ content: "You don't have the required role to run this command.", ephemeral: true });
        }
    }
});
client.login(token);

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

})();
