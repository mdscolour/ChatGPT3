<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NSpin } from 'naive-ui'
import { fetchChatConfig } from '@/api'
import pkg from '@/../package.json'
import { useAuthStore } from '@/store'

interface ConfigState {
  timeoutMs?: number
  reverseProxy?: string
  apiModel?: string
  socksProxy?: string
  httpsProxy?: string
  balance?: string
}

const authStore = useAuthStore()

const loading = ref(false)

const config = ref<ConfigState>()

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-4">
      <h2 class="text-xl font-bold">
        Version - {{ pkg.version }}
      </h2>
      <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
        <p>
          本站提供的是访问OPENAI研发的CHATGPT聊天机器人的能力，解决在中国访问CHATGPT服务困难的问题。
          如有多人访问，可能会出现Error，此时请等待或者刷新浏览器。
        </p>

        <h2 class="text-xl font-bold">
          使用指南
        </h2>

        <h3>写小说</h3>
        <blockquote>
          <p>"写一本拥有出人意料结局的推理小说。"</p>
          <p>"写一个让读者参与其中的交互小说。"</p>
          <p>"为孩子们写一本激励他们勇敢面对挑战的小说。"</p>
          <p>"编写一个有关科技创新的未来世界的小说。"</p>
          <p>"创造一个让读者感到沉浸其中的幻想故事。"</p>
        </blockquote>

        <h3>充当 Linux 终端</h3>
        <blockquote>
          <p>我想让你充当 Linux 终端。我将输入命令，您将回复终端应显示的内容。我希望您只在一个唯一的代码块内回复终端输出，而不是其他任何内容。不要写解释。除非我指示您这样做，否则不要键入命令。当我需要用英语告诉你一些事情时，我会把文字放在中括号内[就像这样]。我的第一个命令是 pwd</p>
        </blockquote>

        <h3>充当英语翻译和改进者</h3>
        <blockquote>
          <p>替代：语法，谷歌翻译</p>
          <p>我希望你能担任英语翻译、拼写校对和修辞改进的角色。我会用任何语言和你交流，你会识别语言，将其翻译并用更为优美和精炼的英语回答我。请将我简单的词汇和句子替换成更为优美和高雅的表达方式，确保意思不变，但使其更具文学性。请仅回答更正和改进的部分，不要写解释。我的第一句话是“how are you ?”，请翻译它。</p>
        </blockquote>

        <h3>充当英翻中</h3>
        <blockquote>
          <p>下面我让你来充当翻译家，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。请翻译下面这句话：“how are you ?”</p>
        </blockquote>

        <h3>充当英英词典(附中文解释)</h3>
        <blockquote>
          <p>将英文单词转换为包括中文翻译、英文释义和一个例句的完整解释。请检查所有信息是否准确，并在回答时保持简洁，不需要任何其他反馈。第一个单词是“Hello”</p>
        </blockquote>

        <h3>充当前端智能思路助手</h3>
        <blockquote>
          <p>替代：百度、谷歌人工搜索</p>
          <p>我想让你充当前端开发专家。我将提供一些关于Js、Node等前端代码问题的具体信息，而你的工作就是想出为我解决问题的策略。这可能包括建议代码、代码逻辑思路策略。我的第一个请求是“我需要能够动态监听某个元素节点距离当前电脑设备屏幕的左上角的X和Y轴，通过拖拽移动位置浏览器窗口和改变大小浏览器窗口。”</p>
        </blockquote>
      </div>
      <p>{{ $t("setting.api") }}：{{ config?.apiModel ?? '-' }}</p>
      <p v-if="isChatGPTAPI">
        {{ $t("setting.balance") }}：{{ config?.balance ?? '-' }}
      </p>
      <p v-if="!isChatGPTAPI">
        {{ $t("setting.reverseProxy") }}：{{ config?.reverseProxy ?? '-' }}
      </p>
      <p>{{ $t("setting.timeout") }}：{{ config?.timeoutMs ?? '-' }}</p>
      <p>{{ $t("setting.socks") }}：{{ config?.socksProxy ?? '-' }}</p>
      <p>{{ $t("setting.httpsProxy") }}：{{ config?.httpsProxy ?? '-' }}</p>
    </div>
  </NSpin>
</template>
