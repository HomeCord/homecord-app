import { Collection } from "@discordjs/collection";
import { API } from "@discordjs/core";

import { Blocklist, GuildConfig, ShowcasedMessage } from "../../Mongoose/Models.js";
import { ActivityLevel, HomeCordLimits, ShowcaseType, SystemMessageTypes } from "../../Utility/utilityConstants.js";
import { ReactionThreshold, ReplyThreshold } from "../../Resources/activityThresholds.js";
import { calculateIsoTimeFromNow } from "../../Utility/utilityMethods.js";

// Caches
/** Cache of Messages & how many Replies/Reactions they've had in the past 3 days
 * @type {Collection<String, {message_id: String, reply_count: Number, reaction_count: Number}}
 */
const CacheMessageActivity = new Collection();

/** Cache of Threads and how many Messages they've recently had sent in them
 * @type {Collection<String, {thread_id: String, message_count: Number}}
 */
const CacheThreadActivity = new Collection();

/** Cache used to reduce/prevent spam caused by speedy bulk-additions of Emoji Reactions to Messages
 * @type {Collection<String, {threshold_met: Boolean}}
 */
const CacheReactionCooldown = new Collection();





/**
 * Processes Messages that are in direct reply to another Message
 * @param {API} api 
 * @param {import('discord-api-types/v10').GatewayMessageCreateDispatchData} message 
 * @param {import('discord-api-types/v10').APIChannel} sourceChannel 
 */
export async function processMessageReply(api, message, sourceChannel) {
    // Check if message was sent in a blocked channel, in a blocked category, or by a User with a blocked role
    let blocklistChannelFilter = [ { item_id: message.channel_id } ];
    if ( sourceChannel.parent_id != null ) { blocklistChannelFilter.push({ item_id: sourceChannel.parent_id }); }
    if ( await Blocklist.exists({ guild_id: message.guild_id, $or: blocklistChannelFilter }) != null ) { return; }

    // Check roles of Replying Message Author
    if ( message.member?.roles.length > 0 ) {
        let blocklistReplyingRoleFilter = [];
        message.member?.roles.forEach(role => {
            // Filter out atEveryone
            if ( role !== message.guild_id ) { blocklistReplyingRoleFilter.push({ item_id: role }); }
        });

        if ( await Blocklist.exists({ guild_id: message.guild_id, $or: blocklistReplyingRoleFilter }) != null ) { return; }
    }

    // Check roles of message author being replied to
    const RepliedMessage = await api.channels.getMessage(message.channel_id, message.message_reference.message_id);
    const RepliedMember = await api.guilds.getMember(message.guild_id, RepliedMessage.author.id);;

    // Prevent replies to own messages from being counted
    if ( message.author.id === RepliedMessage.author.id ) { return; }

    if ( RepliedMember.roles.length > 0 ) {
        let blocklistReplyingRoleFilter = [];
        RepliedMember.roles.forEach(role => {
            // Filter out atEveryone
            if ( role !== message.guild_id ) { blocklistReplyingRoleFilter.push({ item_id: role }); }
        });

        if ( await Blocklist.exists({ guild_id: message.guild_id, $or: blocklistReplyingRoleFilter }) != null ) { return; }
    }



    // Not blocked, now check for if max showcased messages has been hit
    if ( (await ShowcasedMessage.find({ guild_id: message.guild_id })).length === HomeCordLimits.MaxShowcasedMessages ) { return; }

    // Also make sure Message hasn't already been showcased!
    if ( await ShowcasedMessage.findOne({ guild_id: message.guild_id, message_id: RepliedMessage.id }) != null ) { return }

    // Ensure Replied Message is not too old
    if ( (Date.now() - Date.parse(RepliedMessage.timestamp)) > 6.048e+8 ) { return; }


    // Is Message already in HomeCord's cache
    let grabFromCache = CacheMessageActivity.get(RepliedMessage.id);
    if ( !grabFromCache ) {
        // Not in cache, so add it
        grabFromCache = { message_id: RepliedMessage.id, reply_count: 1, reaction_count: 0 };
        CacheMessageActivity.set(RepliedMessage.id, grabFromCache);

        // Create timeout to delete after 3 days
        setTimeout(() => { CacheMessageActivity.delete(RepliedMessage.id); }, 2.592e+8);

        return;
    }
    else {
        // Message IS in cache, so add one to reply_count and then see if it meets activity threshold
        grabFromCache.reply_count += 1;
        let guildConfig = await GuildConfig.findOne({ guild_id: message.guild_id });

        let totalMessageActivityCount = grabFromCache.reply_count + grabFromCache.reaction_count;
        let totalThreshold = Math.ceil((ReplyThreshold[guildConfig.message_activity_level] + ReactionThreshold[guildConfig.message_activity_level]) / 2);
        let replyThreshold = ReplyThreshold[guildConfig.message_activity_level];
        let reactionThreshold = ReactionThreshold[guildConfig.message_activity_level];

        if ( grabFromCache.reply_count >= replyThreshold || grabFromCache.reaction_count >= reactionThreshold || totalMessageActivityCount >= totalThreshold ) {
            // Threshold met! So add message to Showcased Messages
            let expiryTime = (guildConfig.message_activity_level === ActivityLevel.VeryLow || guildConfig.message_activity_level === ActivityLevel.Low) ? calculateIsoTimeFromNow('SEVEN_DAYS')
                : guildConfig.message_activity_level === ActivityLevel.Medium ? calculateIsoTimeFromNow('FIVE_DAYS')
                : calculateIsoTimeFromNow('THREE_DAYS');

            await ShowcasedMessage.create({
                guild_id: message.guild_id,
                message_id: RepliedMessage.id,
                showcase_type: ShowcaseType.Highlight,
                showcase_expires_at: expiryTime
            })
            .then(async () => {
                // Remove from cache now that its highlighted
                CacheMessageActivity.delete(RepliedMessage.id);
                return;
            })
            .catch(console.error);
        }
        else {
            // Threshold not met, so just add to the count
            CacheMessageActivity.set(RepliedMessage.id, grabFromCache);
            return;
        }
    }

    return;
}





/**
 * Processes Message Reactions
 * @param {API} api 
 * @param {import('discord-api-types/v10').GatewayMessageReactionAddDispatchData} reaction 
 */
export async function processMessageReaction(api, reaction) {
    // Grab full Message & Author & Reactee data
    const message = await api.channels.getMessage(reaction.channel_id, reaction.message_id);
    const fullAuthorMember = await api.guilds.getMember(reaction.guild_id, message.author.id);
    const fullReacteeMember = await api.guilds.getMember(reaction.guild_id, reaction.user_id);
    const sourceChannel = await api.channels.get(message.channel_id);

    // Filter out Bots, System Messages, etc
    if ( fullAuthorMember.user.bot ) { return; }
    if ( message.author.system || SystemMessageTypes.includes(message.type) ) { return; }
    // Filter out reacting to your own message
    if ( message.author.id === reaction.user_id ) { return; }


    // Check if message was sent in a blocked channel, in a blocked category, or by a User with a blocked role
    let blocklistChannelFilter = [ { item_id: message.channel_id } ];
    if ( sourceChannel.parent_id != null ) { blocklistChannelFilter.push({ item_id: sourceChannel.parent_id }); }
    if ( await Blocklist.exists({ guild_id: reaction.guild_id, $or: blocklistChannelFilter }) != null ) { return; }

    // Check roles of Message Author
    if ( fullAuthorMember.roles.length > 0 ) {
        let blocklistReplyingRoleFilter = [];
        fullAuthorMember.roles.forEach(role => {
            // Filter out atEveryone
            if ( role !== reaction.guild_id ) { blocklistReplyingRoleFilter.push({ item_id: role }); }
        });

        if ( await Blocklist.exists({ guild_id: reaction.guild_id, $or: blocklistReplyingRoleFilter }) != null ) { return; }
    }

    // Check roles of User adding the Reaction
    if ( fullReacteeMember.roles.length > 0 ) {
        let blocklistReplyingRoleFilter = [];
        fullReacteeMember.roles.forEach(role => {
            // Filter out atEveryone
            if ( role !== reaction.guild_id ) { blocklistReplyingRoleFilter.push({ item_id: role }); }
        });

        if ( await Blocklist.exists({ guild_id: reaction.guild_id, $or: blocklistReplyingRoleFilter }) != null ) { return; }
    }


    // Not blocked, now check for if max showcased messages has been hit
    if ( (await ShowcasedMessage.find({ guild_id: reaction.guild_id })).length === HomeCordLimits.MaxShowcasedMessages ) { return; }

    // Also make sure Message hasn't already been showcased!
    if ( await ShowcasedMessage.findOne({ guild_id: reaction.guild_id, message_id: message.id }) != null ) { return }

    // Ensure Message is not too old
    if ( (Date.now() - Date.parse(message.timestamp)) > 6.048e+8 ) { return; }



    // Is Message already in HomeCord's cache
    let grabFromCache = CacheMessageActivity.get(message.id);
    if ( !grabFromCache ) {
        // Not in cache, so add it
        grabFromCache = { message_id: message.id, reply_count: 0, reaction_count: 1 };
        CacheMessageActivity.set(message.id, grabFromCache);

        // Create timeout to delete after 3 days
        setTimeout(() => { CacheMessageActivity.delete(RepliedMessage.id); }, 2.592e+8);

        // Create cooldown to prevent being showcased for about an hour, just to reduce chances of accidental spam-additions
        if ( !CacheReactionCooldown.has(message.id) ) {
            CacheReactionCooldown.set(message.id, { threshold_met: false });
            setTimeout(() => { CacheReactionCooldown.delete(message.id); }, 3.6e+6);
        }

        return;
    }
    else {
        // Message IS in cache, so add one to reply_count and then see if it meets activity threshold
        grabFromCache.reaction_count += 1;
        let guildConfig = await GuildConfig.findOne({ guild_id: message.guild_id });

        let totalMessageActivityCount = grabFromCache.reply_count + grabFromCache.reaction_count;
        let totalThreshold = Math.ceil((ReplyThreshold[guildConfig.message_activity_level] + ReactionThreshold[guildConfig.message_activity_level]) / 2);
        let replyThreshold = ReplyThreshold[guildConfig.message_activity_level];
        let reactionThreshold = ReactionThreshold[guildConfig.message_activity_level];

        if ( grabFromCache.reply_count >= replyThreshold || grabFromCache.reaction_count >= reactionThreshold || totalMessageActivityCount >= totalThreshold ) {
            // Threshold met!
            
            // First, check to see if anti-spam cooldown is still active
            let checkCooldown = CacheReactionCooldown.get(message.id);
            if ( checkCooldown != undefined ) {
                if ( checkCooldown.threshold_met === true ) { return; }
                else {
                    checkCooldown.threshold_met = true;
                    CacheReactionCooldown.set(message.id, checkCooldown);
                }
            }
            
            // Add message to Showcased Messages
            let expiryTime = (guildConfig.message_activity_level === ActivityLevel.VeryLow || guildConfig.message_activity_level === ActivityLevel.Low) ? calculateIsoTimeFromNow('SEVEN_DAYS')
                : guildConfig.message_activity_level === ActivityLevel.Medium ? calculateIsoTimeFromNow('FIVE_DAYS')
                : calculateIsoTimeFromNow('THREE_DAYS');

            await ShowcasedMessage.create({
                guild_id: message.guild_id,
                message_id: message.id,
                showcase_type: ShowcaseType.Highlight,
                showcase_expires_at: expiryTime
            })
            .then(async () => {
                // Remove from cache now that its highlighted
                CacheMessageActivity.delete(message.id);
                return;
            })
            .catch(console.error);
        }
        else {
            // Threshold not met, so just add to the count
            CacheMessageActivity.set(message.id, grabFromCache);
            return;
        }
    }

    return;
}
