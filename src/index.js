import Client from './Discord/Bot.ts'

const botToken = process.env.PROPLAM_BOT
const bot = new Client({ token: botToken, logs: true })

const channelId = '1168361318017925220'
const userId = '690666917328977941'

bot.dm(userId, 'test').catch((error) => {
  console.error('Error sending message:', error)
})
