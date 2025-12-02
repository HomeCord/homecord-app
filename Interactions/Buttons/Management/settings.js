import { API } from '@discordjs/core';
import { ComponentType } from 'discord-api-types/v10';
import { ActivityLevel, MessagePrivacyLevel } from '../../../Utility/utilityConstants.js';
import { localize } from '../../../Utility/localizeResponses.js';


export const Button = {
    /** The Button's name - set as the START of the Button's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "buttonName_extraData"
     * @type {String}
     */
    name: "settings",

    /** Button's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles requests to edit HomeCord's Server Settings",

    /** Button's cooldown, in seconds (whole number integers!)
     * @type {Number}
     */
    cooldown: 4,

    /** Runs the Button
     * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeButton(interaction, api, interactionUser) {
        // Grab data passed via Custom ID
        let splitCustomId = interaction.data.custom_id.split("_");
        let passedSettingsValue = splitCustomId.pop();
        /** @type {'homecord-toggle'|'default-privacy'|'starboard-reactions'|'message-activity'|'event-activity'|'thread-activity'} */
        let passedSettingsName = splitCustomId.pop();

        switch (passedSettingsName) {
            case 'homecord-toggle':
                await editHomeCordToggle(interaction, api, passedSettingsValue);
                return;
            
            case 'default-privacy':
                await editDefaultPrivacy(interaction, api, passedSettingsValue);
                return;

            case 'starboard-reactions':
                await editStarboardCompatibility(interaction, api, passedSettingsValue);
                return;

            case 'message-activity':
                await editMessageActivity(interaction, api, passedSettingsValue);
                return;

            case 'event-activity':
                await editEventActivity(interaction, api, passedSettingsValue);
                return;

            case 'thread-activity':
                await editThreadActivity(interaction, api, passedSettingsValue);
                return;
        }
    }
}







/** Handles editing the main Toggle
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {API} api
 * @param {String} settingValue
 */
async function editHomeCordToggle(interaction, api, settingValue) {
    // Cast String into a Boolean
    let castedSettingValue = false;
    if ( settingValue === 'true' ) { castedSettingValue = true; }
    if ( settingValue === 'false' ) { castedSettingValue = false; }

    // Construct Modal
    /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
    let responseModal = {
        "title": localize(interaction.locale, 'SETTINGS_MODAL_HOMECORD_TOGGLE_TITLE'),
        "custom_id": `settings_homecord-toggle`,
        "components": [{
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'SETTINGS_MODAL_HOMECORD_TOGGLE_DESCRIPTION')
        }, {
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'SETTINGS_MODAL_HOMECORD_TOGGLE_SELECT_LABEL'),
            "component": {
                "type": ComponentType.StringSelect,
                "custom_id": `new-value`,
                "required": true,
                "min_values": 1,
                "max_values": 1,
                "options": [{
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_HOMECORD_TOGGLE_SELECT_OPTION_ENABLE_LABEL'),
                    "value": `ENABLE`,
                    "default": castedSettingValue
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_HOMECORD_TOGGLE_SELECT_OPTION_DISABLE_LABEL'),
                    "value": `DISABLE`,
                    "default": !castedSettingValue
                }]
            }
        }]
    };


    await api.interactions.createModal(interaction.id, interaction.token, responseModal);

    return;
}







/** Handles editing default message privacy
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {API} api
 * @param {MessagePrivacyLevel}
 */
async function editDefaultPrivacy(interaction, api, settingValue) {
    // Construct Modal
    /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
    let responseModal = {
        "title": localize(interaction.locale, 'SETTINGS_MODAL_DEFAULT_PRIVACY_TITLE'),
        "custom_id": `settings_default-privacy`,
        "components": [{
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'SETTINGS_MODAL_DEFAULT_PRIVACY_DESCRIPTION')
        }, {
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'SETTINGS_MODAL_DEFAULT_PRIVACY_SELECT_LABEL'),
            "component": {
                "type": ComponentType.StringSelect,
                "custom_id": `new-value`,
                "required": true,
                "min_values": 1,
                "max_values": 1,
                "options": [{
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_DEFAULT_PRIVACY_SELECT_OPTION_PUBLIC_LABEL'),
                    "value": MessagePrivacyLevel.Public,
                    "default": settingValue === MessagePrivacyLevel.Public ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_DEFAULT_PRIVACY_SELECT_OPTION_ANONYMOUS_LABEL'),
                    "value": MessagePrivacyLevel.Anonymous,
                    "default": settingValue === MessagePrivacyLevel.Anonymous ? true : false
                }, /* {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_DEFAULT_PRIVACY_SELECT_OPTION_PRIVATE_LABEL'),
                    "value": MessagePrivacyLevel.Private,
                    "default": settingValue === MessagePrivacyLevel.Private ? true : false
                } */]
            }
        }]
    };

    await api.interactions.createModal(interaction.id, interaction.token, responseModal);

    return;
}







/** Handles editing Starboard Compatibility
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {API} api
 * @param {Boolean} settingValue
 */
async function editStarboardCompatibility(interaction, api, settingValue) {
    // Cast String into a Boolean
    let castedSettingValue = false;
    if ( settingValue === 'true' ) { castedSettingValue = true; }
    if ( settingValue === 'false' ) { castedSettingValue = false; }

    // Construct Modal
    /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
    let responseModal = {
        "title": localize(interaction.locale, 'SETTINGS_MODAL_ALLOW_STARBOARD_TITLE'),
        "custom_id": `settings_starboard-reactions`,
        "components": [{
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'SETTINGS_MODAL_ALLOW_STARBOARD_DESCRIPTION')
        }, {
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'SETTINGS_MODAL_ALLOW_STARBOARD_SEELCT_LABEL'),
            "component": {
                "type": ComponentType.StringSelect,
                "custom_id": `new-value`,
                "required": true,
                "min_values": 1,
                "max_values": 1,
                "options": [{
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ALLOW_STARBOARD_SELECT_OPTION_ENABLE_LABEL'),
                    "value": `ENABLE`,
                    "default": castedSettingValue
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ALLOW_STARBOARD_SELECT_OPTION_DISABLE_LABEL'),
                    "value": `DISABLE`,
                    "default": !castedSettingValue
                }]
            }
        }]
    };


    await api.interactions.createModal(interaction.id, interaction.token, responseModal);

    return;
}







/** Handles editing Message activity threshold
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {API} api
 * @param {ActivityLevel} settingValue
 */
async function editMessageActivity(interaction, api, settingValue) {
    // Construct Modal
    /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
    let responseModal = {
        "title": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_MESSAGE_TITLE'),
        "custom_id": `settings_message-activity`,
        "components": [{
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_MESSAGE_DESCRIPTION')
        }, {
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_LABEL'),
            "component": {
                "type": ComponentType.StringSelect,
                "custom_id": `new-value`,
                "required": true,
                "min_values": 1,
                "max_values": 1,
                "options": [{
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_DISABLED'),
                    "value": ActivityLevel.Disabled,
                    "default": settingValue === ActivityLevel.Disabled ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_VERY_LOW'),
                    "value": ActivityLevel.VeryLow,
                    "default": settingValue === ActivityLevel.VeryLow ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_LOW'),
                    "value": ActivityLevel.Low,
                    "default": settingValue === ActivityLevel.Low ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_MEDIUM'),
                    "value": ActivityLevel.Medium,
                    "default": settingValue === ActivityLevel.Medium ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_HIGH'),
                    "value": ActivityLevel.High,
                    "default": settingValue === ActivityLevel.High ? true : false
                }, /* {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_VERY_HIGH'),
                    "value": ActivityLevel.VeryHigh,
                    "default": settingValue === ActivityLevel.VeryHigh ? true : false
                } */]
            }
        }]
    };

    await api.interactions.createModal(interaction.id, interaction.token, responseModal);

    return;
}







/** Handles editing Event activity threshold
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {API} api
 * @param {ActivityLevel} settingValue
 */
async function editEventActivity(interaction, api, settingValue) {
    // Construct Modal
    /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
    let responseModal = {
        "title": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_EVENT_TITLE'),
        "custom_id": `settings_event-activity`,
        "components": [{
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_EVENT_DESCRIPTION')
        }, {
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_LABEL'),
            "component": {
                "type": ComponentType.StringSelect,
                "custom_id": `new-value`,
                "required": true,
                "min_values": 1,
                "max_values": 1,
                "options": [{
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_DISABLED'),
                    "value": ActivityLevel.Disabled,
                    "default": settingValue === ActivityLevel.Disabled ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_VERY_LOW'),
                    "value": ActivityLevel.VeryLow,
                    "default": settingValue === ActivityLevel.VeryLow ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_LOW'),
                    "value": ActivityLevel.Low,
                    "default": settingValue === ActivityLevel.Low ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_MEDIUM'),
                    "value": ActivityLevel.Medium,
                    "default": settingValue === ActivityLevel.Medium ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_HIGH'),
                    "value": ActivityLevel.High,
                    "default": settingValue === ActivityLevel.High ? true : false
                }, /* {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_VERY_HIGH'),
                    "value": ActivityLevel.VeryHigh,
                    "default": settingValue === ActivityLevel.VeryHigh ? true : false
                } */]
            }
        }]
    };

    await api.interactions.createModal(interaction.id, interaction.token, responseModal);

    return;
}







/** Handles editing Thread activity threshold
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {API} api
 * @param {ActivityLevel} settingValue
 */
async function editThreadActivity(interaction, api, settingValue) {
    // Construct Modal
    /** @type {import('discord-api-types/v10').APIModalInteractionResponseCallbackData} */
    let responseModal = {
        "title": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_THREAD_TITLE'),
        "custom_id": `settings_thread-activity`,
        "components": [{
            "type": ComponentType.TextDisplay,
            "content": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_THREAD_DESCRIPTION')
        }, {
            "type": ComponentType.Label,
            "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_LABEL'),
            "component": {
                "type": ComponentType.StringSelect,
                "custom_id": `new-value`,
                "required": true,
                "min_values": 1,
                "max_values": 1,
                "options": [{
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_DISABLED'),
                    "value": ActivityLevel.Disabled,
                    "default": settingValue === ActivityLevel.Disabled ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_VERY_LOW'),
                    "value": ActivityLevel.VeryLow,
                    "default": settingValue === ActivityLevel.VeryLow ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_LOW'),
                    "value": ActivityLevel.Low,
                    "default": settingValue === ActivityLevel.Low ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_MEDIUM'),
                    "value": ActivityLevel.Medium,
                    "default": settingValue === ActivityLevel.Medium ? true : false
                }, {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_HIGH'),
                    "value": ActivityLevel.High,
                    "default": settingValue === ActivityLevel.High ? true : false
                }, /* {
                    "label": localize(interaction.locale, 'SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_VERY_HIGH'),
                    "value": ActivityLevel.VeryHigh,
                    "default": settingValue === ActivityLevel.VeryHigh ? true : false
                } */]
            }
        }]
    };

    await api.interactions.createModal(interaction.id, interaction.token, responseModal);

    return;
}
