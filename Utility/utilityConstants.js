import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import { GatewayIntentBits, Client } from '@discordjs/core';
import { Collection } from '@discordjs/collection';
import { MessageType } from 'discord-api-types/v10';
import * as Mongoose from 'mongoose';
import { DISCORD_TOKEN, MONGO_CONNECTION_URI } from '../config.js';


// REST Manager
const DiscordRest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

/** Required Intents */
const RequestedIntents = GatewayIntentBits.Guilds | GatewayIntentBits.GuildIntegrations | GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent | GatewayIntentBits.GuildMessageReactions | GatewayIntentBits.GuildScheduledEvents;

/** WebSocket Manager for interacting with Discord API. Only exporting so I can use `.connect()` in index file */
const DiscordGateway = new WebSocketManager({
    token: DISCORD_TOKEN,
    intents: RequestedIntents,
    rest: DiscordRest,
});

DiscordGateway.connect().catch(console.error);

Mongoose.connect(MONGO_CONNECTION_URI).catch(console.error);


// *******************************
//  Exports

/** Client for Discord's API events & stuff */
export const DiscordClient = new Client({ rest: DiscordRest, gateway: DiscordGateway });

/** Utility & Command/Interaction Collections */
export const UtilityCollections = {
    /** Holds all Slash Commands, mapped by Command Name
     * @type {Collection<String, *>} */
    SlashCommands: new Collection(),
    
    /** Holds all Context Commands, mapped by Command Name
     * @type {Collection<String, *>} */
    ContextCommands: new Collection(),
    
    /** Holds all Button Interactions, mapped by Button Custom ID
     * @type {Collection<String, *>} */
    Buttons: new Collection(),

    /** Holds all Select Menu Interactions, mapped by Select Custom ID
     * @type {Collection<String, *>} */
    Selects: new Collection(),

    /** Holds all Modal Interactions, mapped by Modal Custom ID
     * @type {Collection<String, *>} */
    Modals: new Collection(),

    /** Holds all Cooldowns for Slash Commands, mapped by "commandName_userID"
     * @type {Collection<String, Number>} 
     */
    SlashCooldowns: new Collection(),

    /** Holds all Cooldowns for Context Commands, mapped by "commandName_userID"
     * @type {Collection<String, Number>} 
     */
    ContextCooldowns: new Collection(),

    /** Holds all Cooldowns for Button Interactions, mapped by "buttonName_userID"
     * @type {Collection<String, Number>} 
     */
    ButtonCooldowns: new Collection(),

    /** Holds all Cooldowns for Select Menu Interactions, mapped by "selectName_userID"
     * @type {Collection<String, Number>}
     */
    SelectCooldowns: new Collection()
};

/** Default Headers for API requests */
export const DefaultResponseHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bot ${DISCORD_TOKEN}`
};

/** ENUMs */
export const ActivityLevel = {
    Disabled: "DISABLED",
    VeryLow: "VERY-LOW",
    Low: "LOW",
    Medium: "MEDIUM",
    High: "HIGH",
    VeryHigh: "VERY-HIGH"
};

export const MessagePrivacyLevel = {
    Private: "PRIVATE",
    Anonymous: "ANONYMOUS",
    Public: "PUBLIC"
};

export const BlockTypes = {
    Channel: "CHANNEL",
    Category: "CATEGORY",
    Role: "ROLE"
};

export const ShowcaseType = {
    Highlight: "HIGHLIGHT",
    Feature: "FEATURE"
};

export const HomeCordLimits = {
    // Showcaseable items
    MaxShowcasedMessages: 5, // Messages from Text or Public_Thread Channels
    MaxShowcasedAnnouncements: 4, // Messages from Announcement Channels
    MaxShowcasedEvents: 5,
    MaxShowcasedChannels: 6,
    MaxShowcasedThreads: 5,
    // Block List
    MaxBlockedChannels: 10,
    MaxBlockedCategories: 10,
    MaxBlockedRoles: 10
};

export const SystemMessageTypes = [
    MessageType.RecipientAdd, MessageType.RecipientRemove, MessageType.Call, MessageType.ChannelNameChange,
    MessageType.ChannelIconChange, MessageType.ChannelPinnedMessage, MessageType.UserJoin, MessageType.GuildBoost,
    MessageType.GuildBoostTier1, MessageType.GuildBoostTier2, MessageType.GuildBoostTier3, MessageType.ChannelFollowAdd,
    MessageType.GuildDiscoveryDisqualified, MessageType.GuildDiscoveryRequalified, MessageType.GuildDiscoveryGracePeriodInitialWarning,
    MessageType.GuildDiscoveryGracePeriodFinalWarning, MessageType.ThreadCreated, MessageType.GuildInviteReminder, MessageType.AutoModerationAction,
    MessageType.RoleSubscriptionPurchase, MessageType.InteractionPremiumUpsell, MessageType.StageStart, MessageType.StageEnd, MessageType.StageSpeaker,
    MessageType.StageRaiseHand, MessageType.StageTopic, MessageType.GuildApplicationPremiumSubscription, MessageType.GuildIncidentAlertModeEnabled,
    MessageType.GuildIncidentAlertModeDisabled, MessageType.GuildIncidentReportRaid, MessageType.GuildIncidentReportFalseAlarm,
    40, 42, MessageType.PurchaseNotification, MessageType.PollResult, 49, 51, 55, 58, 59, 60, 61, 62, 63
];

export const ThreadTypes = {
    /** Thread made in a Text Channel */
    TextThread: 'TEXT_THREAD',
    /** Thread made in an Announcement Channel */
    NewsThread: 'ANNOUNCEMENT_THREAD',
    /** Thread made in either a Forum Channel or a Media Channel */
    ForumThread: 'FORUM_THREAD'
};
