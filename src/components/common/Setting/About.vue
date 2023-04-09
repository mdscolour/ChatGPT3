<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NSpin } from 'naive-ui'
import { fetchChatConfig } from '@/api'

interface ConfigState {
  numberOfUsedTokens?: number
  maxTokenLimit?: number
}

const loading = ref(false)

const config = ref<ConfigState>()

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
        <p>token余额：{{ config?.numberOfUsedTokens }}/{{ config?.maxTokenLimit }}</p>
        <p>所有token都是我们从OpenAI官方全额购买，渠道正规。</p>
        <p>请放心使用。</p>
      </h2>
      <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
        <p>温馨提示：</p>
        <p>1. 若余额提前用完，可联系我们充值，或购买更大套餐。</p>
        <p>
          2. 连续聊天时，之前的问答皆会消耗token，若内容跟上文没有特别关联，建议点击左边栏位里的新建对话（New chat），
          这样token用量会少很多。
        </p>
        <p>
          3. 单条信息最大字数目前设定在800字左右(随着技术进步，上限会逐渐增加)。如果超过单条信息上限，
          会发送空信息。回复将会像是：“对不起，我需要更多信息。 你想要我做什么？“或者”我不能对空问题进行回复“，
          也有可能是英文：“Sorry, I need more information. what do you want me to do”，
          或者“I cannot reply to empty questions.”
        </p>
        <p>
          4. 多条信息大概最多能在2000字左右。超出字数前面的对话会被忽略。如果单条信息超过这个数量。
          则会收到回复“好像出错了，请稍后再试”。此时需要重新刷新浏览器。
        </p>
      </div>
      <div>
        <p>
          我们提供的是无障碍访问OpenAI聊天机器人的能力，让所有人都能无障碍使用最新的AI科技。
        </p>
      </div>
      <div class="p-2 space-y-2 rounded-md bg-neutral-100 dark:bg-neutral-700">
        <h1 class="text-xl font-bold">
          使用指南
        </h1>
        <p>
          基本上把它当作一个能处理各种文字内容的秘书。如果答案不满意，可以跟它说哪里不满意，
          或让他重新生成。（按住“shift+回车”可以换行）
        </p>

        <h2 class="text-xl font-bold">
          自动计算
        </h2>
        <blockquote>
          <p>把以下内容中像是 =xxx 里面的xxx，全部加起来。内容：（某文本）</p>
          <p>告诉我这文本里面出现了多少次“xxx”。文本是：（某文本）</p>
        </blockquote>

        <h2 class="text-xl font-bold">
          写ppt/报告/推荐信等
        </h2>
        <blockquote>
          <p>给我做一个xxx主题的ppt</p>
          <p>第2页内容给我详细展开讲。</p>
          <p>
            请按照以下主题：
            （主题）
            模仿这篇报告：
            （报告内容）
            写一篇类似的报告
          </p>
          <p>
            请按照以下要求：
            （要求）
            模仿这篇推荐信：
            （推荐信）
            写一篇推荐信
          </p>
        </blockquote>

        <h2 class="text-xl font-bold">
          协助判断
        </h2>
        <blockquote>
          <p>
            以下两个方案，你觉得哪个好，为什么？
            (方案A)
            (方案B)
          </p>
          <p>
            文章里这个地方这一段，A这么写好，还是B这么写好？
            A:(A段落)
            B:(B段落)
          </p>
        </blockquote>

        <h2 class="text-xl font-bold">
          找灵感
        </h2>
        <blockquote>
          <p>"写一个拥有出人意料结局的推理故事。"</p>
          <p>"写一个让读者参与其中的交互故事。"</p>
          <p>"为孩子们写一本激励他们勇敢面对挑战的故事。"</p>
          <p>"编写一个有关科技创新的未来世界的故事。"</p>
          <p>"创造一个让读者感到沉浸其中的幻想故事。"</p>
        </blockquote>

        <h2 class="text-xl font-bold">
          充当翻译和改进者
        </h2>
        <blockquote>
          <p>请用英语/德语/法语 跟我聊天</p>
          <p>
            我希望你能担任英语翻译、拼写校对和修辞改进的角色。我会用任何语言和你交流，你会识别语言，将其翻译并用更为优美和精炼的英语回答我。
            请将我简单的词汇和句子替换成更为优美和高雅的表达方式，确保意思不变，但使其更具文学性。
            请仅回答更正和改进的部分，不要写解释。我的第一句话是“how are you ?”，请翻译它。
          </p>
        </blockquote>

        <h2 class="text-xl font-bold">
          还有更多使用方法，欢迎大家进行探索。
        </h2>
      </div>
    </div>
  </NSpin>
</template>
