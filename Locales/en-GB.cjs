module.exports = {

    // ******* GENERIC STUFF
    ERROR_GENERIC: `An error has occurred.`,
    ERROR_GENERIC_WITH_PREVIEW: `An error has occurred. A preview of the raw error is as follows:\n\`\`\`{{0}}\`\`\``,



    // ******* GENERIC SLASH COMMAND STUFF
    SLASH_COMMAND_ERROR_GENERIC: `Sorry, but there was a problem trying to run this Slash Command...`,

    SLASH_COMMAND_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Slash Command again.`,
    SLASH_COMMAND_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Slash Command again.`,



    // ******* GENERIC CONTEXT COMMAND STUFF
    CONTEXT_COMMAND_ERROR_GENERIC: `Sorry, an error occurred while trying to run this Context Command...`,

    CONTEXT_COMMAND_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Context Command again.`,
    CONTEXT_COMMAND_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Context Command again.`,



    // ******* GENERIC BUTTON STUFF
    BUTTON_ERROR_GENERIC: `An error occurred while trying to process that Button press...`,

    BUTTON_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Button again.`,
    BUTTON_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Button again.`,



    // ******* GENERIC SELECT MENU STUFF
    SELECT_ERROR_GENERIC: `An error occurred while trying to process that Select Menu choice...`,

    SELECT_ERROR_COOLDOWN_SECONDS: `Please wait {{0}} more seconds before using this Select Menu again.`,
    SELECT_ERROR_COOLDOWN_MINUTES: `Please wait {{0}} more minutes before using this Select Menu again.`,
    SELECT_ERROR_COOLDOWN_HOURS: `Please wait {{0}} more hours before using this Select Menu again.`,
    SELECT_ERROR_COOLDOWN_DAYS: `Please wait {{0}} more days before using this Select Menu again.`,
    SELECT_ERROR_COOLDOWN_MONTHS: `Please wait {{0}} more months before using this Select Menu again.`,



    // ******* GENERIC MODAL STUFF
    MODAL_ERROR_GENERIC: `An error occurred while trying to process that Modal submission...`,



    // ******* GENERIC AUTOCOMPLETE STUFF
    AUTOCOMPLETE_ERROR_GENERIC: `Error: Unable to process.`,



    // ******* HOMECORD SETTINGS
    // Displayed Values
    SETTINGS_IS_ENABLED_TRUE: `Enabled`,
    SETTINGS_IS_ENABLED_FALSE: `Disabled`,
    SETTINGS_DEFAULT_MESSAGE_PRIVACY_PUBLIC: `Public (Shows full messages including author details)`,
    SETTINGS_DEFAULT_MESSAGE_PRIVACY_ANONYMOUS: `Anonymous (Shows messages *excluding* author details)`,
    SETTINGS_DEFAULT_MESSAGE_PRIVACY_PRIVATE: `Private (Does not show messages at all)`,
    SETTINGS_ACTIVITY_LEVEL_DISABLED: `Disabled`,
    SETTINGS_ACTIVITY_LEVEL_VERY_LOW: `Very Low`,
    SETTINGS_ACTIVITY_LEVEL_LOW: `Low`,
    SETTINGS_ACTIVITY_LEVEL_MEDIUM: `Medium`,
    SETTINGS_ACTIVITY_LEVEL_HIGH: `High`,
    SETTINGS_ACTIVITY_LEVEL_VERY_HIGH: `Very High`,
    SETTINGS_ALLOW_STARBOARD_REACTIONS_ENABLED: `Enabled`,
    SETTINGS_ALLOW_STARBOARD_REACTIONS_DISABLED: `Disabled`,
    // Panel
    SETTINGS_PANEL_HEADING: `# __HomeCord's Settings__`,
    SETTINGS_PANEL_EDIT_BUTTON_LABEL: `Edit`,
    SETTINGS_PANEL_IS_ENABLED_DESCRIPTION: `### Is HomeCord Enabled for Server?\nHomeCord's webpage for this Server is currently: {{0}}`,
    SETTINGS_PANEL_MESSAGE_PRIVACY_DESCRIPTION: `### Default Message Privacy\n{{0}}`,
    SETTINGS_PANEL_STARBOARD_REACTIONS_DESCRIPTION: `### Starboard Bot Compatibility\n{{0}}`,
    SETTINGS_PANEL_MESSAGE_ACTIVITY_DESCRIPTION: `### Message Activity Threshold\n{{0}}`,
    SETTINGS_PANEL_EVENT_ACTIVITY_DESCRIPTION: `### Event Activity Threshold\n{{0}}`,
    SETTINGS_PANEL_THREAD_ACTIVITY_DESCRIPTION: `### Thread Activity Threshold\n{{0}}`,
    // HomeCord Toggle Modal
    SETTINGS_MODAL_HOMECORD_TOGGLE_TITLE: `Edit HomeCord: Main Toggle`,
    SETTINGS_MODAL_HOMECORD_TOGGLE_DESCRIPTION: `Toggle if HomeCord should be enabled or disabled for this Server.\nDisabling HomeCord will hide your Server's webpage on HomeCord's website, and stop HomeCord from processing any messages/events/threads on your Server.\n\nThis action can be toggled at any time.\n-# :information_source: This will only affect HomeCord in this Server, and will *not* affect any other Server using HomeCord.`,
    SETTINGS_MODAL_HOMECORD_TOGGLE_SELECT_LABEL: `Toggle HomeCord`,
    SETTINGS_MODAL_HOMECORD_TOGGLE_SELECT_OPTION_ENABLE_LABEL: `Enable HomeCord`,
    SETTINGS_MODAL_HOMECORD_TOGGLE_SELECT_OPTION_DISABLE_LABEL: `Disable HomeCord`,
    // Default Privacy Modal
    SETTINGS_MODAL_DEFAULT_PRIVACY_TITLE: `Edit HomeCord: Default Privacy`,
    SETTINGS_MODAL_DEFAULT_PRIVACY_DESCRIPTION: `Set the default message privacy level for showcasing messages from this Server onto your Server's page on HomeCord's website.\nThis setting only applies if "Message Activity Threshold" is not disabled.\nYour Server Members can override this setting by setting their own personal privacy preference.\n\nThe default Privacy settings are as follows:\n- **Public** - Shows full messages including their author details\n- **Anonymous** - Shows messages, while removing their author details`,
    SETTINGS_MODAL_DEFAULT_PRIVACY_SELECT_LABEL: `Select Message Privacy Level`,
    SETTINGS_MODAL_DEFAULT_PRIVACY_SELECT_OPTION_PUBLIC_LABEL: `Public`,
    SETTINGS_MODAL_DEFAULT_PRIVACY_SELECT_OPTION_ANONYMOUS_LABEL: `Anonymous`,
    //SETTINGS_MODAL_DEFAULT_PRIVACY_SELECT_OPTION_PRIVATE_LABEL: `Private`,
    // Allow Starboard Reactions
    SETTINGS_MODAL_ALLOW_STARBOARD_TITLE: `Edit HomeCord: Starboard Reactions`,
    SETTINGS_MODAL_ALLOW_STARBOARD_DESCRIPTION: `To reduce potential conflict with any classic 'Starboard' Bots/Apps this Server may have, HomeCord by default excludes the default :star: Emoji Reactions from being counted towards Message Activity.\n\nThis can be toggled here if you would like :star: Emoji Reactions to count towards HomeCord's Message Activity module.`,
    SETTINGS_MODAL_ALLOW_STARBOARD_SEELCT_LABEL: `Toggle Starboard Compatibility`,
    SETTINGS_MODAL_ALLOW_STARBOARD_SELECT_OPTION_ENABLE_LABEL: `Enable`,
    SETTINGS_MODAL_ALLOW_STARBOARD_SELECT_OPTION_DISABLE_LABEL: `Disable`,
    // Activity Thresholds
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_LABEL: `Select Activity Threshold`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_DISABLED: `Disable`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_VERY_LOW: `Very Low`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_LOW: `Low`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_MEDIUM: `Medium`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_HIGH: `High`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_SELECT_OPTION_VERY_HIGH: `Very High`,
    // Specific Activity Thresholds
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_MESSAGE_TITLE: `Edit HomeCord: Message Activity`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_MESSAGE_DESCRIPTION: `Set the threshold of activity that HomeCord should check for messages sent in your Server in order to automatically highlight noteworthy messages.\n\nUse the "Disable" option to disable HomeCord's message activity module, preventing any and all messages from being automatically highlighted to your Server's page on HomeCord's website.\n\nSelect the threshold that best matches your Server's level of message-based activity (which includes Emoji Reactions and direct Replies using Discord's Reply feature).\n\nAs a baseline: "Low" is intended for smaller or less active Servers, while "High" is intended for larger or busy Servers.`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_EVENT_TITLE: `Edit HomeCord: Event Activity`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_EVENT_DESCRIPTION: `Set the threshold of activity that HomeCord should check for Scheduled Events created in your Server in order to automatically highlight noteworthy Events.\n\nUse the "Disable" option to disable HomeCord's event activity module, preventing any and all Scheduled Events from being automatically highlighted to your Server's page on HomeCord's website.\n\nSelect the threshold that best matches your Server's level of event-based activity (which is based off number of people registering their interest to your Server's Events in Discord's Events feature).\n\nAs a baseline: "Low" is intended for smaller or less active Servers, while "High" is intended for larger or busy Servers.`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_THREAD_TITLE: `Edit HomeCord: Thread Activity`,
    SETTINGS_MODAL_ACTIVITY_THRESHOLD_THREAD_DESCRIPTION: `Set the threshold of activity that HomeCord should check for messages sent in Threads & Forum Posts in your Server in order to automatically highlight noteworthy Threads/Forums.\n\nUse the "Disable" option to disable HomeCord's thread activity module, preventing any and all Threads/Forums from being automatically highlighted to your Server's page on HomeCord's website.\n\nSelect the threshold that best matches your Server's level of thread-based activity (which is based off number of messages recently sent in Public Threads or Forum Posts in your Server).\n\nAs a baseline: "Low" is intended for smaller or less active Servers, while "High" is intended for larger or busy Servers.`,



    // ******* USER PRIVACY COMMAND
    PRIVACY_COMMAND_MODAL_TITLE: `Edit User Privacy Setting`,
    PRIVACY_COMMAND_MODAL_DESCRIPTION: `Set the message privacy level for HomeCord to showcase your noteworthy messages you send in Servers with HomeCord added.\nShowcased messages will be displayed on HomeCord's website if the Server both has HomeCord added and has enabled HomeCord.\n\nThe privacy settings are as follows:\n- **Public** - Shows full messages including your author details (username & profile picture)\n- **Anonymous** - Shows messages, while removing your author details\n- **Private** - Fully prevents your messages from being showcased or processed by HomeCord`,
    PRIVACY_COMMAND_MODAL_SELECT_LABEL: `Select Message Privacy Level`,
    PRIVACY_COMMAND_MODAL_SELECT_OPTION_PUBLIC_LABEL: `Public`,
    PRIVACY_COMMAND_MODAL_SELECT_OPTION_ANONYMOUS_LABEL: `Anonymous`,
    PRIVACY_COMMAND_MODAL_SELECT_OPTION_PRIVATE_LABEL: `Private`,
    PRIVACY_COMMAND_RESPONSE_SUCCESSFUL: `Successfully updated your privacy setting in HomeCord to **{{0}}**`,
    PRIVACY_COMMAND_RESPONSE_FAILED: `Something went wrong while trying to update your privacy setting... Please try again in a few moments.`,



    // ******* FEATURE MESSAGE COMMAND
    FEATURE_MESSAGE_COMMAND_ERROR_INVALID_MESSAGE_TYPE: `This message cannot be featured onto HomeCord.\nThis could be for one of the following reasons:\n- This message was sent by a Bot/App or a Webhook\n- This message is a Discord System message\n- Or this message type is unsupported by HomeCord`,
    FEATURE_MESSAGE_COMMAND_ERROR_NO_SERVER_SETTINGS_FOUND: `This message cannot be featured due to an internal error preventing HomeCord from fetching the stored HomeCord settings for this Server.`,
    FEATURE_MESSAGE_COMMAND_ERROR_HOMECORD_IS_DISABLED: `This message cannot be featured while HomeCord is disabled in this Server.\nPlease have a Server Admin enable HomeCord via \`/settings\` if you wish to have a specialised landing page for this Server!`,
    FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_MODULE_DISABLED: `This message cannot be featured while HomeCord's Message Activity module has been disabled in this Server.\nPlease have a Server Admin enable the Message Activity module via \`/settings\` if you wish to highlight or feature standard messages to your HomeCord webpage.`,
    FEATURE_MESSAGE_COMMAND_ERROR_FORWARDS_NOT_SUPPORTED: `This message cannot be featured due to Forwarded messages not currently being supported by HomeCord at this time.`,
    FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_TOO_OLD: `This message is too old to be featured to HomeCord's webpage.`,
    FEATURE_MESSAGE_COMMAND_ERROR_AUTHOR_PRIVACY_BLOCKS_FEATURING: `This message's author has used HomeCord's \`/privacy\` Command to block their messages from being showcased to HomeCord's webpage.`,
    FEATURE_MESSAGE_COMMAND_ERROR_CHANNEL_BLOCKED: `This message cannot be featured due to being sent in a Channel or Category that has been blocked by this Server's Admins via HomeCord's \`/blocklist\` Command.`,
    FEATURE_MESSAGE_COMMAND_ERROR_ROLE_BLOCKED: `This message cannot be featured due to being sent by a User with a Role that has been blocked by this Server's Admins via use of HomeCord's \`/blocklist\` Command.`,
    FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_ALREADY_SHOWCASED: `This message is already being showcased on this Server's HomeCord page!`,
    FEATURE_MESSAGE_COMMAND_ERROR_MAX_SHOWCASED_MESSAGES_HIT: `This Server is currently at the maximum number of messages allowed to be showcased at the same time!`,
    FEATURE_MESSAGE_COMMAND_ERROR_MESSAGE_SHOWCASE_FAILED: `Something went wrong while trying to feature this message to this Server's HomeCord page...`,
    FEATURE_MESSAGE_COMMAND_ERROR_ANNOUNCEMENT_ALREADY_SHOWCASED: `This announcement is already being showcased on this Server's HomeCord page!`,
    FEATURE_MESSAGE_COMMAND_ERROR_MAX_SHOWCASED_ANNOUNCEMENTS_HIT: `This Server is currently at the maximum number of announcements allowed to be featured at the same time.\nIf this isn't an announcement, maybe try featuring it as a standard message instead.`,
    FEATURE_MESSAGE_COMMAND_ERROR_ANNOUNCEMENT_SHOWCASE_FAILED: `Something went wrong while trying to feature this announcement to this Server's HomeCord page...`,

    FEATURE_MESSAGE_COMMAND_SUCCESS_FEATURED_MESSAGE: `Successfully featured this message to this Server's HomeCord page!`,
    FEATURE_MESSAGE_COMMAND_SUCCESS_FEATURED_ANNOUNCEMENT: `Successfully featured this announcement to this Server's HomeCord page!`,
    
    FEATURE_MESSAGE_COMMAND_MODAL_TITLE: `Feature Message`,
    FEATURE_MESSAGE_COMMAND_MODAL_MESSAGE_TYPE_LABEL: `Message Feature Type`,
    FEATURE_MESSAGE_COMMAND_MODAL_MESSAGE_TYPE_DESCRIPTION: `What type of message should this message be featured as?`,
    FEATURE_MESSAGE_COMMAND_MODAL_MESSAGE_TYPE_OPTION_STANDARD: `Standard`,
    FEATURE_MESSAGE_COMMAND_MODAL_MESSAGE_TYPE_OPTION_ANNOUNCEMENT: `Announcement`,
    FEATURE_MESSAGE_COMMAND_MODAL_DURATION_LABEL: `Feature Duration`,
    FEATURE_MESSAGE_COMMAND_MODAL_DURATION_DESCRIPTION: `How long should this message be featured for?`,
    FEATURE_MESSAGE_COMMAND_MODAL_DURATION_OPTION_TWELVE_HOURS: `12 Hours`,
    FEATURE_MESSAGE_COMMAND_MODAL_DURATION_OPTION_ONE_DAY: `1 Day`,
    FEATURE_MESSAGE_COMMAND_MODAL_DURATION_OPTION_THREE_DAYS: `3 Days`,
    FEATURE_MESSAGE_COMMAND_MODAL_DURATION_OPTION_SEVEN_DAYS: `7 Days`,
}
