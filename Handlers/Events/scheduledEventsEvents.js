import { Collection } from "@discordjs/collection";
import { API } from "@discordjs/core";

import { Blocklist, GuildConfig, ShowcasedEvent } from "../../Mongoose/Models.js";
import { ActivityLevel, HomeCordLimits, ShowcaseType } from "../../Utility/utilityConstants.js";
import { EventThreshold } from "../../Resources/activityThresholds.js";
import { calculateIsoTimeFromNow } from "../../Utility/utilityMethods.js";
import { GuildScheduledEventStatus } from "discord-api-types/v10";


/** Cache of Scheduled Events, mainly used to prevent bulk-addition spam caused by many Users registering their interest in an Event at the same time!
 * @type {Collection<String, {event_id: String}}
 */
const CacheEventActivity = new Collection();






/**
 * Processes Scheduled Events when a new user registers their interest in said Event
 * @param {API} api 
 * @param {import('discord-api-types/v10').GatewayGuildScheduledEventUserAddDispatchData} scheduledEvent 
 */
export async function processScheduledEventUserAdd(api, scheduledEvent) {
    // If in cache, return early to keep within anti-spam cooldown
    if ( CacheEventActivity.has(scheduledEvent.guild_scheduled_event_id) ) { return; }
    
    // Not in cache, so add it now
    CacheEventActivity.set(scheduledEvent.guild_scheduled_event_id, { event_id: scheduledEvent.guild_scheduled_event_id });
    // Timeout to clear it from cache after an hour
    setTimeout(() => { CacheEventActivity.delete(scheduledEvent.guild_scheduled_event_id); }, 3.6e+6);

    // Fetch full data objects
    const FetchedScheduledEvent = await api.guilds.getScheduledEvent(scheduledEvent.guild_id, scheduledEvent.guild_scheduled_event_id, { with_user_count: true });


    // Ensure Scheduled Event is still in "planned" or "live" state (ie: we don't want to showcase Events that are Completed or Cancelled)
    if ( FetchedScheduledEvent.status === GuildScheduledEventStatus.Completed || FetchedScheduledEvent.status === GuildScheduledEventStatus.Canceled ) { return; }

    // Check for if max showcased events has been hit
    if ( (await ShowcasedEvent.find({ guild_id: scheduledEvent.guild_id })).length === HomeCordLimits.MaxShowcasedEvents ) { return; }

    // Also make sure event hasn't already been showcased!
    if ( await ShowcasedEvent.findOne({ guild_id: scheduledEvent.guild_id, event_id: scheduledEvent.guild_scheduled_event_id }) != null ) { return }


    // Check if Event is connected to a blocked Channel, or that Channel is in a blocked Category
    if ( FetchedScheduledEvent.channel_id != null ) {
        let eventConnectedChannel = await api.channels.get(FetchedScheduledEvent.channel_id);
        let blocklistChannelFilter = [ { item_id: FetchedScheduledEvent.channel_id } ];
        if ( eventConnectedChannel.parent_id != null ) { blocklistChannelFilter.push({ item_id: eventConnectedChannel.parent_id }); }
        if ( await Blocklist.exists({ guild_id: scheduledEvent.guild_id, $or: blocklistChannelFilter }) != null ) { return; }
    }



    // Check against activity threshold
    let guildConfig = await GuildConfig.findOne({ guild_id: scheduledEvent.guild_id });
    let eventActivityThreshold = EventThreshold[guildConfig.event_activity_level];


    if ( FetchedScheduledEvent.user_count >= eventActivityThreshold ) {
        // Threshold met! So add Event to Showcased Events
        let expiryTime = FetchedScheduledEvent.scheduled_end_time != null ? new Date(FetchedScheduledEvent.scheduled_end_time).toISOString()
            : (guildConfig.thread_activity_level === ActivityLevel.VeryLow || guildConfig.thread_activity_level === ActivityLevel.Low) ? calculateIsoTimeFromNow('SEVEN_DAYS')
            : guildConfig.thread_activity_level === ActivityLevel.Medium ? calculateIsoTimeFromNow('FIVE_DAYS')
            : calculateIsoTimeFromNow('THREE_DAYS');
    
        await ShowcasedEvent.create({
            guild_id: scheduledEvent.guild_id,
            event_id: scheduledEvent.guild_scheduled_event_id,
            showcase_type: ShowcaseType.Highlight,
            showcase_expires_at: expiryTime
        })
        .catch(console.error);
    }

    return;
}
