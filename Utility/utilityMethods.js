import { InteractionContextType, PermissionFlagsBits } from 'discord-api-types/v10';
import { Buffer } from 'node:buffer';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
//import { fetch } from 'undici';
import { DISCORD_TOKEN } from '../config.js';


// *******************************
//  Exports

/**
 * Helper method for seeing if an interaction was triggered in a Guild App or User App context
 * @param {import('discord-api-types/v10').APIInteraction} interaction
 * 
 * @returns {'GUILD_CONTEXT'|'USER_CONTEXT'} Context this was triggered in
 */
export function getInteractionContext(interaction) {
    if ( interaction.context === InteractionContextType.Guild ) { return 'GUILD_CONTEXT'; }
    else { return 'USER_CONTEXT'; }
}

/**
 * Converts hex colour codes into RGB numbers, since DJS Builders doesn't actually support the hex values for some reason.
 * Sourced from Stack Overflow
 * @link https://stackoverflow.com/a/5624139
 * 
 * @param {String} hex
 */
export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
}

/**
 * Converts RGB Array into an API-compatible integer for Discord's API
 * @param {Array<Number>} rgbArray
 */
export function rgbArrayToInteger(rgbArray) {
  const [red, green, blue] = rgbArray;
  let colorInteger = (red << 16) + (green << 8) + blue;
  return colorInteger;
}

/**
 * Returns a random integer within the range specified (inclusive)
 * @param {Number} minimumValue
 * @param {Number} maximumValue
 * 
 * @returns {Number}
 */
export function randomNumberInRange(minimumValue, maximumValue) {
  return Math.floor(( Math.random() * maximumValue ) + minimumValue);
}

/**
 * Returns the public locale from the interaction. Tries to return `guild_locale` if possible, otherwise returns `locale`
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * 
 * @returns {import('discord-api-types/v10').Locale}
 */
export function getInteractionLocale(interaction) {
  return interaction.guild_locale != undefined ? interaction.guild_locale : interaction.locale;
}

// Json Response Class
export class JsonResponse extends Response {
    constructor(body, init) {
        const jsonBody = JSON.stringify(body);
        init = init || {
            headers: {
                'content-type': 'application/json',
                Authorization: `Bot ${DISCORD_TOKEN}`,
            },
        };
        super(jsonBody, init);
    }
}




// ****************************************
// ANYTHING BELOW THIS LINE IS BORROWED FROM DISCORD.JS
// PURELY BECAUSE I'M NOT SMART ENOUGH TO FIGURE OUT HOW TO DO THIS MYSELF YET :sweat_smile:
// Borrowed from https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/util/DataResolver.js
// If you're one of the core maintainers of DJS and this isn't ok for me to do, feel free to (civilly & calmly) let me know!


/**
 * Data that can be resolved to give a Buffer. This can be:
 * * A Buffer
 * * The path to a local file
 * * A URL <warn>When provided a URL, discord.js will fetch the URL internally in order to create a Buffer.
 * This can pose a security risk when the URL has not been sanitized</warn>
 * @typedef {string|Buffer} BufferResolvable
 */

/**
 * @external Stream
 * @see {@link https://nodejs.org/api/stream.html}
 */

/**
 * @typedef {Object} ResolvedFile
 * @property {Buffer} data Buffer containing the file data
 * @property {string} [contentType] Content-Type of the file
 * @private
 */

/**
 * Resolves a BufferResolvable to a Buffer.
 * @param {BufferResolvable|Stream} resource The buffer or stream resolvable to resolve
 * @returns {Promise<ResolvedFile>}
 * @private
 */
async function resolveFile(resource) {
  if (Buffer.isBuffer(resource)) return { data: resource };

  if (typeof resource[Symbol.asyncIterator] === 'function') {
    const buffers = [];
    for await (const data of resource) buffers.push(Buffer.from(data));
    return { data: Buffer.concat(buffers) };
  }

  if (typeof resource === 'string') {
    if (/^https?:\/\//.test(resource)) {
      const res = await fetch(resource);
      return { data: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') };
    }

    const file = path.resolve(resource);

    const stats = await fs.stat(file);
    if (!stats.isFile()) throw new Error(`File Not Found`, file);
    return { data: await fs.readFile(file) };
  }

  throw new Error(`ReqResourceType`);
}

/**
 * Data that resolves to give a Base64 string, typically for image uploading. This can be:
 * * A Buffer
 * * A base64 string
 * @typedef {Buffer|string} Base64Resolvable
 */

/**
 * Resolves a Base64Resolvable to a Base 64 string.
 * @param {Base64Resolvable} data The base 64 resolvable you want to resolve
 * @param {string} [contentType='image/jpg'] The content type of the data
 * @returns {string}
 * @private
 */
function resolveBase64(data, contentType = 'image/jpg') {
  if (Buffer.isBuffer(data)) return `data:${contentType};base64,${data.toString('base64')}`;
  return data;
}

/**
 * Resolves a Base64Resolvable, a string, or a BufferResolvable to a Base 64 image.
 * @param {BufferResolvable|Base64Resolvable} image The image to be resolved
 * @returns {Promise<?string>}
 * @private
 */
export async function resolveImage(image) {
  if (!image) return null;
  if (typeof image === 'string' && image.startsWith('data:')) {
    return image;
  }
  const file = await resolveFile(image);
  return resolveBase64(file.data);
}
