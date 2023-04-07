import type { ChatMessage } from 'chatgpt'

export interface RequestOptions {
  message: string
  lastContext?: { conversationId?: string; parentMessageId?: string; dataSources?: Chat.Chat[] }
  process?: (chat: ChatMessage) => void
  systemMessage?: string
}
