import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits, ComponentType, SeparatorSpacingSize, ButtonStyle } from 'discord-api-types/v10';
import { API, MessageFlags } from '@discordjs/core';
import { GuildConfig } from '../../../Mongoose/Models.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { ActivityLevel, MessagePrivacyLevel } from '../../../Utility/utilityConstants.js';
import { rgbArrayToInteger } from '../../../Utility/utilityMethods.js';


export const SlashCommand = {
    /** Command's Name, in fulllowercase (can include hyphens)
     * @type {String}
     */
    name: "settings",

    /** Command's Description
     * @type {String}
     */
    description: "View or manage the Server-specific settings for HomeCord",

    /** Command's Localised Descriptions
     * @type {import('discord-api-types/v10').LocalizationMap}
     */
    localizedDescriptions: {
        'en-GB': 'View or manage the Server-specific settings for HomeCord',
        'en-US': 'View or manage the Server-specific settings for HomeCord'
    },

    /** Command's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 8,

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
        // Default Permissions
        CommandData.default_member_permissions = String(PermissionFlagsBits.ManageGuild);

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
        // Safety check to see if there are settings saved. If there isn't SOMETHING WENT WRONG (or HomeCord was added during a Discord API outage)
        if ( await GuildConfig.exists({ guild_id: interaction.guild_id }) == null ) {
            // Quickly create defaults!
            await GuildConfig.create({ guild_id: interaction.guild_id });
        }

        // Fetch current settings to display
        let fetchedSettings = await GuildConfig.findOne({ guild_id: interaction.guild_id });
        // Convert raw value into more UX-friendly values
        let settingIsEnabled = fetchedSettings.is_homecord_enabled ? localize(interaction.locale, 'SETTINGS_IS_ENABLED_TRUE') : localize(interaction.locale, 'SETTINGS_IS_ENABLED_FALSE');
        let settingDefaultPrivacy = fetchedSettings.default_message_privacy === MessagePrivacyLevel.Public ? localize(interaction.locale, 'SETTINGS_DEFAULT_MESSAGE_PRIVACY_PUBLIC')
            : fetchedSettings.default_message_privacy === MessagePrivacyLevel.Anonymous ? localize(interaction.locale, 'SETTINGS_DEFAULT_MESSAGE_PRIVACY_ANONYMOUS')
            : localize(interaction.locale, 'SETTINGS_DEFAULT_MESSAGE_PRIVACY_PRIVATE');
        let settingMessageActivity = fetchedSettings.message_activity_level === ActivityLevel.Disabled ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_DISABLED')
            : fetchedSettings.message_activity_level === ActivityLevel.VeryLow ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_VERY_LOW')
            : fetchedSettings.message_activity_level === ActivityLevel.Low ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_LOW')
            : fetchedSettings.message_activity_level === ActivityLevel.Medium ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_MEDIUM')
            : fetchedSettings.message_activity_level === ActivityLevel.High ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_HIGH')
            : localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_VERY_HIGH');
        let settingEventActivity = fetchedSettings.event_activity_level === ActivityLevel.Disabled ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_DISABLED')
            : fetchedSettings.event_activity_level === ActivityLevel.VeryLow ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_VERY_LOW')
            : fetchedSettings.event_activity_level === ActivityLevel.Low ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_LOW')
            : fetchedSettings.event_activity_level === ActivityLevel.Medium ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_MEDIUM')
            : fetchedSettings.event_activity_level === ActivityLevel.High ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_HIGH')
            : localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_VERY_HIGH');
        let settingThreadActivity = fetchedSettings.thread_activity_level === ActivityLevel.Disabled ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_DISABLED')
            : fetchedSettings.thread_activity_level === ActivityLevel.VeryLow ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_VERY_LOW')
            : fetchedSettings.thread_activity_level === ActivityLevel.Low ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_LOW')
            : fetchedSettings.thread_activity_level === ActivityLevel.Medium ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_MEDIUM')
            : fetchedSettings.thread_activity_level === ActivityLevel.High ? localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_HIGH')
            : localize(interaction.locale, 'SETTINGS_ACTIVITY_LEVEL_VERY_HIGH');
        let settingAllowStarboardReactions = fetchedSettings.allow_starboard_reactions ? localize(interaction.locale, 'SETTINGS_ALLOW_STARBOARD_REACTIONS_ENABLED') : localize(interaction.locale, 'SETTINGS_ALLOW_STARBOARD_REACTIONS_DISABLED');
        let settingGuildInvite = fetchedSettings.guild_invite_code == null ? localize(interaction.locale, 'SETTINGS_GUILD_INVITE_NOT_SET') : `https://discord.gg/${fetchedSettings.guild_invite_code}`;


        // Construct components to display Settings Panel in
        /** @type {import('discord-api-types/v10').APIMessageTopLevelComponent[]} */
        let settingsPanelComponents = [{
            "type": ComponentType.Container,
            "accent_color": rgbArrayToInteger([88, 101, 242]),
            "spoiler": false,
            "components": [{
                // Header
                "type": ComponentType.TextDisplay,
                "content": localize(interaction.locale, 'SETTINGS_PANEL_HEADING')
            }, {
                // Main "Enable for this Server" Setting
                "type": ComponentType.Section,
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": localize(interaction.locale, 'SETTINGS_PANEL_IS_ENABLED_DESCRIPTION', settingIsEnabled)
                }],
                "accessory": {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Secondary,
                    "custom_id": `settings_homecord-toggle_${fetchedSettings.is_homecord_enabled}`,
                    "label": localize(interaction.locale, 'SETTINGS_PANEL_EDIT_BUTTON_LABEL'),
                    "emoji": { "id": null, "name": "⚙" }
                }
            }, {
                "type": ComponentType.Separator,
                "divider": true,
                "spacing": SeparatorSpacingSize.Small
            }, {
                // Default Message Privacy Setting
                "type": ComponentType.Section,
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": localize(interaction.locale, 'SETTINGS_PANEL_MESSAGE_PRIVACY_DESCRIPTION', settingDefaultPrivacy)
                }],
                "accessory": {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Secondary,
                    "custom_id": `settings_default-privacy_${fetchedSettings.default_message_privacy}`,
                    "label": localize(interaction.locale, 'SETTINGS_PANEL_EDIT_BUTTON_LABEL'),
                    "emoji": { "id": null, "name": "⚙" }
                }
            }, {
                // Allow Starboard Reactions Setting
                "type": ComponentType.Section,
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": localize(interaction.locale, 'SETTINGS_PANEL_STARBOARD_REACTIONS_DESCRIPTION', settingAllowStarboardReactions)
                }],
                "accessory": {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Secondary,
                    "custom_id": `settings_starboard-reactions_${fetchedSettings.allow_starboard_reactions}`,
                    "label": localize(interaction.locale, 'SETTINGS_PANEL_EDIT_BUTTON_LABEL'),
                    "emoji": { "id": null, "name": "⚙" }
                }
            }, {
                // Guild Invite Setting
                "type": ComponentType.Section,
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": localize(interaction.locale, 'SETTINGS_PANEL_GUILD_INVITE_DESCRIPTION', settingGuildInvite)
                }],
                "accessory": {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Secondary,
                    "custom_id": `settings_guild-invite_${fetchedSettings.guild_invite_code}`,
                    "label": localize(interaction.locale, 'SETTINGS_PANEL_EDIT_BUTTON_LABEL'),
                    "emoji": { "id": null, "name": "⚙" }
                }
            }, {
                "type": ComponentType.Separator,
                "divider": true,
                "spacing": SeparatorSpacingSize.Small
            }, {
                // Message Activity Setting
                "type": ComponentType.Section,
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": localize(interaction.locale, 'SETTINGS_PANEL_MESSAGE_ACTIVITY_DESCRIPTION', settingMessageActivity)
                }],
                "accessory": {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Secondary,
                    "custom_id": `settings_message-activity_${fetchedSettings.message_activity_level}`,
                    "label": localize(interaction.locale, 'SETTINGS_PANEL_EDIT_BUTTON_LABEL'),
                    "emoji": { "id": null, "name": "⚙" }
                }
            }, {
                // Event Activity Setting
                "type": ComponentType.Section,
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": localize(interaction.locale, 'SETTINGS_PANEL_EVENT_ACTIVITY_DESCRIPTION', settingEventActivity)
                }],
                "accessory": {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Secondary,
                    "custom_id": `settings_event-activity_${fetchedSettings.event_activity_level}`,
                    "label": localize(interaction.locale, 'SETTINGS_PANEL_EDIT_BUTTON_LABEL'),
                    "emoji": { "id": null, "name": "⚙" }
                }
            }, {
                // Thread Activity Setting
                "type": ComponentType.Section,
                "components": [{
                    "type": ComponentType.TextDisplay,
                    "content": localize(interaction.locale, 'SETTINGS_PANEL_THREAD_ACTIVITY_DESCRIPTION', settingThreadActivity)
                }],
                "accessory": {
                    "type": ComponentType.Button,
                    "style": ButtonStyle.Secondary,
                    "custom_id": `settings_thread-activity_${fetchedSettings.thread_activity_level}`,
                    "label": localize(interaction.locale, 'SETTINGS_PANEL_EDIT_BUTTON_LABEL'),
                    "emoji": { "id": null, "name": "⚙" }
                }
            }]
        }];


        await api.interactions.reply(interaction.id, interaction.token, { flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2, components: settingsPanelComponents });

        return;
    }
}
