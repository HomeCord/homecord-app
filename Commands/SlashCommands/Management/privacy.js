import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, ComponentType } from 'discord-api-types/v10';
import { API } from '@discordjs/core';

import { UserConfig } from '../../../Mongoose/Models.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { MessagePrivacyLevel } from '../../../Utility/utilityConstants.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "privacy",

    /** Command's Description
     * @type {String}
     */
    description: "Manage your privacy settings in HomeCord",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'Manage your privacy settings in HomeCord',
        'en-US': 'Manage your privacy settings in HomeCord'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 6,

    /**
     * Cooldowns for specific Subcommands
     */
    // Where "exampleName" is either the Subcommand's Name, or a combo of both Subcommand Group Name and Subcommand Name
    //  For ease in handling cooldowns, this should also include the root Command name as a prefix
    // In either "rootCommandName_subcommandName" or "rootCommandName_groupName_subcommandName" formats
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
        CommandData.description = this.description;
        CommandData.description_localizations = this.localizedDescriptions;
        CommandData.type = ApplicationCommandType.ChatInput;
        // Integration Types - 0 for GUILD_INSTALL, 1 for USER_INSTALL.
        //  MUST include at least one. 
        CommandData.integration_types = [ ApplicationIntegrationType.GuildInstall ];
        // Contexts - 0 for GUILD, 1 for BOT_DM (DMs with the App), 2 for PRIVATE_CHANNEL (DMs/GDMs that don't include the App).
        //  MUST include at least one. PRIVATE_CHANNEL can only be used if integration_types includes USER_INSTALL
        CommandData.contexts = [ InteractionContextType.Guild ];

        return CommandData;
    },

    /** Handles given Autocomplete Interactions, should this Command use Autocomplete Options
     * @param {import('discord-api-types/v10').APIApplicationCommandAutocompleteInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async handleAutoComplete(interaction, api, interactionUser) {
        await api.interactions.createAutocompleteResponse(interaction.id, interaction.token, { choices: [ {name: "Not implemented yet!", value: "NOT_IMPLEMENTED"} ] });

        return;
    },

    /** Runs the Command
     * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     * @param {String} usedCommandName 
     */
    async executeCommand(interaction, api, interactionUser, usedCommandName) {
        // Fetch current User's privacy setting
        if ( await UserConfig.exists({ user_id: interactionUser.id }) == null ) {
            // Create default since User doesn't already have a saved preference
            await UserConfig.create({ user_id: interactionUser.id });
        }

        let fetchedUserConfig = await UserConfig.findOne({ user_id: interactionUser.id });
        let settingValue = fetchedUserConfig.message_privacy;

        
        // Construct Modal
        /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
        let responseModal = {
            "custom_id": `privacy`,
            "title": localize(interaction.locale, 'PRIVACY_COMMAND_MODAL_TITLE'),
            "components": [{
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.locale, 'PRIVACY_COMMAND_MODAL_DESCRIPTION')
            }, {
                "type": ComponentType.Label,
                "label": localize(interaction.locale, 'PRIVACY_COMMAND_MODAL_SELECT_LABEL'),
                "component": {
                    "type": ComponentType.StringSelect,
                    "custom_id": `new-value`,
                    "required": true,
                    "min_values": 1,
                    "max_values": 1,
                    "options": [{
                        "label": localize(interaction.locale, 'PRIVACY_COMMAND_MODAL_SELECT_OPTION_PUBLIC_LABEL'),
                        "value": MessagePrivacyLevel.Public,
                        "default": settingValue === MessagePrivacyLevel.Public ? true : false
                    }, {
                        "label": localize(interaction.locale, 'PRIVACY_COMMAND_MODAL_SELECT_OPTION_ANONYMOUS_LABEL'),
                        "value": MessagePrivacyLevel.Anonymous,
                        "default": settingValue === MessagePrivacyLevel.Anonymous ? true : false
                    }, {
                        "label": localize(interaction.locale, 'PRIVACY_COMMAND_MODAL_SELECT_OPTION_PRIVATE_LABEL'),
                        "value": MessagePrivacyLevel.Private,
                        "default": settingValue === MessagePrivacyLevel.Private ? true : false
                    }]
                }
            }]
        };

        await api.interactions.createModal(interaction.id, interaction.token, responseModal);

        return;
    }
}
