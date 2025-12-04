import { GatewayDispatchEvents, PresenceUpdateStatus } from '@discordjs/core';
import { ChannelType, InteractionType, MessageType } from 'discord-api-types/v10';
import { isChatInputApplicationCommandInteraction, isContextMenuApplicationCommandInteraction, isMessageComponentButtonInteraction, isMessageComponentSelectMenuInteraction } from 'discord-api-types/utils';
import * as fs from 'node:fs';
import * as Mongoose from 'mongoose';

import { ActivityLevel, DiscordClient, SystemMessageTypes, UtilityCollections } from './Utility/utilityConstants.js';
import { handleSlashCommand } from './Handlers/Commands/slashCommandHandler.js';
import { handleContextCommand } from './Handlers/Commands/contextCommandHandler.js';
import { handleButton } from './Handlers/Interactions/buttonHandler.js';
import { handleSelect } from './Handlers/Interactions/selectHandler.js';
import { handleAutocomplete } from './Handlers/Interactions/autocompleteHandler.js';
import { handleModal } from './Handlers/Interactions/modalHandler.js';
import { GuildConfig } from './Mongoose/Models.js';
import { processMessageInThread, processMessageReaction, processMessageReply } from './Handlers/Events/messageEvents.js';
import { processScheduledEventUserAdd } from './Handlers/Events/scheduledEventsEvents.js';










// *******************************
//  Bring in files for Commands & Interactions

// Slash Commands
const SlashFolders = fs.readdirSync('./Commands/SlashCommands');

for ( const Folder of SlashFolders ) {
    const SlashCommandFiles = fs.readdirSync(`./Commands/SlashCommands/${Folder}`).filter(file => file.endsWith(".js"));

    for ( const File of SlashCommandFiles ) {
        const TempFile = await import(`./Commands/SlashCommands/${Folder}/${File}`);
        if ( 'executeCommand' in TempFile.SlashCommand && 'getRegisterData' in TempFile.SlashCommand ) { UtilityCollections.SlashCommands.set(TempFile.SlashCommand.name, TempFile.SlashCommand); }
        else { console.warn(`[WARNING] The Slash Command at ./Commands/SlashCommands/${Folder}/${File} is missing required "executeCommand" or "getRegisterData" methods.`); }
    }
}

// Context Commands
const ContextFolders = fs.readdirSync(`./Commands/ContextCommands`);

for ( const Folder of ContextFolders ) {
    const ContextCommandFiles = fs.readdirSync(`./Commands/ContextCommands/${Folder}`).filter(file => file.endsWith(".js"));

    for ( const File of ContextCommandFiles ) {
        const TempFile = await import(`./Commands/ContextCommands/${Folder}/${File}`);
        if ( 'executeCommand' in TempFile.ContextCommand && 'getRegisterData' in TempFile.ContextCommand ) { UtilityCollections.ContextCommands.set(TempFile.ContextCommand.name, TempFile.ContextCommand); }
        else { console.warn(`[WARNING] The Context Command at ./Commands/ContextCommands/${Folder}/${File} is missing required "executeCommand" or "getRegisterData" methods.`); }
    }
}

// Buttons
const ButtonFolders = fs.readdirSync(`./Interactions/Buttons`);

for ( const Folder of ButtonFolders ) {
    const ButtonFiles = fs.readdirSync(`./Interactions/Buttons/${Folder}`).filter(file => file.endsWith(".js"));

    for ( const File of ButtonFiles ) {
        const TempFile = await import(`./Interactions/Buttons/${Folder}/${File}`);
        if ( 'executeButton' in TempFile.Button ) { UtilityCollections.Buttons.set(TempFile.Button.name, TempFile.Button); }
        else { console.warn(`[WARNING] The Button at ./Interactions/Buttons/${Folder}/${File} is missing required "executeButton" method.`); }
    }
}

// Selects
const SelectFolders = fs.readdirSync(`./Interactions/Selects`);

for ( const Folder of SelectFolders ) {
    const SelectFiles = fs.readdirSync(`./Interactions/Selects/${Folder}`).filter(file => file.endsWith(".js"));

    for ( const File of SelectFiles ) {
        const TempFile = await import(`./Interactions/Selects/${Folder}/${File}`);
        if ( 'executeSelect' in TempFile.Select ) { UtilityCollections.Selects.set(TempFile.Select.name, TempFile.Select); }
        else { console.warn(`[WARNING] The Select at ./Interactions/Selects/${Folder}/${File} is missing required "executeSelect" method.`); }
    }
}

// Modals
const ModalFolders = fs.readdirSync(`./Interactions/Modals`);

for ( const Folder of ModalFolders ) {
    const ModalFiles = fs.readdirSync(`./Interactions/Modals/${Folder}`).filter(file => file.endsWith(".js"));

    for ( const File of ModalFiles ) {
        const TempFile = await import(`./Interactions/Modals/${Folder}/${File}`);
        if ( 'executeModal' in TempFile.Modal ) { UtilityCollections.Modals.set(TempFile.Modal.name, TempFile.Modal); }
        else { console.warn(`[WARNING] The Modal at ./Interactions/Modals/${Folder}/${File} is missing required "executeModal" method.`); }
    }
}









// *******************************
//  Discord Ready Event
DiscordClient.once(GatewayDispatchEvents.Ready, async () => {
    // Set status
    await DiscordClient.updatePresence(0, { status: PresenceUpdateStatus.Online });

    console.log(`Online & Ready!`);
});









// *******************************
//  Debugging and Error Logging
process.on('warning', console.warn);
process.on('unhandledRejection', console.error);
DiscordClient.on(GatewayDispatchEvents.RateLimited, console.warn);









// *******************************
//  Discord Message Create Event
DiscordClient.on(GatewayDispatchEvents.MessageCreate, async ({ data: message, api }) => {
    // Bots/Apps
    if ( message.author.bot ) { return; }

    // System Messages
    if ( message.author.system || SystemMessageTypes.includes(message.type) ) { return; }

    // No need to filter out messages from DMs since that can be controlled via the Intents system!
    // Can't even check that anyways without an API call since Discord's API doesn't provide even a partial Channel object with Messages

    // Wish I could also add a safe-guard check for guild.avaliable BUT DISCORD'S API DOESN'T PROVIDE EVEN A PARTIAL GUILD OBJECT WITH MESSAGES EITHER :upside_down:

    // Fetch current Config to see if Message/Thread Activity is enabled
    let fetchedGuildConfig = await GuildConfig.findOne({ guild_id: message.guild_id });
    // Edge-case check
    if ( fetchedGuildConfig == null ) { return; }
    if ( fetchedGuildConfig.is_homecord_enabled === false ) { return; }

    let fetchedSourceChannel = await api.channels.get(message.channel_id);

    // If Message is a direct reply AND message highlighting is enabled
    if ( fetchedGuildConfig.message_activity_level !== ActivityLevel.Disabled && message.type === MessageType.Reply ) {
        await processMessageReply(api, message, fetchedSourceChannel);
    }


    // If Message is sent in a Public/News Thread, AND Thread highlighting is enabled
    // Annoyingly, I have to fetch the Channel to see its typing. :c
    if ( fetchedGuildConfig.thread_activity_level !== ActivityLevel.Disabled && (fetchedSourceChannel.type === ChannelType.PublicThread || fetchedSourceChannel.type === ChannelType.AnnouncementThread) ) {
        await processMessageInThread(api, message, fetchedSourceChannel);
    }

    return;
});









// *******************************
//  Discord Interaction Create Event
DiscordClient.on(GatewayDispatchEvents.InteractionCreate, async ({ data: interaction, api }) => {
    // Slash Commands
    if ( isChatInputApplicationCommandInteraction(interaction) ) { await handleSlashCommand(interaction, api); }
    // Context Commands
    else if ( isContextMenuApplicationCommandInteraction(interaction) ) { await handleContextCommand(interaction, api); }
    // Buttons
    else if ( isMessageComponentButtonInteraction(interaction) ) { await handleButton(interaction, api); }
    // Selects
    else if ( isMessageComponentSelectMenuInteraction(interaction) ) { await handleSelect(interaction, api); }
    // Autocomplete
    else if ( interaction.type === InteractionType.ApplicationCommandAutocomplete ) { await handleAutocomplete(interaction, api); }
    // Modals
    else if ( interaction.type === InteractionType.ModalSubmit ) { await handleModal(interaction, api); }
    // Others
    else { console.info(`****Unrecognised or new unhandled Interaction Type triggered: ${interaction.type}`); }

    return;
});









// *******************************
//  Discord Guild Create Event
DiscordClient.on(GatewayDispatchEvents.GuildCreate, async ({ data: guildData, api }) => {
    // Make sure we are only handling this if it's triggered due to adding the App to a Guild, NOT due to an outage or anything like that!
    let now = Date.now();
    let timeSinceJoin = now - Date.parse(guildData.joined_at);
    if ( timeSinceJoin > 600000 ) { return; } // Not a new join

    if ( guildData.unavailable ) { return; } // Guild Data unavailable due to Discord API outage


    // Setup Database entry
    try {
        await GuildConfig.create({
            guild_id: guildData.id
        });
    }
    catch (err) {
        console.error(err);
    }

    return;
});









// *******************************
//  Discord Guild Delete Event
DiscordClient.on(GatewayDispatchEvents.GuildDelete, async ({ data: guildData, api }) => {
    // Make sure we are only handling this if it's triggered due to the App being removed from the Guild, NOT due to an outage or anything like that!
    if ( guildData.unavailable ) { return; }


    // Remove data
    try {
        await GuildConfig.deleteOne({ guild_id: guildData.id });
    }
    catch (err) {
        console.error(err);
    }

    return;
});









// *******************************
//  Discord Message Reaction Add Event
DiscordClient.on(GatewayDispatchEvents.MessageReactionAdd, async ({ data: reactionData, api }) => {
    // Throw straight into processing method
    await processMessageReaction(api, reactionData);

    return;
});









// *******************************
//  Discord Guild Scheduled Event User Add Event
DiscordClient.on(GatewayDispatchEvents.GuildScheduledEventUserAdd, async ({ data: eventUserAddData, api }) => {
    // Throw straight into processing method
    await processScheduledEventUserAdd(api, eventUserAddData);

    return;
});
