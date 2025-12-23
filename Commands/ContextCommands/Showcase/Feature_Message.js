import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, ComponentType } from 'discord-api-types/v10';
import { API, MessageFlags } from '@discordjs/core';

import { MessagePrivacyLevel, SystemMessageTypes } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { Blocklist, GuildConfig, UserConfig } from '../../../Mongoose/Models.js';
import { calculateMillisecondsFromDuration } from '../../../Utility/utilityMethods.js';


export const ContextCommand = {
    /** Command's Name, supports both upper- and lower-case, and spaces
     * @type {String}
     */
    name: "Feature Message",

    /** Command's Description
     * @type {String}
     */
    description: "Manually feature a message or announcement onto your Server's HomeCord webpage",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Manually feature a message or announcement onto your Server\'s HomeCord webpage',
        'en-US': 'Manually feature a message or announcement onto your Server\'s HomeCord webpage'
    },

    /** Type of Context Command
     * @type {ApplicationCommandType}
     */
    commandType: ApplicationCommandType.Message,

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 8,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    // In either "subcommandName" or "groupName_subcommandName" formats
    subcommandCooldown: {
        "exampleName": 3
    },
    

    /** Get the Command's data in a format able to be registered with via Discord's API
     * @returns {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody}
     */
    getRegisterData() {
        /** @type {import('discord-api-types/v10').RESTPostAPIApplicationCommandsJSONBody} */
        const CommandData = {};

        CommandData.name = this.name;
        CommandData.description = "";
        CommandData.type = this.commandType;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];
        // Default Permissions
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageMessages); // Using MANAGE_MESSAGES over PIN_MESSAGES permission as I want to limit this to moderators by default. Some Servers may grant PIN_MESSAGES to non-mods!

        return CommandData;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIContextMenuGuildInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeCommand(interaction, api, interactionUser) {
        // Grab message ID this was used on, so we can pass it via Custom IDs
        let sourceMessageId = interaction.data.target_id;
        /** @type {import('discord-api-types/v10').APIMessage} */
        let sourceMessage = interaction.data.resolved.messages[sourceMessageId];


        // ******* Validate Message
        if ( sourceMessage.author.bot || sourceMessage.author.system || sourceMessage.webhook_id != undefined || SystemMessageTypes.includes(sourceMessage.type) ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_INVALID_MESSAGE_TYPE')
            });
            return;
        }

        // If Message uses Components v2, reject due to webpage dependancy not supporting those yet
        if ( sourceMessage.flags != undefined && ((sourceMessage.flags & MessageFlags.IsComponentsV2) == MessageFlags.IsComponentsV2) ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_COMPONENTS_V2')
            });
            return;
        }

        // Ensure HomeCord is enabled for this Server, AND that the Server has enabled HomeCord's Message Activity module
        let fetchedGuildConfig = await GuildConfig.findOne({ guild_id: interaction.guild_id });
        if ( fetchedGuildConfig == null ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_NO_SERVER_SETTINGS_FOUND')
            });
            return;
        }

        if ( fetchedGuildConfig.is_homecord_enabled === false ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_HOMECORD_IS_DISABLED')
            });
            return;
        }

        // Block Forwards for the time being
        if ( sourceMessage.message_snapshots != undefined ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_FORWARDS_NOT_SUPPORTED')
            });
            return;
        }

        // Is message too old to showcase?
        if ( (Date.now() - Date.parse(sourceMessage.timestamp)) > calculateMillisecondsFromDuration('SEVEN_DAYS') ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_TOO_OLD')
            });
            return;
        }

        // Make sure Message's author allows showcasing their messages
        let authorPreferences = await UserConfig.findOne({ user_id: sourceMessage.author.id });
        if ( authorPreferences == null || authorPreferences?.message_privacy === MessagePrivacyLevel.Private ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_AUTHOR_PRIVACY_BLOCKS_FEATURING')
            });
            return;
        }

        // Is this message sent in a channel or category that is blocked
        let sourceChannel = await api.channels.get(sourceMessage.channel_id);
        let blocklistChannelFilter = [ { item_id: sourceMessage.channel_id } ];
        if ( sourceChannel.parent_id != null ) { blocklistChannelFilter.push({ item_id: sourceChannel.parent_id }); }
        if ( await Blocklist.exists({ guild_id: interaction.guild_id, $or: blocklistChannelFilter }) != null ) {
            await api.interactions.reply(interaction.id, interaction.token, {
                flags: MessageFlags.Ephemeral,
                content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_CHANNEL_BLOCKED')
            });
            return;
        }

        // Is message sent by a user with a blocked role
        let authorMember = await api.guilds.getMember(interaction.guild_id, sourceMessage.author.id);
        if ( authorMember.roles.length > 0 ) {
            let blocklistRoleFilter = [];
            authorMember.roles.forEach(role => {
                // Filter out atEveryone
                if ( role !== interaction.guild_id ) { blocklistRoleFilter.push({ item_id: role }); }
            });

            if ( await Blocklist.exists({ guild_id: interaction.guild_id, $or: blocklistRoleFilter }) != null ) {
                await api.interactions.reply(interaction.id, interaction.token, {
                flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_ROLE_BLOCKED')
                });
                return;
            }
        }


        
        
        // Ok, NOW we can ask for if to feature as a message or as an announcement, and for how long!
        /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
        let responseModal = {
            "custom_id": `feature-message_${sourceMessageId}`,
            "title": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_TITLE'),
            "components": [{
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_MESSAGE_TYPE_LABEL'),
                "description": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_MESSAGE_TYPE_DESCRIPTION'),
                "component": {
                    "type": ComponentType.StringSelect,
                    "custom_id": `message-type`,
                    "required": true,
                    "min_values": 1,
                    "max_values": 1,
                    "options": [{
                        "value": `STANDARD`,
                        "label": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_MESSAGE_TYPE_OPTION_STANDARD'),
                        "emoji": { id: null, name: "💬" }
                    }, {
                        "value": `ANNOUNCEMENT`,
                        "label": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_MESSAGE_TYPE_OPTION_ANNOUNCEMENT'),
                        "emoji": { id: null, name: `📣` }
                    }]
                }
            }, {
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_DURATION_LABEL'),
                "description": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_DURATION_DESCRIPTION'),
                "component": {
                    "type": ComponentType.StringSelect,
                    "custom_id": `duration`,
                    "required": true,
                    "min_values": 1,
                    "max_values": 1,
                    "options": [{
                        "value": `TWELVE_HOURS`,
                        "label": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_DURATION_OPTION_TWELVE_HOURS')
                    }, {
                        "value": `ONE_DAY`,
                        "label": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_DURATION_OPTION_ONE_DAY')
                    }, {
                        "value": `THREE_DAYS`,
                        "label": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_DURATION_OPTION_THREE_DAYS')
                    }, {
                        "value": `SEVEN_DAYS`,
                        "label": localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_MODAL_DURATION_OPTION_SEVEN_DAYS')
                    }]
                }
            }]
        };

        // ACK
        await api.interactions.createModal(interaction.id, interaction.token, responseModal);

        return;
    }
}
