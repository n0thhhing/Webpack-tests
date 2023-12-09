import Client from './Discord/Bot.ts'
import { token } from '../config/config.json'

const botToken = token
const bot = new Client(botToken, true)

const channelId = '1168361318017925220'
const userId = '690666917328977941'

bot.dm(userId, 'test').catch((error) => {
  console.error('Error sending message:', error)
})
