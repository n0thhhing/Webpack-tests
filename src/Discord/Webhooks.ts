import axios, { AxiosResponse } from 'axios'
import * as fs from 'fs'
import FormData from 'form-data'
import path from 'path'
import chalk from 'chalk'
import { WebhookUrl } from './Types'

/**
 * Discord Webhook Client
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook} - For webhook documentation
 * @see {@link} - For documentation about these specific functions
 */
class WebhookUtils {
  private webhookUrl: WebhookUrl

  /**
   * Constructor for ProplamWebhook class
   *
   * @param {WebhookUrl} hook - The Discord webhook URL
   */
  constructor(hook: WebhookUrl) {
    if (!hook) throw new Error('No webhook URL provided')
    this.webhookUrl = hook
  }

  /**
   * Sets the rate limit of the webhook
   *
   * @param {number} rateLimitPerUser - The rate limit of the webhook
   * @returns {Promise<void>}
   */
  private setRateLimit(rateLimitPerUser: number): void {
    try {
      axios.patch(this.webhookUrl, { rate_limit_per_user: rateLimitPerUser })
    } catch (error: any) {
      console.log(error)
    }
  }

  /**
   * Sets the owner of the webhook
   *
   * @param {string} userID - The ID of the new owner
   */
  private setWebhookOwner(userID: string): void {
    axios.patch(this.webhookUrl, { owner_id: userID })
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

      const response = await axios.post(this.webhookUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      })

      console.log(
        `Webhook status: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error: any) {
      console.error(
        `Error sending file to Discord: ` + chalk.red(`${error.message}`),
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
    axios
      .post(this.webhookUrl, { content: message })
      .then((response) => {
        console.log('Message sent successfully. Status:', response.status)
      })
      .catch((error) => {
        console.error('Error sending message. Status:', error.response.status)
      })
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
      await axios.patch(this.webhookUrl, {
        avatar: `data:image/jpeg;base64,${image.toString('base64')}`,
      })

      await axios.patch(this.webhookUrl, {
        name: newName,
      })

      console.log('Webhook updated successfully!')
    } catch (error: any) {
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
      const response = await axios.delete(
        `${this.webhookUrl}/messages/${messageId}`,
      )

      console.log(
        `Message deleted: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error: any) {
      console.error(`Error deleting message: ` + chalk.red(`${error.message}`))
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
      const simpleEmbed = {
        description: content,
      }

      const response = await axios.post(this.webhookUrl, {
        embeds: [simpleEmbed],
      })

      console.log(
        `Simple embed sent: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error: any) {
      console.error(
        `Error sending simple embed: ` + chalk.red(`${error.message}`),
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
      const response = await axios.delete(this.webhookUrl)

      console.log(
        `All messages deleted: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error: any) {
      console.error(
        `Error deleting all messages: ` + chalk.red(`${error.message}`),
      )
    }
  }

  /**
   * Fetches information about the webhook itself
   *
   * @returns {Promise<void>}
   */
  async info(): Promise<void> {
    try {
      const response = await axios.get(this.webhookUrl)

      console.log(
        `Webhook information fetched: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
      console.log('======================================')
      console.log(response.data)
      console.log('======================================')
    } catch (error: any) {
      console.error(
        `Error fetching webhook information: ` + chalk.red(`${error.message}`),
      )
    }
  }

  /**
   * Sends multiple embeds in a single message to the Discord channel
   *
   * @param {object[]} embedArray - Array of embed objects
   * @returns {Promise<void>}
   */
  async sendMultipleEmbeds(embedArray: object[]): Promise<void> {
    try {
      const response = await axios.post(this.webhookUrl, {
        embeds: embedArray,
      })

      console.log(
        `Multiple embeds sent in a single message: ` +
          chalk.blue(`${response.status}`) +
          ` - ` +
          chalk.red(`${response.statusText}`),
      )
    } catch (error: any) {
      console.error(
        `Error sending multiple embeds: ` + chalk.red(`${error.message}`),
      )
    }
  }
}

export default WebhookUtils
