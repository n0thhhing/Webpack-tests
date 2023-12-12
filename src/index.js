import Client from './Discord/Bot.ts'
import { token } from '../config/config.json'

const botToken = token
const bot = new Client(botToken, true)

const channelId = '1168361318017925220'
const userId = '690666917328977941'

bot.dm(userId, 'test').catch((error) => {
  console.error('Error sending message:', error)
})

bot.downloadImage(
  'https://media.discordapp.net/attachments/1137570160417443902/1183933161089015858/wIR8FOoq.jpg',
)

const response = bot.getConnections()
console.log(response.data)
