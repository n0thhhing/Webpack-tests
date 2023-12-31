import axios, { AxiosResponse, AxiosError } from 'axios'
import chalk from 'chalk'
import type {
  BotToken,
  UserResponse,
  GuildResponse,
  RequestData,
  DiscordApiResponse,
} from './Types'
import * as fs from 'fs'

/**
 * DiscordBot class for interacting with the Discord API.
 *
 * @param {BotToken} token - Discord bot token.
 * @param {boolean} logs - Specification of logs.
 */
class Client {
  private token: BotToken
  private logging: boolean

  constructor(token: BotToken, logs: boolean = false) {
    this.token = token
    this.sendMessage = this.sendMessage.bind(this)
    this.logging = logs
    if (this.logging === true) {
    } else if (this.logging === false) {
      console.log(
        `${chalk.blue('LOGS')} - logs are enabled by default
     if you would like to disable logs, set
     "${chalk.blue('log') + `: ` + chalk.red('false')}"
     in the ${chalk.blue('Client')} constructor\n`,
      )
      this.logging = true
    }
  }

  /**
   * Generic method for making requests to the Discord API.
   *
   * @param {string} endpoint - The API endpoint.
   * @param {"get" | "post" | "put" | "delete" | "patch"} method - The HTTP method.
   * @param {RequestData} data - The data to be sent in the request body (optional).
   * @returns {any} - A promise that resolves to the API response data.
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    data?: RequestData,
  ): Promise<T> {
    const headers = {
      Authorization: `Bot ${this.token}`,
      'Content-Type': 'application/json',
    }

    try {
      const response: AxiosResponse<T> = await axios({
        method,
        url: `https://discord.com/api/v10${endpoint}`,
        data,
        headers,
      })

      if (response) {
        if (this.logging) {
          console.log(`response sent to endpoint: ${chalk.green(endpoint)}`)
        }
      }
      return response.data
    } catch (error: unknown | any) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Discord API Error:',
          error.response?.data || error.message,
        )
      } else {
        console.error('Axios Error:', error.message)
      }
      throw error
    }
  }
  /**
   * Sends a message to a Discord channel.
   *
   * @param {string} channelId - The ID of the channel.
   * @param {string} content - The content of the message.
   * @returns {any} - A promise that resolves to the sent message.
   */
  public async sendMessage(channelId: any, content: string): Promise<any> {
    const data = {
      content,
    }

    return this.makeRequest(`/channels/${channelId}/messages`, 'post', data)
  }

  /**
   * Retrieves information about a Discord user.
   *
   * @param {string} userId - The ID of the user.
   * @returns {UserResponse} - A promise that resolves to the user data.
   */
  public async getUser(userId: string): Promise<UserResponse> {
    return this.makeRequest(`/users/${userId}`, 'get')
  }

  /**
   * Retrieves information about a Discord guild.
   *
   * @param {string} guildId - The ID of the guild.
   * @returns {GuildResponse} - A promise that resolves to the guild data.
   */
  public async getGuild(guildId: string): Promise<GuildResponse> {
    return this.makeRequest(`/guilds/${guildId}`, 'get')
  }

  /**
   * Creates a new channel in a Discord guild.
   *
   * @param {string} guildId - The ID of the guild.
   * @param {string} name - The name of the channel.
   * @param {"text" | "voice"} type - The type of the channel.
   * @returns {any} - A promise that resolves to the created channel data.
   */
  public async createChannel(
    guildId: string,
    name: string,
    type: 'text' | 'voice',
  ): Promise<any> {
    const data = {
      name,
      type,
    }

    return this.makeRequest(`/guilds/${guildId}/channels`, 'post', data)
  }

  /**
   * Kicks a member from a Discord guild.
   *
   * @param {string} guildId - The ID of the guild.
   * @param {string} userId - The ID of the user to be kicked.
   * @returns {any} - A promise that resolves when the user is kicked.
   */
  public async kickMember(guildId: string, userId: string): Promise<any> {
    return this.makeRequest(`/guilds/${guildId}/members/${userId}`, 'delete')
  }

  /**
   * Retrieves messages from a Discord channel.
   *
   * @param {string} channelId - The ID of the channel.
   * @returns {any} - A promise that resolves to an array of messages.
   */
  public async getChannelMessages(channelId: string): Promise<any> {
    return this.makeRequest(`/channels/${channelId}/messages`, 'get')
  }

  /**
   * Adds a reaction to a Discord message.
   *
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} emoji - The emoji to be added as a reaction.
   * @returns {any} - A promise that resolves when the reaction is added.
   */
  public async addReaction(
    channelId: string,
    messageId: string,
    emoji: string,
  ): Promise<any> {
    return this.makeRequest(
      `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(
        emoji,
      )}/@me`,
      'put',
    )
  }

  /**
   * Removes a reaction from a Discord message.
   *
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} emoji - The emoji to be removed.
   * @param {string} userId - The ID of the user who added the reaction.
   * @returns {any} - A promise that resolves when the reaction is removed.
   */
  public async removeReaction(
    channelId: string,
    messageId: string,
    emoji: string,
    userId: string,
  ): Promise<any> {
    return this.makeRequest(
      `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(
        emoji,
      )}/${userId}`,
      'delete',
    )
  }

  /**
   * Edits the content of a Discord message.
   *
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message.
   * @param {string} content - The new content of the message.
   * @returns {any} - A promise that resolves to the edited message.
   */
  public async editMessage(
    channelId: string,
    messageId: string,
    content: string,
  ): Promise<any> {
    const data = {
      content,
    }

    return this.makeRequest(
      `/channels/${channelId}/messages/${messageId}`,
      'put',
      data,
    )
  }

  /**
   * Retrieves members of a Discord guild.
   *
   * @param {string} guildId - The ID of the guild.
   * @returns {any} - A promise that resolves to an array of guild members.
   */
  public async getMembers(guildId: string): Promise<any> {
    return this.makeRequest(`/guilds/${guildId}/members`, 'get')
  }
  /**
   * Deletes a message in a Discord channel.
   *
   * @param {string} channelId - The ID of the channel.
   * @param {string} messageId - The ID of the message to delete.
   * @returns {void} - A promise that resolves when the message is deleted.
   */
  public async deleteMessage(
    channelId: string,
    messageId: string,
  ): Promise<void> {
    return this.makeRequest(
      `/channels/${channelId}/messages/${messageId}`,
      'delete',
    )
  }

  /**
   * Edits the settings of a role in a Discord guild.
   *
   * @param {string} guildId - The ID of the guild.
   * @param {string} roleId - The ID of the role.
   * @param {any} data - The new data for the role.
   * @returns {any} - A promise that resolves to the edited role
   */
  public async editRole(
    guildId: string,
    roleId: string,
    data: any,
  ): Promise<any> {
    return this.makeRequest(`/guilds/${guildId}/roles/${roleId}`, 'patch', data)
  }
  /**
   * Retrieves information about the bot itself.
   *
   * @returns {any} - A promise that resolves to the bot's user data.
   */
  public async info(): Promise<any> {
    return this.makeRequest(`/users/@me`, 'get')
  }

  /**
   * Leaves a guild that the bot is a member of.
   *
   * @param {string} guildId - The ID of the guild to leave.
   * @returns {any} - A promise that resolves when the bot leaves the guild.
   */
  public async leaveGuild(guildId: string): Promise<any> {
    return this.makeRequest(`/users/@me/guilds/${guildId}`, 'delete')
  }

  async isDmOpen(userId: string): Promise<string | null> {
    try {
      const response = await axios.get(
        `https://discord.com/api/v9/users/@me/channels`,
        {
          headers: {
            Authorization: `Bot ${this.token}`,
          },
        },
      )

      const dmChannel = await response.data.find(
        (channel: any) =>
          channel.type === 1 && channel.recipients[0].id === userId,
      )
      return dmChannel ? dmChannel.id : null
    } catch (error: any) {
      console.error('Error checking DM:', error.response?.data || error.message)
      throw error
    }
  }

  /**
   * dms a user
   *
   * @param {string} userId - The ID of the user to DM
   * @param {string} message - The message to send to the user
   * @returns {any} - A promise that resolves when the message is sent
   */
  async dm(userId: string, message: string): Promise<any> {
    try {
      const user = await this.openOrGetDm(userId)
      this.sendMessage(user, message)
    } catch (error: any) {
      console.log(error)
    }
  }

  /**
   * opens or retrieves a dm with a user
   *
   * @param {string} userId - The ID of the user to DM
   * @returns {string | null} - A promise that resolves to the DM channel
   */
  async openOrGetDm(userId: string): Promise<string | null> {
    try {
      const existingChannelId = await this.isDmOpen(userId)

      if (existingChannelId) {
        return existingChannelId
      }

      const response = await axios.post(
        `https://discord.com/api/v9/users/@me/channels`,
        { recipient_id: userId },
        {
          headers: {
            Authorization: `Bot ${this.token}`,
          },
        },
      )

      const channelId = response.data.id
      return channelId
    } catch (error: any) {
      console.error('Error opening DM:', error.response?.data || error.message)
      throw error
    }
  }

  public async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(response.data, 'binary')
  }
  /**
   * creates a webhook
   *
   * @param {string} channelId - The ID of the channel to create the webhook in
   * @param {string} name - The name of the webhook
   * @param {string} avatar - The avatar of the webhook
   * @returns {any} - A promise that resolves to the webhook
   */
  async createWebhook(
    channelId: string,
    webhookName: string,
    webhookImage: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `https://discord.com/api/v9/channels/${channelId}/webhooks`,
        { name: webhookName, avatar: webhookImage },
        {
          headers: {
            Authorization: `Bot ${this.token}`,
          },
        },
      )

      const webhook = response.data
      if (this.logging) console.log('Webhook created successfully:', webhook)

      console.log(
        'Webhook URL:',
        `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`,
      )

      return webhook
    } catch (error: any) {
      console.error('Error creating webhook:', error.response.data)
      return null
    }
  }

  /**
   * deletes a webhook
   *
   * @param {string} webhookId - The ID of the webhook to delete
   * @returns {any} - A promise that resolves to the deleted webhook
   */
  async deleteWebhook(webhookId: string): Promise<any> {
    try {
      await axios.delete(`https://discord.com/api/v9/webhooks/${webhookId}`, {
        headers: {
          Authorization: `Bot ${this.token}`,
        },
      })
      if (this.logging)
        console.log(`Webhook deleted successfully: ${webhookId}`)
    } catch (error: any) {
      console.error('Error deleting webhook:', error.response.data)
    }
  }
}

export default Client

const s = new Client('', true)

s.getUser
