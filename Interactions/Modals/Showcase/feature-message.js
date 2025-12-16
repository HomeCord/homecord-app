import { API, MessageFlags } from '@discordjs/core';
import { ComponentType } from 'discord-api-types/v10';

import { localize } from '../../../Utility/localizeResponses.js';
import { calculateIsoTimeFromNow } from '../../../Utility/utilityMethods.js';
import { ShowcasedAnnouncement, ShowcasedMessage } from '../../../Mongoose/Models.js';
import { HomeCordLimits, ShowcaseType } from '../../../Utility/utilityConstants.js';


export const Modal = {
    /** The Modals's name - set as the START of the Modal's Custom ID, with extra data being separated with a "_" AFTER the name
     * @example "modalName_extraData"
     * @type {String}
     */
    name: "feature-message",

    /** Modal's Description, mostly for reminding me what it does!
     * @type {String}
     */
    description: "Handles featuring a message or announcement",

    /** Runs the Modal
     * @param {import('discord-api-types/v10').APIModalSubmitGuildInteraction} interaction 
     * @param {API} api
     * @param {import('discord-api-types/v10').APIUser} interactionUser 
     */
    async executeModal(interaction, api, interactionUser) {
        // Grab inputted values
        let sourceMessageId = interaction.data.custom_id.split("_").pop();
        const ModalComponents = interaction.data.components;
        let inputMessageType = null;
        let inputDuration = null;

        for ( let i = 0; i <= ModalComponents.length - 1; i++ ) {
            // Safety net
            if ( ModalComponents[i].type === ComponentType.Label ) {
                let tempTopLevelComp = ModalComponents[i].component;
                if ( tempTopLevelComp.custom_id === "message-type" ) { inputMessageType = tempTopLevelComp.values.shift(); }
                if ( tempTopLevelComp.custom_id === "duration" ) { inputDuration = tempTopLevelComp.values.shift(); }
            }
        }

        // Convert inputted duration into a timestamp
        let expiryTime = calculateIsoTimeFromNow(inputDuration);

        // Save to correct DB table depending on message type
        if ( inputMessageType === "STANDARD" ) {
            // But first, ensure not already showcased!
            if ( await ShowcasedMessage.exists({ guild_id: interaction.guild_id, message_id: sourceMessageId }) != null ) {
                await api.interactions.reply(interaction.id, interaction.token, {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_ALREADY_SHOWCASED')
                });
            }

            // And also that max showcased messages hasn't been reached
            if ( (await ShowcasedMessage.find({ guild_id: interaction.guild_id })).length === HomeCordLimits.MaxShowcasedMessages ) {
                await api.interactions.reply(interaction.id, interaction.token, {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_MAX_SHOWCASED_MESSAGES_HIT')
                });
            }

            await ShowcasedMessage.create({
                guild_id: interaction.guild_id,
                message_id: sourceMessageId,
                channel_id: interaction.channel?.id,
                showcase_type: ShowcaseType.Feature,
                showcase_expires_at: expiryTime
            })
            .then(async () => {
                await api.interactions.reply(interaction.id, interaction.token, {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_SUCCESS_FEATURED_MESSAGE')
                });
            })
            .catch(async (err) => {
                console.error(err);

                await api.interactions.reply(interaction.id, interaction.token, {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_SHOWCASE_FAILED')
                });
            });
        }
        else if ( inputMessageType === "ANNOUNCEMENT" ) {
            // But first, ensure not already showcased!
            if ( await ShowcasedAnnouncement.exists({ guild_id: interaction.guild_id, message_id: sourceMessageId }) != null ) {
                await api.interactions.reply(interaction.id, interaction.token, {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_ANNOUNCEMENT_ALREADY_SHOWCASED')
                });
            }

            // And also that max showcased announcements hasn't been reached
            if ( (await ShowcasedAnnouncement.find({ guild_id: interaction.guild_id })).length === HomeCordLimits.MaxShowcasedAnnouncements ) {
                await api.interactions.reply(interaction.id, interaction.token, {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_MAX_SHOWCASED_ANNOUNCEMENTS_HIT')
                });
            }

            await ShowcasedAnnouncement.create({
                guild_id: interaction.guild_id,
                message_id: sourceMessageId,
                channel_id: interaction.channel?.id,
                showcase_type: ShowcaseType.Feature,
                showcase_expires_at: expiryTime
            })
            .then(async () => {
                await api.interactions.reply(interaction.id, interaction.token, {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_SUCCESS_FEATURED_ANNOUNCEMENT')
                });
            })
            .catch(async (err) => {
                console.error(err);
                
                await api.interactions.reply(interaction.id, interaction.token, {
                    flags: MessageFlags.Ephemeral,
                    content: localize(interaction.locale, 'FEATURE_MESSAGE_COMMAND_ERROR_ANNOUNCEMENT_SHOWCASE_FAILED')
                });
            });
        }

        return;
    }
}
