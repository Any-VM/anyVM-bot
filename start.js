require('dotenv').config();
const compute = require('@google-cloud/compute');
const { Client, GatewayIntentBits, } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
const commands = [
    {
        name: 'startvm',
        description: 'Starts the VM',
    },

];
console.log('bot started')
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const requiredRoleId = '1199740171218866196';
    const projectId = process.env.PROJECT_ID;
    const zone = process.env.ZONE;
    const instanceName = process.env.INSTANCE_NAME;
    const instancesClient = new compute.InstancesClient();
    const operationsClient = new compute.ZoneOperationsClient();
    if (!interaction.member.roles.cache.has(requiredRoleId)) {
        try {
            await interaction.editReply({ content: 'You do not have the required role to use this command.' });
        } catch (error) {
            console.error(`Failed to send reply: ${error}`);
        }
        return;
    }
    if (interaction.commandName === 'startvm') {
        await interaction.deferReply();
        try {
            const projectId = process.env.PROJECT_ID;
            const zone = process.env.ZONE;
            const instanceName = process.env.INSTANCE_NAME;

            const instancesClient = new compute.InstancesClient();

            const [response] = await instancesClient.start({
                project: projectId,
                zone,
                instance: instanceName,
            });
            let operation = response.latestResponse;
            const operationsClient = new compute.ZoneOperationsClient();

            // Wait for the operation to complete.
            while (operation.status !== 'DONE') {
                [operation] = await operationsClient.wait({
                    operation: operation.name,
                    project: projectId,
                    zone: operation.zone.split('/').pop(),
                });
            }

            await interaction.followUp('Instance started.');
        } catch (error) {
            console.error(error);
            await interaction.followUp('Failed to start instance.');
        }
    }
});

client.login(process.env.TOKEN);

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();