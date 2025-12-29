import { API } from '@discordjs/core';
import { ButtonStyle, ComponentType, MessageFlags, SeparatorSpacingSize } from 'discord-api-types/v10';

import { GuildConfig } from '../../../Mongoose/Models.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { rgbArrayToInteger } from '../../../Utility/utilityMethods.js';
import { ActivityLevel, MessagePrivacyLevel, RegExPatterns } from '../../../Utility/utilityConstants.js';
import { DISCORD_APP_USER_ID, DISCORD_TOKEN } from '../../../config.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "settings",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles submitted new Server-specific settings",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, api, interactionUser) {
        // Grab which setting was edited
        let splitCustomId = interaction.data.custom_id.split("_");
        /** @type {'homecord-toggle'|'default-privacy'|'starboard-reactions'|'message-activity'|'event-activity'|'thread-activity'} */
        let passedSettingName = splitCustomId.pop();
        // Grab inputted new value
        const ModalComponents = interaction.data.components;
        let inputNewValue = ModalComponents[1].component.type === ComponentType.TextInput ? ModalComponents[1].component.value : ModalComponents[1].component.values.shift();


        // Edit the correct value in the Database Entry
        if ( passedSettingName === 'homecord-toggle' ) {
            let castValue = inputNewValue === 'ENABLE' ? true : false;
            // Edit Database
            await GuildConfig.updateOne({ guild_id: interaction.guild_id }, { is_homecord_enabled: castValue })
            .then(async () => {
                // ACK
                await updateSettingsPanel(interaction, api);
                return;
            })
            .catch(async (err) => {
                console.error(err);
            });
        }
        else if ( passedSettingName === 'default-privacy' ) {
            // Edit Database
            await GuildConfig.updateOne({ guild_id: interaction.guild_id }, { default_message_privacy: inputNewValue })
            .then(async () => {
                // ACK
                await updateSettingsPanel(interaction, api);
                return;
            })
            .catch(async (err) => {
                console.error(err);
            });
        }
        else if ( passedSettingName === 'starboard-reactions' ) {
            let castValue = inputNewValue === 'ENABLE' ? true : false;
            // Edit Database
            await GuildConfig.updateOne({ guild_id: interaction.guild_id }, { allow_starboard_reactions: castValue })
            .then(async () => {
                // ACK
                await updateSettingsPanel(interaction, api);
                return;
            })
            .catch(async (err) => {
                console.error(err);
            });
        }
        else if ( passedSettingName === 'guild-invite' ) {
            // Validate that inputted string *is* a Discord Invite to a Guild
            if ( RegExPatterns.DiscordInvite.test(inputNewValue) ) {
                let inviteCode = RegExPatterns.DiscordInvite.exec(inputNewValue)?.[1] ?? inputNewValue;

                // Now validate that the invite is to *this* specific Discord Guild
                let fetchInvite = await fetch(`https://discord.com/api/v10/invites/${inviteCode}`, {
                    headers: {
                        'Authorization': `Bot ${DISCORD_TOKEN}`,
                        'content-type': 'application/json'
                    },
                    method: 'GET'
                });

                if ( fetchInvite.status === 200 ) {
                    /** @type {import('discord-api-types/v10').APIInvite} */
                    let resolveInviteData = await fetchInvite.json();

                    if ( resolveInviteData.guild_id == null ) {
                        // Invite is NOT for a Guild (it's a GroupDM or Friend invite instead)
                        await updateSettingsPanel(interaction, api, 'INVITE_NOT_FOR_GUILD');
                        return;
                    }
                    else if ( resolveInviteData.guild_id !== interaction.guild_id ) {
                        // Invite is for a different Guild
                        await updateSettingsPanel(interaction, api, 'INVITE_FOR_DIFFERENT_GUILD');
                        return;
                    }
                    else {
                        // Invite is for this Guild, so save to database
                        await GuildConfig.updateOne({ guild_id: interaction.guild_id }, { guild_invite: resolveInviteData.code })
                        .then(async () => {
                            // ACK
                            await updateSettingsPanel(interaction, api);
                            return;
                        })
                        .catch(async (err) => {
                            console.error(err);
                        });
                    }
                }
                else {
                    // Just in case
                    await updateSettingsPanel(interaction, api, 'INVALID_INVITE');
                    return;
                }
            }
            else {
                // Inputted value is not a valid invite
                await updateSettingsPanel(interaction, api, 'INVALID_INVITE');
                return;
            }
        }
        else if ( passedSettingName === 'message-activity' ) {
            // Edit Database
            await GuildConfig.updateOne({ guild_id: interaction.guild_id }, { message_activity_level: inputNewValue })
            .then(async () => {
                // ACK
                await updateSettingsPanel(interaction, api);
                return;
            })
            .catch(async (err) => {
                console.error(err);
            });
        }
        else if ( passedSettingName === 'event-activity' ) {
            // Edit Database
            await GuildConfig.updateOne({ guild_id: interaction.guild_id }, { event_activity_level: inputNewValue })
            .then(async () => {
                // ACK
                await updateSettingsPanel(interaction, api);
                return;
            })
            .catch(async (err) => {
                console.error(err);
            });
        }
        else if ( passedSettingName === 'thread-activity' ) {
            // Edit Database
            await GuildConfig.updateOne({ guild_id: interaction.guild_id }, { thread_activity_level: inputNewValue })
            .then(async () => {
                // ACK
                await updateSettingsPanel(interaction, api);
                return;
            })
            .catch(async (err) => {
                console.error(err);
            });
        }

        return;
    }
}






/** Runs the Modal
 * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
 * @param {API} api
 * @param {'INVALID_INVITE'|'INVITE_NOT_FOR_GUILD'|'INVITE_FOR_DIFFERENT_GUILD'|null} inviteError 
 */
async function updateSettingsPanel(interaction, api, inviteError) {
    // Fetch updated settings to display
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


    await api.interactions.updateMessage(interaction.id, interaction.token, { components: settingsPanelComponents })
    .then(async () => {
        // If an error was given due to updating Guild Invite, handle that here via a follow-up
        let inviteResponse = inviteError === 'INVITE_NOT_FOR_GUILD' ? localize(interaction.locale, 'SETTINGS_GUILD_INVITE_ERROR_INVITE_NOT_FOR_A_GUILD')
            : inviteError === 'INVITE_FOR_DIFFERENT_GUILD' ? localize(interaction.locale, 'SETTINGS_GUILD_INVITE_ERROR_INVITE_FOR_DIFFERENT_GUILD')
            : localize(interaction.locale, 'SETTINGS_GUILD_INVITE_ERROR_INVALID_INVITE');

        await api.interactions.followUp(DISCORD_APP_USER_ID, interaction.token, { flags: MessageFlags.Ephemeral, content: inviteResponse });
    });

    return;
}
