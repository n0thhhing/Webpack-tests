import axios, { AxiosResponse, AxiosError } from 'axios'
import * as fs from 'fs'
import FormData from 'form-data'
import path from 'path'
import chalk from 'chalk'
import {
  WebhookUrl,
  WebhookInfoResponse,
  DiscordApiResponse,
  EmbedObject,
} from './Types'

class WebhookUtils {
  private webhookUrl: WebhookUrl

  /**
   * Constructor for WebhookUtils class
   *
   * @param {string} hook - The Discord webhook URL
   */
  constructor(hook: string) {
    if (!hook) throw new Error('No webhook URL provided')
    this.webhookUrl = hook
  }

  /**
   * Sets the rate limit of the webhook
   *
   * @param {number} rateLimitPerUser - The rate limit of the webhook
   * @returns {Promise<void>}
   */
  private async setRateLimit(rateLimitPerUser: number): Promise<void> {
    try {
      await axios.patch<void>(this.webhookUrl, {
        rate_limit_per_user: rateLimitPerUser,
      })
    } catch (error) {
      console.log((error as AxiosError).message)
    }
  }

  /**
   * Sets the owner of the webhook
   *
   * @param {string} userID - The ID of the new owner
   * @returns {Promise<void>}
   */
  private async setWebhookOwner(userID: string): Promise<void> {
    await axios.patch<void>(this.webhookUrl, { owner_id: userID })
  }

  /**
   * Sends a message with a file to the Discord channel
   *
   * @param {string} message - The message content
   * @param {string} filePath - The path to the file
   * @returns {Promise<void>}
   */
  async sendFile(message: string, filePath: string): Promise<void> {
    try {
      const fileData = fs.readFileSync(filePath)
      const fileName = path.basename(filePath)
      const fileStats = fs.statSync(filePath)
      const fileSizeInBytes = fileStats.size
      const fileSizeInKb = fileSizeInBytes / 1024

      console.log(
        `File size: ` +
          chalk.red(`${fileSizeInBytes}`) +
          ` bytes (` +
          chalk.red(`${fileSizeInKb}`) +
          ` KB)`,
      )

      const formData = new FormData()
      formData.append('file', fileData, { filename: fileName })
      formData.append('content', message)

      const response = await axios.post<DiscordApiResponse>(
        this.webhookUrl,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        },
      )

      console.log(
        `Webhook status: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error) {
      console.error(
        `Error sending file to Discord: ` +
          chalk.red(`${(error as AxiosError).message}`),
      )
    }
  }

  /**
   * Sends a message to the Discord channel
   *
   * @param {string} message - The message content
   * @returns {Promise<void>}
   */
  async sendMessage(message: string): Promise<void> {
    try {
      const response = await axios.post<DiscordApiResponse>(this.webhookUrl, {
        content: message,
      })

      console.log(
        `Message sent successfully. Status: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error) {
      console.error(
        `Error sending message. Status: ` +
          chalk.red(`${(error as AxiosError).message}`),
      )
    }
  }

  /**
   * Updates the webhook with a new profile picture and name
   *
   * @param {string} imagePath - The path to the new image
   * @param {string} newName - The new name for the webhook
   * @returns {Promise<void>}
   */
  async updateWebhook(imagePath: string, newName: string): Promise<void> {
    const image = fs.readFileSync(imagePath)

    try {
      await axios.patch<void>(this.webhookUrl, {
        avatar: `data:image/jpeg;base64,${image.toString('base64')}`,
      })

      await axios.patch<void>(this.webhookUrl, {
        name: newName,
      })

      console.log('Webhook updated successfully!')
    } catch (error) {
      console.error('Error updating webhook:', error)
    }
  }

  /**
   * Deletes a message from the Discord channel by message ID
   *
   * @param {string} messageId - The ID of the message to be deleted
   * @returns {Promise<void>}
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const response = await axios.delete<DiscordApiResponse>(
        `${this.webhookUrl}/messages/${messageId}`,
      )

      console.log(
        `Message deleted: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error) {
      console.error(
        `Error deleting message: ` +
          chalk.red(`${(error as AxiosError).message}`),
      )
    }
  }

  /**
   * Sends a simple embed with specified content to the Discord channel
   *
   * @param {string} content - The content of the embed
   * @returns {Promise<void>}
   */
  async sendSimpleEmbed(content: string): Promise<void> {
    try {
      const simpleEmbed: EmbedObject = {
        description: content,
      }

      const response = await axios.post<DiscordApiResponse>(this.webhookUrl, {
        embeds: [simpleEmbed],
      })

      console.log(
        `Simple embed sent: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error) {
      console.error(
        `Error sending simple embed: ` +
          chalk.red(`${(error as AxiosError).message}`),
      )
    }
  }

  /**
   * Deletes all messages from the Discord channel (requires MANAGE_WEBHOOKS permission)
   *
   * @returns {Promise<void>}
   */
  async deleteAllMessages(): Promise<void> {
    try {
      const response = await axios.delete<DiscordApiResponse>(this.webhookUrl)

      console.log(
        `All messages deleted: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error) {
      console.error(
        `Error deleting all messages: ` +
          chalk.red(`${(error as AxiosError).message}`),
      )
    }
  }

  /**
   * Fetches information about the webhook itself
   *
   * @returns {Promise<WebhookInfoResponse>}
   */
  async info(): Promise<WebhookInfoResponse> {
    try {
      const response = await axios.get<WebhookInfoResponse>(this.webhookUrl)

      console.log(
        `Webhook information fetched: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )

      return response.data
    } catch (error) {
      console.error(
        `Error fetching webhook information: ` +
          chalk.red(`${(error as AxiosError).message}`),
      )
      throw error
    }
  }

  /**
   * Sends multiple embeds in a single message to the Discord channel
   *
   * @param {EmbedObject[]} embedArray - Array of embed objects
   * @returns {Promise<void>}
   */
  async sendMultipleEmbeds(embedArray: EmbedObject[]): Promise<void> {
    try {
      const response = await axios.post<DiscordApiResponse>(this.webhookUrl, {
        embeds: embedArray,
      })

      console.log(
        `Multiple embeds sent in a single message: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error) {
      console.error(
        `Error sending multiple embeds: ` +
          chalk.red(`${(error as AxiosError).message}`),
      )
    }
  }
}

export default WebhookUtils
