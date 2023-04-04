import fs from 'fs'
// import path from 'path'
import express from 'express'
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

router.post('/apiaaaaa/reset_token_counter', async (req, res) => {
  try {
    const { password } = req.body

    if (!password || password !== process.env.RESET_PASSWORD)
      return res.status(401).json({ message: 'Incorrect password.' })

    // const configPath = path.resolve(__dirname, 'config', 'config.json')
    // const configFile = fs.readFileSync(configPath)
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

router.get('/apiaaaaa/token_counter', async (_, res) => {
  try {
  // const configPath = path.resolve(__dirname, 'config', 'config.json')
  // const configFile = fs.readFileSync(configPath)
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
  const maxToken = process.env.MAX_TOKEN_LIMIT
  // const configPath = path.resolve(__dirname, 'config', 'config.json')
  // const configFile = fs.readFileSync(configPath)
  const configFile = fs.readFileSync('./src/config/config.json')

  const config = JSON.parse(configFile.toString())

  try {
    if (maxToken <= config.numberOfUsedTokens)
      throw new Error('额度已用完')

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
    // console.log('Encoded prompt length:', prompt.length)
    config.numberOfUsedTokens += prompt.length
    // fs.writeFileSync(configPath, JSON.stringify(config))
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
