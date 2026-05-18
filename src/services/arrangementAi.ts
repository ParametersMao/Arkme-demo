export type ArrangementAiSource = "self" | "private" | "group";
export type ArrangementAiTimeKind = "strong" | "weak";
export type ArrangementAiCapsuleMode = "auto" | "suggestion" | "private";

export type ArrangementAiMessage = {
  id: string;
  role: string;
  content: string;
  sentAt: number;
  source: ArrangementAiSource;
};

export type ArrangementAiCandidate = {
  id: string;
  title: string;
  note: string;
  timeKind: ArrangementAiTimeKind;
  dueAt: number | null;
  endAt: number | null;
  weakTimeLabel: string;
  location: string;
  people: string;
  source: ArrangementAiSource;
  capsuleMode: ArrangementAiCapsuleMode;
  confidence: number;
  reason: string;
  contextMessages: ArrangementAiMessage[];
};

export type ArrangementAiExtractionResult = {
  model: string;
  generatedAt: number;
  summary: string;
  candidates: ArrangementAiCandidate[];
};

export type ArrangementAiProviderOptions = {
  apiKey?: string;
  model?: string;
  useMock?: boolean;
};

export const arrangementAiApiKeyStorageKey = "arkme-demo.deepseekApiKey";
export const defaultArrangementAiModel = "deepseek-v4-flash";

const hour = 1000 * 60 * 60;
const minute = 1000 * 60;

export const demoArrangementAiMessages: ArrangementAiMessage[] = [
  {
    id: "mock-private-items-1",
    role: "对象",
    content: "12点帮我把包带到公司来",
    sentAt: Date.now() - minute * 38,
    source: "private",
  },
  {
    id: "mock-private-items-2",
    role: "对象",
    content: "还有一支某某品牌的口红也带一下",
    sentAt: Date.now() - minute * 36,
    source: "private",
  },
  {
    id: "mock-private-items-3",
    role: "对象",
    content: "再带把伞，下午可能下雨",
    sentAt: Date.now() - minute * 34,
    source: "private",
  },
  {
    id: "mock-private-pickup-1",
    role: "对象",
    content: "下午6点来接我下班吧",
    sentAt: Date.now() - minute * 30,
    source: "private",
  },
  {
    id: "mock-group-permission-1",
    role: "张三",
    content: "@毛远亮 这周把群聊安排识别的权限规则再梳理一下",
    sentAt: Date.now() - hour * 2,
    source: "group",
  },
  {
    id: "mock-group-permission-2",
    role: "毛远亮",
    content: "没问题，交给我，我先整理管理员和普通成员的可见范围",
    sentAt: Date.now() - hour * 2 + minute * 2,
    source: "group",
  },
];

export async function extractArrangementsFromMessages(
  messages: ArrangementAiMessage[] = demoArrangementAiMessages,
  options: ArrangementAiProviderOptions = {}
): Promise<ArrangementAiExtractionResult> {
  if (options.apiKey && !options.useMock) {
    return extractArrangementsWithDeepSeek(messages, options);
  }

  return extractMockArrangementsFromMessages(messages);
}

async function extractMockArrangementsFromMessages(
  messages: ArrangementAiMessage[] = demoArrangementAiMessages
): Promise<ArrangementAiExtractionResult> {
  const currentTime = Date.now();
  const noonTomorrow = new Date(currentTime + hour * 24);
  noonTomorrow.setHours(12, 0, 0, 0);
  const pickupTomorrow = new Date(currentTime + hour * 24);
  pickupTomorrow.setHours(18, 0, 0, 0);

  const privateItemMessages = messages.filter((message) =>
    ["mock-private-items-1", "mock-private-items-2", "mock-private-items-3"].includes(message.id)
  );
  const pickupMessages = messages.filter((message) => message.id === "mock-private-pickup-1");
  const groupMessages = messages.filter((message) => message.source === "group");

  return {
    model: "mock-arrangement-extractor-v1",
    generatedAt: currentTime,
    summary:
      "模拟 AI 已从 6 条对话中识别出 3 个安排：连续补充的带东西消息被合并，接人下班被拆成独立日程，群聊中认领的权限规则进入个人安排。",
    candidates: [
      {
        id: "mock-candidate-items",
        title: "给对象带包、口红和伞到公司",
        note: "AI 将同一段连续对话中的补充物品合并为一条“带东西”安排。",
        timeKind: "strong",
        dueAt: noonTomorrow.getTime(),
        endAt: noonTomorrow.getTime() + hour,
        weakTimeLabel: "",
        location: "对象公司",
        people: "对象",
        source: "private",
        capsuleMode: "private",
        confidence: 0.93,
        reason: "多条连续私聊都在补充同一个带东西任务，语义目标一致。",
        contextMessages: privateItemMessages,
      },
      {
        id: "mock-candidate-pickup",
        title: "下午6点接对象下班",
        note: "AI 将“接下班”识别为新的明确日程，而不是继续合并到带东西安排。",
        timeKind: "strong",
        dueAt: pickupTomorrow.getTime(),
        endAt: null,
        weakTimeLabel: "",
        location: "对象公司",
        people: "对象",
        source: "private",
        capsuleMode: "private",
        confidence: 0.89,
        reason: "动作、时间和执行目标都与带东西不同，应拆成独立安排。",
        contextMessages: pickupMessages,
      },
      {
        id: "mock-candidate-group-permission",
        title: "整理群聊安排识别的权限规则",
        note: "AI 识别到群聊中 @ 到自己，并且用户回复认领，因此并入个人安排。",
        timeKind: "weak",
        dueAt: null,
        endAt: null,
        weakTimeLabel: "这周找一段完整时间",
        location: "",
        people: "张三、毛远亮",
        source: "group",
        capsuleMode: "auto",
        confidence: 0.86,
        reason: "群聊任务被明确 @，且用户回复“交给我”，满足认领条件。",
        contextMessages: groupMessages,
      },
    ],
  };
}

async function extractArrangementsWithDeepSeek(
  messages: ArrangementAiMessage[],
  options: ArrangementAiProviderOptions
): Promise<ArrangementAiExtractionResult> {
  const currentTime = Date.now();
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || defaultArrangementAiModel,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "你是一个安排识别器。只从对话中抽取和用户本人后续行动相关的安排。连续补充同一目标的消息要合并；动作、地点、时间或目标不同的事项要拆分。群聊中只有明确 @ 用户、管理员分配给用户、或用户回复认领的事项才归到用户名下。只输出 JSON，不要输出 Markdown。",
        },
        {
          role: "user",
          content: buildDeepSeekExtractionPrompt(currentTime, messages),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`DeepSeek API 请求失败：${response.status} ${detail}`);
  }

  const payload = await response.json();
  const text = extractDeepSeekResponseText(payload);
  const parsed = JSON.parse(text) as Omit<ArrangementAiExtractionResult, "model" | "generatedAt">;

  return {
    model: options.model || defaultArrangementAiModel,
    generatedAt: currentTime,
    summary: parsed.summary,
    candidates: parsed.candidates.map((candidate, index) =>
      normalizeAiCandidate(candidate, index, messages)
    ),
  };
}

function buildDeepSeekExtractionPrompt(currentTime: number, messages: ArrangementAiMessage[]) {
  return JSON.stringify({
    task: "extract_arrangements",
    outputSchema: {
      summary: "string",
      candidates: [
        {
          id: "string",
          title: "string",
          note: "string",
          timeKind: "strong | weak",
          dueAt: "number|null, Unix ms timestamp. If timeKind is weak, use null.",
          endAt: "number|null, Unix ms timestamp",
          weakTimeLabel: "string",
          location: "string",
          people: "string",
          source: "self | private | group",
          capsuleMode: "auto | suggestion | private",
          confidence: "number 0-1",
          reason: "string",
          contextMessages: "array of original message objects related to this arrangement",
        },
      ],
    },
    rules: [
      "强时间表示有明确 DDL、具体时刻或时间段；弱时间表示只有大致时间或待定。",
      "同一段连续对话里围绕同一目标追加的信息要合并为同一条安排。",
      "动作、地点、时间或目标不同的事项要拆分为不同安排。",
      "群聊只抽取和毛远亮本人相关的安排：被 @、被指派、或本人明确认领。",
      "capsuleMode 决定聊天流胶囊交互：明确属于用户且应自动并入用 auto；私聊或发给自己的明确安排用 private；群内公开任务或不确定是否需要用户执行但值得提示时用 suggestion。",
      "如果没有安排，返回 candidates: []。",
    ],
    now: new Date(currentTime).toISOString(),
    timezone: "Asia/Shanghai",
    userName: "毛远亮",
    messages,
  });
}

function extractDeepSeekResponseText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("DeepSeek API 返回为空。");
  }

  const candidate = payload as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };

  const contentText = candidate.choices
    ?.map((choice) => choice.message?.content)
    .find((text): text is string => typeof text === "string");

  if (contentText) return contentText;
  throw new Error("DeepSeek API 没有返回可解析的结构化文本。");
}

function normalizeAiCandidate(
  candidate: Partial<ArrangementAiCandidate>,
  index: number,
  messages: ArrangementAiMessage[]
): ArrangementAiCandidate {
  const contextIds = new Set(candidate.contextMessages?.map((message) => message.id) ?? []);
  const contextMessages =
    contextIds.size > 0 ? messages.filter((message) => contextIds.has(message.id)) : [];

  return {
    id: typeof candidate.id === "string" && candidate.id ? candidate.id : `deepseek-candidate-${index}`,
    title: typeof candidate.title === "string" ? candidate.title : "未命名安排",
    note: typeof candidate.note === "string" ? candidate.note : "",
    timeKind: candidate.timeKind === "weak" ? "weak" : "strong",
    dueAt: typeof candidate.dueAt === "number" && Number.isFinite(candidate.dueAt) ? candidate.dueAt : null,
    endAt: typeof candidate.endAt === "number" && Number.isFinite(candidate.endAt) ? candidate.endAt : null,
    weakTimeLabel: typeof candidate.weakTimeLabel === "string" ? candidate.weakTimeLabel : "",
    location: typeof candidate.location === "string" ? candidate.location : "",
    people: typeof candidate.people === "string" ? candidate.people : "",
    source:
      candidate.source === "self" || candidate.source === "group" || candidate.source === "private"
        ? candidate.source
        : "private",
    capsuleMode:
      candidate.capsuleMode === "auto" ||
      candidate.capsuleMode === "suggestion" ||
      candidate.capsuleMode === "private"
        ? candidate.capsuleMode
        : candidate.source === "self" || candidate.source === "private"
          ? "private"
          : "auto",
    confidence:
      typeof candidate.confidence === "number" && Number.isFinite(candidate.confidence)
        ? Math.max(0, Math.min(1, candidate.confidence))
        : 0.7,
    reason: typeof candidate.reason === "string" ? candidate.reason : "由 AI 从对话中识别。",
    contextMessages,
  };
}
