import { API, MessageFlags } from '@discordjs/core';

import { UserConfig } from '../../../Mongoose/Models.js';
import { localize } from '../../../Utility/localizeResponses.js';
import { MessagePrivacyLevel } from '../../../Utility/utilityConstants.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "privacy",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles receiving the input for changing user privacy settings",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, api, interactionUser) {
        // Grab inputted new value
        const ModalComponents = interaction.data.components;
        let inputNewValue = ModalComponents[1].component.values.shift();

        // Get localised privacy level for successful response
        let localisedValue = inputNewValue === MessagePrivacyLevel.Public ? localize(interaction.locale, 'PRIVACY_COMMAND_MODAL_SELECT_OPTION_PUBLIC_LABEL')
            : inputNewValue === MessagePrivacyLevel.Anonymous ? localize(interaction.locale, 'PRIVACY_COMMAND_MODAL_SELECT_OPTION_ANONYMOUS_LABEL')
            : localize(interaction.locale, 'PRIVACY_COMMAND_MODAL_SELECT_OPTION_PRIVATE_LABEL');

        // Update DB entry
        await UserConfig.updateOne({ user_id: interactionUser.id }, { message_privacy: inputNewValue })
        .then(async () => {
            // ACK
            await api.interactions.reply(interaction.id, interaction.token, { flags: MessageFlags.Ephemeral, content: localize(interaction.locale, 'PRIVACY_COMMAND_RESPONSE_SUCCESSFUL', localisedValue) });
            return;
        })
        .catch(async (err) => {
            console.error(err);
            await api.interactions.reply(interaction.id, interaction.token, { flags: MessageFlags.Ephemeral, content: localize(interaction.locale, 'PRIVACY_COMMAND_RESPONSE_SUCCESSFUL') });
        });

        return;
    }
}
