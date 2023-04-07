import fs from 'fs'
import express from 'express'
import { encode } from 'gpt-3-encoder'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

class CustomError extends Error {
  errorCode: string

  constructor(errorCode: string, message: string) {
    super(message)
    this.errorCode = errorCode
    this.name = 'CustomError'
  }
}

function findConnectedText(dataSources, parentMessageId) {
  if (parentMessageId === null)
    return null

  const connectedText = []
  let currentMessage = dataSources.find(
    message => message.conversationOptions && message.conversationOptions.parentMessageId === parentMessageId,
  )

  while (currentMessage) {
    connectedText.push(currentMessage.text)
    connectedText.push(currentMessage.requestOptions.prompt)
    currentMessage = dataSources.find(
      message => message.conversationOptions && message.conversationOptions.parentMessageId === currentMessage.requestOptions.options.parentMessageId,
    )
  }

  return connectedText
}

router.post('/apiaaaaa/reset_token_counter', async (req, res) => {
  try {
    const { password } = req.body

    if (!password || password !== process.env.RESET_PASSWORD)
      return res.status(401).json({ message: 'Incorrect password.' })

    const configFile = fs.readFileSync('./src/config/config.json')
    const config = JSON.parse(configFile.toString())

    // Reset the token counter
    config.numberOfUsedTokens = 0

    // Save the updated config back to the file
    fs.writeFileSync('./src/config/config.json', JSON.stringify(config))

    res.status(200).json({ message: 'Token counter has been reset.' })
  }
  catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/apiaaaaa/update_max_token_limit', async (req, res) => {
  try {
    const { password, newMaxTokenLimit } = req.body

    if (!password || password !== process.env.RESET_PASSWORD)
      return res.status(401).json({ message: 'Incorrect password.' })

    if (!newMaxTokenLimit || typeof newMaxTokenLimit !== 'number')
      return res.status(400).json({ message: 'Invalid max token limit value.' })

    const configFile = fs.readFileSync('./src/config/config.json')
    const config = JSON.parse(configFile.toString())

    // Update the max token limit
    config.maxTokenLimit = newMaxTokenLimit

    // Save the updated config back to the file
    fs.writeFileSync('./src/config/config.json', JSON.stringify(config))

    res.status(200).json({ message: 'Max token limit has been updated.' })
  }
  catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/apiaaaaa/token_counter', async (_, res) => {
  try {
    const configFile = fs.readFileSync('./src/config/config.json')
    const config = JSON.parse(configFile.toString())

    res.status(200).json({ tokenCounter: config.numberOfUsedTokens })
  }
  catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')
  const configFile = fs.readFileSync('./src/config/config.json')

  const config = JSON.parse(configFile.toString())

  const maxToken = config.maxTokenLimit

  try {
    if (maxToken <= config.numberOfUsedTokens)
      // throw { errorCode: 'TOKEN_LIMIT_REACHED' }
      throw new CustomError('TOKEN_LIMIT_REACHED', '额度已用完')

    const { prompt, options = {}, systemMessage } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
    })

    const connectedText = findConnectedText(options.dataSources, options.parentMessageId)

    const encoded1 = encode(prompt).length
    const encoded2 = encode(connectedText.join(', ')).length

    config.numberOfUsedTokens += encoded1 + encoded2
    fs.writeFileSync('./src/config/config.json', JSON.stringify(config))
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
