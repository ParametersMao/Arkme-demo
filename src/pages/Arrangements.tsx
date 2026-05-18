import React from "react";
import { cn } from "@/lib/utils";

type ArrangementStatus = "active" | "later" | "completed";
type ArrangementTimeKind = "strong" | "weak";
type ArrangementSourceType = "manual" | "self" | "private" | "group";
type CalendarViewMode = "month" | "week";

type ArrangementContextMessage = {
  id: string;
  role: string;
  content: string;
  sentAt: number;
  source: ArrangementSourceType;
};

type ArrangementTimelineEvent = {
  id: string;
  label: string;
  detail: string;
  at: number;
};

type ArrangementItem = {
  id: string;
  title: string;
  note: string;
  timeKind: ArrangementTimeKind;
  dueAt: number | null;
  endAt: number | null;
  weakTimeLabel: string;
  location: string;
  people: string;
  status: ArrangementStatus;
  source: ArrangementSourceType;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  sourceMessageIds?: string[];
  contextMessages: ArrangementContextMessage[];
  timeline: ArrangementTimelineEvent[];
};

type ArrangementDraft = {
  title: string;
  timeKind: ArrangementTimeKind;
  dueAt: string;
  endAt: string;
  weakTimeLabel: string;
  location: string;
  people: string;
  note: string;
};

const arrangementsStorageKey = "arkme-demo.arrangements";
const swipeThreshold = 72;

const defaultDraft: ArrangementDraft = {
  title: "",
  timeKind: "strong",
  dueAt: "",
  endAt: "",
  weakTimeLabel: "",
  location: "",
  people: "",
  note: "",
};

const now = Date.now();

const seedArrangements: ArrangementItem[] = [
  {
    id: "arrangement-seed-breakfast",
    title: "明天到公司时帮同事带早餐",
    note: "强时间安排会排在前面，适合有明确执行点或时间段的事项。",
    timeKind: "strong",
    dueAt: now + 1000 * 60 * 60 * 18,
    endAt: null,
    weakTimeLabel: "",
    location: "公司",
    people: "同事",
    status: "active",
    source: "private",
    createdAt: now - 1000 * 60 * 45,
    updatedAt: now - 1000 * 60 * 45,
    contextMessages: [
      {
        id: "ctx-breakfast-1",
        role: "同事",
        content: "明天来公司帮我带个早餐",
        sentAt: now - 1000 * 60 * 48,
        source: "private",
      },
      {
        id: "ctx-breakfast-2",
        role: "我",
        content: "好的，明天到公司前给你带。",
        sentAt: now - 1000 * 60 * 45,
        source: "private",
      },
    ],
    timeline: [
      {
        id: "life-breakfast-created",
        label: "创建安排",
        detail: "从私聊语境中确认需要带早餐。",
        at: now - 1000 * 60 * 45,
      },
    ],
  },
  {
    id: "arrangement-seed-items",
    title: "给对象带包、口红和伞到公司",
    note: "同一段连续对话中追加的物品，应该合并到同一个“带东西”安排里。",
    timeKind: "strong",
    dueAt: now + 1000 * 60 * 60 * 20,
    endAt: now + 1000 * 60 * 60 * 21,
    weakTimeLabel: "",
    location: "对象公司",
    people: "对象",
    status: "active",
    source: "private",
    createdAt: now - 1000 * 60 * 30,
    updatedAt: now - 1000 * 60 * 24,
    contextMessages: [
      {
        id: "ctx-items-1",
        role: "对象",
        content: "12点帮我把包带到公司来",
        sentAt: now - 1000 * 60 * 30,
        source: "private",
      },
      {
        id: "ctx-items-2",
        role: "对象",
        content: "还有一支某某品牌的口红也带一下",
        sentAt: now - 1000 * 60 * 28,
        source: "private",
      },
      {
        id: "ctx-items-3",
        role: "对象",
        content: "再带把伞，下午可能下雨",
        sentAt: now - 1000 * 60 * 24,
        source: "private",
      },
    ],
    timeline: [
      {
        id: "life-items-created",
        label: "创建安排",
        detail: "识别为“带东西”类安排。",
        at: now - 1000 * 60 * 30,
      },
      {
        id: "life-items-merged",
        label: "合并补充",
        detail: "口红和伞被归入同一条安排。",
        at: now - 1000 * 60 * 24,
      },
    ],
  },
  {
    id: "arrangement-seed-ai-scenes",
    title: "整理群聊安排识别和权限规则",
    note: "弱时间安排不强行制造截止压力，会统一排在强时间安排后面。",
    timeKind: "weak",
    dueAt: null,
    endAt: null,
    weakTimeLabel: "这周找一段完整时间",
    location: "",
    people: "自己",
    status: "active",
    source: "manual",
    createdAt: now - 1000 * 60 * 60 * 8,
    updatedAt: now - 1000 * 60 * 60,
    contextMessages: [],
    timeline: [
      {
        id: "life-scenes-created",
        label: "手动记录",
        detail: "作为后续群聊安排设计的思考入口。",
        at: now - 1000 * 60 * 60 * 8,
      },
    ],
  },
  {
    id: "arrangement-seed-later",
    title: "补充真实 AI API 绑定方案",
    note: "当前 P0 先不接真实模型，避免为了演示而把核心体验做散。",
    timeKind: "weak",
    dueAt: null,
    endAt: null,
    weakTimeLabel: "以后再说",
    location: "",
    people: "自己",
    status: "later",
    source: "manual",
    createdAt: now - 1000 * 60 * 60 * 24,
    updatedAt: now - 1000 * 60 * 10,
    contextMessages: [],
    timeline: [
      {
        id: "life-later-created",
        label: "暂存",
        detail: "放入以后再说，避免安排列表过重。",
        at: now - 1000 * 60 * 10,
      },
    ],
  },
];

const statusTabs: Array<{ key: ArrangementStatus; label: string }> = [
  { key: "active", label: "关注中" },
  { key: "later", label: "以后再说" },
  { key: "completed", label: "已完成" },
];

function getInitialArrangements() {
  if (typeof window === "undefined") return seedArrangements;

  try {
    const storedValue = window.localStorage.getItem(arrangementsStorageKey);
    if (!storedValue) return seedArrangements;

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) return seedArrangements;

    const normalizedItems = parsedValue
      .map(normalizeArrangement)
      .filter((item): item is ArrangementItem => Boolean(item));

    return normalizedItems.length > 0 ? normalizedItems : seedArrangements;
  } catch {
    return seedArrangements;
  }
}

function normalizeArrangement(value: unknown): ArrangementItem | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<ArrangementItem>;
  if (typeof item.id !== "string" || typeof item.title !== "string") return null;

  const status: ArrangementStatus =
    item.status === "later" || item.status === "completed" ? item.status : "active";
  const timeKind: ArrangementTimeKind =
    item.timeKind === "weak" ? "weak" : item.dueAt ? "strong" : "weak";
  const createdAt = normalizeTimestamp(item.createdAt, Date.now());
  const updatedAt = normalizeTimestamp(item.updatedAt, createdAt);

  return {
    id: item.id,
    title: item.title,
    note: typeof item.note === "string" ? item.note : "",
    timeKind,
    dueAt: normalizeNullableTimestamp(item.dueAt),
    endAt: normalizeNullableTimestamp(item.endAt),
    weakTimeLabel: typeof item.weakTimeLabel === "string" ? item.weakTimeLabel : "",
    location: typeof item.location === "string" ? item.location : "",
    people: typeof item.people === "string" ? item.people : "",
    status,
    source: normalizeSource(item.source),
    createdAt,
    updatedAt,
    ...(typeof item.completedAt === "number" && Number.isFinite(item.completedAt)
      ? { completedAt: item.completedAt }
      : {}),
    sourceMessageIds: normalizeSourceMessageIds(item.sourceMessageIds),
    contextMessages: normalizeContextMessages(item.contextMessages),
    timeline: normalizeTimeline(item.timeline, createdAt),
  };
}

function normalizeTimestamp(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeNullableTimestamp(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSource(value: unknown): ArrangementSourceType {
  if (value === "self" || value === "private" || value === "group") return value;
  return "manual";
}

function normalizeSourceMessageIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && Boolean(id));
}

function normalizeContextMessages(value: unknown): ArrangementContextMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((message, index) => {
      if (!message || typeof message !== "object") return null;
      const candidate = message as Partial<ArrangementContextMessage>;
      if (typeof candidate.content !== "string" || !candidate.content.trim()) return null;

      return {
        id: typeof candidate.id === "string" ? candidate.id : `ctx-${index}`,
        role: typeof candidate.role === "string" && candidate.role ? candidate.role : "未知角色",
        content: candidate.content,
        sentAt: normalizeTimestamp(candidate.sentAt, Date.now() + index),
        source: normalizeSource(candidate.source),
      };
    })
    .filter((message): message is ArrangementContextMessage => Boolean(message));
}

function normalizeTimeline(value: unknown, createdAt: number): ArrangementTimelineEvent[] {
  if (!Array.isArray(value)) {
    return [
      {
        id: "life-created",
        label: "创建安排",
        detail: "手动创建安排。",
        at: createdAt,
      },
    ];
  }

  return value
    .map((event, index) => {
      if (!event || typeof event !== "object") return null;
      const candidate = event as Partial<ArrangementTimelineEvent>;
      if (typeof candidate.label !== "string" || !candidate.label.trim()) return null;

      return {
        id: typeof candidate.id === "string" ? candidate.id : `life-${index}`,
        label: candidate.label,
        detail: typeof candidate.detail === "string" ? candidate.detail : "",
        at: normalizeTimestamp(candidate.at, createdAt + index),
      };
    })
    .filter((event): event is ArrangementTimelineEvent => Boolean(event));
}

function persistArrangements(items: ArrangementItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(arrangementsStorageKey, JSON.stringify(items));
}

function formatDateTime(timestamp: number | null) {
  if (!timestamp) return "未设定时间";

  const date = new Date(timestamp);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();
  const dateLabel = isSameDay
    ? "今天"
    : isTomorrow
      ? "明天"
      : `${date.getMonth() + 1}月${date.getDate()}日`;
  const timeLabel = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

  return `${dateLabel} ${timeLabel}`;
}

function formatTimeWindow(item: ArrangementItem) {
  if (item.timeKind === "weak") {
    return item.weakTimeLabel || "弱时间";
  }

  if (item.dueAt && item.endAt && item.endAt > item.dueAt) {
    return `${formatDateTime(item.dueAt)} - ${formatDateTime(item.endAt)}`;
  }

  return formatDateTime(item.dueAt);
}

function formatCardTimeWindow(item: ArrangementItem) {
  if (item.timeKind === "weak") return item.weakTimeLabel || "弱时间";
  if (!item.dueAt) return "未设定时间";
  if (!item.endAt || item.endAt <= item.dueAt) return formatDateTime(item.dueAt);

  const start = new Date(item.dueAt);
  const end = new Date(item.endAt);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const endTime = `${String(end.getHours()).padStart(2, "0")}:${String(
    end.getMinutes()
  ).padStart(2, "0")}`;

  return sameDay ? `${formatDateTime(item.dueAt)}-${endTime}` : formatTimeWindow(item);
}

function getCardTimeChip(item: ArrangementItem) {
  if (item.timeKind === "strong") {
    return {
      label: `🕒 ${formatCardTimeWindow(item)}`,
      className: "bg-primary-soft text-primary",
    };
  }

  return {
    label: `🗓️ ${item.weakTimeLabel || "待定"}`,
    className: "bg-fill-3 text-text-tertiary",
  };
}

function parseDatetimeLocalValue(value: string) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getStatusMeta(status: ArrangementStatus) {
  if (status === "completed") {
    return { label: "已完成", className: "bg-primary-soft text-primary" };
  }

  if (status === "later") {
    return { label: "以后再说", className: "bg-fill-3 text-text-muted" };
  }

  return { label: "关注中", className: "bg-primary text-on-primary" };
}

function getSourceLabel(source: ArrangementSourceType) {
  if (source === "self") return "发给自己";
  if (source === "private") return "私聊";
  if (source === "group") return "群聊";
  return "手动";
}

function sortArrangements(a: ArrangementItem, b: ArrangementItem) {
  if (a.timeKind !== b.timeKind) {
    return a.timeKind === "strong" ? -1 : 1;
  }

  if (a.timeKind === "strong") {
    const aDue = a.dueAt ?? Number.MAX_SAFE_INTEGER;
    const bDue = b.dueAt ?? Number.MAX_SAFE_INTEGER;
    if (aDue !== bDue) return aDue - bDue;
  }

  return b.updatedAt - a.updatedAt;
}

function isSameCalendarDay(a: number | Date | null, b: number | Date | null) {
  if (!a || !b) return false;
  const first = a instanceof Date ? a : new Date(a);
  const second = b instanceof Date ? b : new Date(b);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatDateHeading(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日安排`;
}

function getParticipantNames(item: ArrangementItem) {
  if (item.source === "manual") return ["我"];

  const roleNames = item.contextMessages
    .map((message) => message.role.trim())
    .filter((role) => role && role !== "我" && role !== "自己");
  const peopleNames = item.people
    .split(/[、,，\s]+/)
    .map((name) => name.trim())
    .filter(Boolean);
  const names = Array.from(new Set([...roleNames, ...peopleNames]));

  if (names.length > 0) return names;
  if (item.source === "self") return ["我"];
  return [getSourceLabel(item.source)];
}

function getAvatarInitial(name: string) {
  return name.trim().slice(0, 1) || "安";
}

function getCalendarDays(items: ArrangementItem[]) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDate = new Date(year, month, 1);
  const startOffset = (firstDate.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, month, index - startOffset + 1);
    const dayItems = items.filter((item) => {
      if (item.timeKind !== "strong" || !item.dueAt) return false;
      const itemDate = new Date(item.dueAt);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });

    return {
      key: date.toISOString(),
      date,
      inMonth: date.getMonth() === month,
      isToday: isSameCalendarDay(date, today),
      count: dayItems.length,
    };
  });
}

function getCalendarWeek(
  days: ReturnType<typeof getCalendarDays>,
  focusDate: Date
) {
  const focusIndex = days.findIndex((day) => isSameCalendarDay(day.date, focusDate));
  if (focusIndex < 0) return days.slice(0, 7);
  const weekStart = Math.floor(focusIndex / 7) * 7;
  return days.slice(weekStart, weekStart + 7);
}

export default function Arrangements() {
  const [items, setItems] = React.useState(getInitialArrangements);
  const [activeStatus, setActiveStatus] = React.useState<ArrangementStatus>("active");
  const [selectedItem, setSelectedItem] = React.useState<ArrangementItem | null>(null);
  const [showCreateSheet, setShowCreateSheet] = React.useState(false);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [calendarViewMode, setCalendarViewMode] = React.useState<CalendarViewMode>("month");
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [draft, setDraft] = React.useState<ArrangementDraft>(defaultDraft);
  const pullStartYRef = React.useRef<number | null>(null);

  const counts = React.useMemo(
    () =>
      items.reduce<Record<ArrangementStatus, number>>(
        (result, item) => ({ ...result, [item.status]: result[item.status] + 1 }),
        { active: 0, later: 0, completed: 0 }
      ),
    [items]
  );

  const visibleItems = React.useMemo(() => {
    if (selectedDate) {
      return items
        .filter((item) => item.timeKind === "strong" && isSameCalendarDay(item.dueAt, selectedDate))
        .sort(sortArrangements);
    }

    return items.filter((item) => item.status === activeStatus).sort(sortArrangements);
  }, [activeStatus, items, selectedDate]);

  const calendarItems = React.useMemo(
    () => items,
    [items]
  );

  const selectedDateNumber = selectedDate?.getDate() ?? new Date().getDate();

  const updateItems = React.useCallback(
    (updater: (current: ArrangementItem[]) => ArrangementItem[]) => {
      setItems((current) => {
        const nextItems = updater(current);
        persistArrangements(nextItems);
        return nextItems;
      });
    },
    []
  );

  const createArrangement = () => {
    const title = draft.title.trim();
    if (!title) return;

    const currentTime = Date.now();
    const dueAt = draft.timeKind === "strong" ? parseDatetimeLocalValue(draft.dueAt) : null;
    const endAt = draft.timeKind === "strong" ? parseDatetimeLocalValue(draft.endAt) : null;
    const nextItem: ArrangementItem = {
      id: `arrangement-${currentTime}`,
      title,
      note: draft.note.trim(),
      timeKind: draft.timeKind,
      dueAt,
      endAt,
      weakTimeLabel: draft.timeKind === "weak" ? draft.weakTimeLabel.trim() : "",
      location: draft.location.trim(),
      people: draft.people.trim(),
      status: "active",
      source: "manual",
      createdAt: currentTime,
      updatedAt: currentTime,
      contextMessages: [],
      timeline: [
        {
          id: `life-created-${currentTime}`,
          label: "手动创建",
          detail: "由用户手动记录安排。",
          at: currentTime,
        },
      ],
    };

    updateItems((current) => [nextItem, ...current]);
    setDraft(defaultDraft);
    setActiveStatus("active");
    setSelectedDate(null);
    setShowCreateSheet(false);
  };

  const changeStatus = (itemId: string, status: ArrangementStatus) => {
    const currentTime = Date.now();
    const eventLabel =
      status === "completed" ? "标记完成" : status === "later" ? "以后再说" : "重新关注";
    const eventDetail =
      status === "completed"
        ? "用户手动完成该安排。"
        : status === "later"
          ? "用户将安排放入以后再说，降低当前列表压力。"
          : "用户重新把安排放回关注中。";

    const patchItem = (item: ArrangementItem): ArrangementItem =>
      item.id === itemId
        ? {
            ...item,
            status,
            updatedAt: currentTime,
            ...(status === "completed" ? { completedAt: currentTime } : { completedAt: undefined }),
            timeline: [
              ...item.timeline,
              {
                id: `life-${status}-${currentTime}`,
                label: eventLabel,
                detail: eventDetail,
                at: currentTime,
              },
            ],
          }
        : item;

    updateItems((current) => current.map(patchItem));
    setSelectedItem((current) => (current ? patchItem(current) : current));
  };

  const handleHeaderPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    pullStartYRef.current = event.clientY;
  };

  const handleHeaderPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (pullStartYRef.current === null) return;
    const nextDistance = Math.max(0, Math.min(88, event.clientY - pullStartYRef.current));
    setPullDistance(nextDistance);
  };

  const handleHeaderPointerEnd = () => {
    if (pullDistance > 56) {
      setShowCalendar(true);
      setCalendarViewMode("month");
    }
    pullStartYRef.current = null;
    setPullDistance(0);
  };

  const handleListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (showCalendar && calendarViewMode === "month" && event.currentTarget.scrollTop > 8) {
      setCalendarViewMode("week");
    }
  };

  return (
    <div className="relative flex h-full min-w-0 flex-col overflow-hidden bg-bg">
      <header
        className="shrink-0 bg-bg px-4 pb-3 pt-3"
        onPointerDown={handleHeaderPointerDown}
        onPointerMove={handleHeaderPointerMove}
        onPointerUp={handleHeaderPointerEnd}
        onPointerCancel={handleHeaderPointerEnd}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-semibold leading-7 text-text">安排</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCalendar((current) => !current);
                if (!showCalendar) setCalendarViewMode(selectedDate ? "week" : "month");
              }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold leading-none transition active:scale-[0.94]",
                showCalendar ? "bg-primary-soft text-primary" : "bg-surface text-text-tertiary shadow-soft"
              )}
              aria-label="日历总览"
              aria-expanded={showCalendar}
            >
              {selectedDateNumber}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateSheet(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_6px_14px_var(--primary-ring)] transition active:scale-[0.94]"
              aria-label="新建安排"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        {!showCalendar && pullDistance > 10 && (
          <div className="mt-2 flex justify-center text-[11px] leading-4 text-text-tertiary" style={{ opacity: pullDistance / 88 }}>
            继续下滑打开日历
          </div>
        )}

        <CalendarOverview
          items={calendarItems}
          open={showCalendar}
          mode={calendarViewMode}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setShowCalendar(true);
            setCalendarViewMode("week");
          }}
          onToggleMode={() =>
            setCalendarViewMode((current) => (current === "month" ? "week" : "month"))
          }
        />

        {selectedDate ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-[12px] bg-surface px-3 py-2.5 shadow-soft">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium leading-5 text-text">
                🗓️ {formatDateHeading(selectedDate)} ({visibleItems.length})
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-text-tertiary">已按日期筛选</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="shrink-0 rounded-full bg-fill-3 px-3 py-1.5 text-[12px] font-medium leading-4 text-text-muted transition active:scale-[0.96]"
            >
              ⓧ 返回总览
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {statusTabs.map((tab) => {
              const active = tab.key === activeStatus;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveStatus(tab.key)}
                  className={cn(
                    "min-h-[48px] rounded-[12px] px-2 text-left transition active:scale-[0.98]",
                    active ? "bg-surface text-text shadow-soft" : "bg-transparent text-text-tertiary"
                  )}
                >
                  <span className="block text-[13px] font-medium leading-5">{tab.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-text-tertiary">
                    {counts[tab.key]} 项
                  </span>
                </button>
              );
            })}
          </div>
        )}

      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5" onScroll={handleListScroll}>
        {visibleItems.length > 0 ? (
          <div key={selectedDate ? selectedDate.toDateString() : activeStatus} className="space-y-2.5 animate-[arrangement-list-in_180ms_ease-out]">
            {visibleItems.map((item) => (
              <ArrangementCard
                key={item.id}
                item={item}
                onOpen={() => setSelectedItem(item)}
                onComplete={() => changeStatus(item.id, "completed")}
                onLater={() => changeStatus(item.id, "later")}
              />
            ))}
          </div>
        ) : (
          <EmptyArrangementState status={activeStatus} onCreate={() => setShowCreateSheet(true)} />
        )}
      </div>

      {selectedItem && (
        <ArrangementDetailSheet
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onComplete={() => changeStatus(selectedItem.id, "completed")}
          onLater={() => changeStatus(selectedItem.id, "later")}
          onReactivate={() => changeStatus(selectedItem.id, "active")}
        />
      )}

      {showCreateSheet && (
        <CreateArrangementSheet
          draft={draft}
          onChange={setDraft}
          onClose={() => setShowCreateSheet(false)}
          onSubmit={createArrangement}
        />
      )}

    </div>
  );
}

function CalendarOverview({
  items,
  open,
  mode,
  selectedDate,
  onSelectDate,
  onToggleMode,
}: {
  items: ArrangementItem[];
  open: boolean;
  mode: CalendarViewMode;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onToggleMode: () => void;
}) {
  const days = React.useMemo(() => getCalendarDays(items), [items]);
  const focusDate = selectedDate ?? new Date();
  const visibleDays = mode === "week" ? getCalendarWeek(days, focusDate) : days;
  const weakCount = items.filter((item) => item.timeKind === "weak").length;
  const strongCount = items.filter((item) => item.timeKind === "strong").length;
  const monthLabel = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
  });

  return (
    <div
      className={cn(
        "overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out",
        open && mode === "month" && "mt-3 max-h-[330px] translate-y-0 opacity-100",
        open && mode === "week" && "mt-3 max-h-[150px] translate-y-0 opacity-100",
        !open && "max-h-0 -translate-y-3 opacity-0"
      )}
      aria-hidden={!open}
    >
      <section className="rounded-[14px] border border-border-light bg-surface px-3 py-3 shadow-soft">
        <div className={cn("flex items-center justify-between gap-3", mode === "week" && "mb-1")}>
          <div>
            <p className="text-[14px] font-medium leading-5 text-text">{monthLabel}</p>
            {mode === "month" && (
              <p className="mt-0.5 text-[11px] leading-4 text-text-tertiary">
                {strongCount} 个定时安排 · {weakCount} 个待定安排
              </p>
            )}
          </div>
          <span className="rounded-full bg-primary-soft px-2 py-1 text-[11px] leading-4 text-primary">
            {mode === "month" ? "总览" : "周视图"}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] leading-4 text-text-tertiary">
          {["一", "二", "三", "四", "五", "六", "日"].map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {visibleDays.map((day) => {
            const selected = isSameCalendarDay(day.date, selectedDate);

            return (
            <button
              type="button"
              key={day.key}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                "relative flex aspect-square min-h-8 items-center justify-center rounded-full text-[11px] leading-4 transition active:scale-[0.94]",
                day.inMonth ? "text-text" : "text-text-disabled",
                day.isToday && !selected && "bg-primary text-on-primary",
                !day.isToday && !selected && day.count > 0 && "bg-primary-soft text-primary",
                selected && !day.isToday && "border border-primary bg-transparent text-primary",
                selected && day.isToday && "bg-primary text-on-primary ring-2 ring-primary/30"
              )}
              aria-pressed={selected}
            >
              {day.date.getDate()}
              {day.count > 0 && (
                <span
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    day.isToday ? "bg-on-primary" : "bg-primary"
                  )}
                />
              )}
            </button>
            );
          })}
        </div>

        {mode === "month" && weakCount > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-[10px] bg-fill-3 px-3 py-2 text-[12px] leading-4">
            <span className="text-text-tertiary">🗓️ 随时 / 待定</span>
            <span className="font-medium text-text-muted">{weakCount} 项</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleMode}
          className="mx-auto mt-2 flex h-5 w-16 items-center justify-center rounded-full text-text-tertiary transition hover:bg-hover-overlay active:scale-[0.96]"
          aria-label={mode === "month" ? "折叠为周视图" : "展开月视图"}
        >
          {mode === "month" ? (
            <span className="h-1 w-9 rounded-full bg-fill-2" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m4 6 4 4 4-4" />
            </svg>
          )}
        </button>
      </section>
    </div>
  );
}

function ArrangementCard({
  item,
  onOpen,
  onComplete,
  onLater,
}: {
  item: ArrangementItem;
  onOpen: () => void;
  onComplete: () => void;
  onLater: () => void;
}) {
  const statusMeta = getStatusMeta(item.status);
  const timeChip = getCardTimeChip(item);
  const [dragX, setDragX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const startXRef = React.useRef<number | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    startXRef.current = event.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (startXRef.current === null) return;
    const nextDragX = Math.max(-96, Math.min(96, event.clientX - startXRef.current));
    setDragX(nextDragX);
  };

  const handlePointerEnd = () => {
    if (dragX > swipeThreshold && item.status !== "completed") onComplete();
    if (dragX < -swipeThreshold && item.status === "active") onLater();
    startXRef.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  const handleOpen = () => {
    if (Math.abs(dragX) > 8) return;
    onOpen();
  };

  return (
    <article className="relative overflow-hidden rounded-[14px]">
      <div className="absolute inset-y-0 left-0 flex w-24 items-center bg-primary-soft pl-4 text-[12px] font-medium text-primary">
        完成
      </div>
      <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-end bg-fill-3 pr-4 text-[12px] font-medium text-text-muted">
        以后再说
      </div>
      <div
        className={cn(
          "relative rounded-[14px] border border-[var(--record-card-border)] bg-[var(--record-card-bg)] px-3.5 pb-3 pt-3 shadow-soft",
          isDragging ? "transition-none" : "transition-transform"
        )}
        style={{ transform: `translateX(${dragX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <button type="button" onClick={handleOpen} className="block w-full text-left">
          <div className="flex items-start gap-3">
            <ArrangementSourceAvatar item={item} size="card" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h2 className="min-w-0 flex-1 text-[15px] font-medium leading-5 text-text">
                  {item.title}
                </h2>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] leading-4", statusMeta.className)}>
                  {statusMeta.label}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <ArrangementMetaChip
                  label={timeChip.label}
                  className={timeChip.className}
                />
                <ArrangementMetaChip icon="source" label={getSourceLabel(item.source)} />
                {item.location && <ArrangementMetaChip icon="pin" label={item.location} />}
                {item.people && <ArrangementMetaChip icon="user" label={item.people} />}
              </div>
              {item.note && (
                <p className="mt-2 line-clamp-2 break-words text-[12px] leading-5 text-text-tertiary">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        </button>

      </div>
    </article>
  );
}

function ArrangementSourceAvatar({
  item,
  size = "card",
}: {
  item: ArrangementItem;
  size?: "card" | "detail";
}) {
  const names = getParticipantNames(item);
  const isAiRecognized = item.source !== "manual";
  const isStacked = item.source === "group" || names.length > 1;
  const rootSize = size === "detail" ? "h-11 w-11" : "h-9 w-9";
  const singleTextSize = size === "detail" ? "text-[15px]" : "text-[13px]";

  if (item.source === "manual") {
    return (
      <div className={cn("relative mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-fill-3 text-[15px]", rootSize)}>
        📝
      </div>
    );
  }

  return (
    <div className={cn("relative mt-0.5 shrink-0", rootSize)}>
      {isStacked ? (
        <div className="relative h-full w-full">
          {names.slice(0, 2).map((name, index) => (
            <span
              key={`${name}-${index}`}
              className={cn(
                "absolute flex items-center justify-center rounded-full border-2 border-[var(--record-card-bg)] bg-primary text-[10px] font-semibold text-on-primary",
                size === "detail" ? "h-8 w-8" : "h-7 w-7",
                index === 0 ? "left-0 top-0" : "bottom-0 right-0 bg-[#4A7DFF]"
              )}
            >
              {getAvatarInitial(name)}
            </span>
          ))}
          {names.length > 2 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-fill-3 px-1 text-[9px] leading-3 text-text-muted">
              +{names.length - 2}
            </span>
          )}
        </div>
      ) : (
        <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-primary font-semibold text-on-primary", singleTextSize)}>
          {getAvatarInitial(names[0])}
        </div>
      )}
      {isAiRecognized && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[var(--record-card-bg)] bg-surface text-[10px] leading-none">
          ✨
        </span>
      )}
    </div>
  );
}

function ArrangementMetaChip({
  icon,
  label,
  className,
}: {
  icon?: "time" | "pin" | "user" | "source";
  label: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-[var(--overview-entry-tag-bg)] px-2 py-1 text-[11px] leading-4 text-text-tertiary", className)}>
      {icon && <ArrangementSmallIcon icon={icon} />}
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}

function ArrangementSmallIcon({ icon }: { icon: "time" | "pin" | "user" | "source" }) {
  if (icon === "pin") {
    return (
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 14s4-3.8 4-7A4 4 0 0 0 4 7c0 3.2 4 7 4 7Z" />
        <circle cx="8" cy="7" r="1.3" />
      </svg>
    );
  }

  if (icon === "user") {
    return (
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="8" cy="5" r="2.4" />
        <path d="M3.8 13c.7-2 2.2-3 4.2-3s3.5 1 4.2 3" />
      </svg>
    );
  }

  if (icon === "source") {
    return (
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.5 5.5h7M4.5 8h5M3.8 2.8h8.4c.9 0 1.6.7 1.6 1.6v5.2c0 .9-.7 1.6-1.6 1.6H7.1L4 13.2v-2H3.8c-.9 0-1.6-.7-1.6-1.6V4.4c0-.9.7-1.6 1.6-1.6Z" />
      </svg>
    );
  }

  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" />
      <path d="M8 4.8V8l2.2 1.4" />
    </svg>
  );
}

function EmptyArrangementState({
  status,
  onCreate,
}: {
  status: ArrangementStatus;
  onCreate: () => void;
}) {
  const message =
    status === "completed"
      ? "还没有完成的安排"
      : status === "later"
        ? "暂时没有被放下的安排"
        : "先创建一条安排，把真正值得跟进的事放在这里";

  return (
    <div className="flex h-full min-h-[360px] items-center justify-center text-center">
      <div className="max-w-[240px]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface text-primary shadow-soft">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 6h13M8 12h13M8 18h13" />
            <path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" />
          </svg>
        </div>
        <p className="mt-4 text-[14px] font-medium leading-5 text-text">{message}</p>
        {status === "active" && (
          <button type="button" onClick={onCreate} className="mt-4 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-on-primary transition active:scale-[0.96]">
            新建安排
          </button>
        )}
      </div>
    </div>
  );
}

function ArrangementDetailSheet({
  item,
  onClose,
  onComplete,
  onLater,
  onReactivate,
}: {
  item: ArrangementItem;
  onClose: () => void;
  onComplete: () => void;
  onLater: () => void;
  onReactivate: () => void;
}) {
  const statusMeta = getStatusMeta(item.status);
  const timeChip = getCardTimeChip(item);

  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <button type="button" className="absolute inset-0 bg-overlay" onClick={onClose} aria-label="关闭安排详情" />
      <section className="relative z-10 flex max-h-[88%] w-full flex-col overflow-hidden rounded-t-[16px] border border-border-light bg-[var(--dialog-bg)] shadow-[0_-12px_36px_rgba(0,0,0,0.18)]" role="dialog" aria-modal="true" aria-label="安排详情">
        <header className="shrink-0 border-b border-border-light px-4 pb-3 pt-2.5">
          <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-fill-2" />
          <div className="flex items-center gap-3">
            <h2 className="min-w-0 flex-1 truncate text-[14px] leading-5 text-text">安排详情</h2>
            <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-tertiary transition hover:bg-hover-overlay hover:text-text active:scale-[0.96]" aria-label="关闭安排详情">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
          <div className="flex items-start gap-3">
            <ArrangementSourceAvatar item={item} size="detail" />
            <div className="min-w-0 flex-1">
              <h3 className="text-[18px] font-semibold leading-7 text-text">{item.title}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] leading-4", statusMeta.className)}>
                  {statusMeta.label}
                </span>
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] leading-4", timeChip.className)}>
                  {timeChip.label}
                </span>
                <span className="inline-flex rounded-full bg-[var(--overview-entry-tag-bg)] px-2 py-0.5 text-[11px] leading-4 text-text-tertiary">
                  {getSourceLabel(item.source)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <ArrangementDetailRow icon="time" label="时间" value={formatTimeWindow(item)} />
            <ArrangementDetailRow icon="pin" label="地点" value={item.location || "未设置"} />
            <ArrangementDetailRow icon="user" label="相关人" value={item.people || "未设置"} />
            <ArrangementDetailRow icon="time" label="更新" value={formatDateTime(item.updatedAt)} />
          </div>

          <section className="mt-5 rounded-[12px] bg-[var(--record-detail-muted-bg)] px-3.5 py-3">
            <p className="text-[12px] leading-4 text-text-tertiary">备注</p>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-text">
              {item.note || "暂无备注，后续可以在这里承接来源对话和补充上下文。"}
            </p>
          </section>

          <DetailSection title="生命周期">
            <div className="space-y-3">
              {item.timeline.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium leading-5 text-text">{event.label}</p>
                      <p className="shrink-0 text-[11px] leading-4 text-text-tertiary">
                        {formatDateTime(event.at)}
                      </p>
                    </div>
                    {event.detail && (
                      <p className="mt-0.5 text-[12px] leading-5 text-text-tertiary">{event.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="相关对话上下文">
            {item.contextMessages.length > 0 ? (
              <div className="space-y-2.5">
                {item.contextMessages.map((message) => (
                  <div key={message.id} className="rounded-[12px] bg-[var(--record-detail-muted-bg)] px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-medium leading-4 text-text">{message.role}</p>
                      <p className="shrink-0 text-[11px] leading-4 text-text-tertiary">
                        {getSourceLabel(message.source)} · {formatDateTime(message.sentAt)}
                      </p>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-5 text-text-muted">{message.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-[12px] bg-[var(--record-detail-muted-bg)] px-3 py-3 text-[13px] leading-5 text-text-tertiary">
                这条安排来自手动记录，暂时没有绑定对话。后续 AI 识别时会把角色、时间和原文追加到这里。
              </p>
            )}
          </DetailSection>

          <div className="mt-5 flex flex-wrap gap-2">
            {item.status !== "completed" && (
              <button type="button" onClick={onComplete} className="rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-on-primary transition active:scale-[0.96]">
                标记完成
              </button>
            )}
            {item.status !== "later" && item.status !== "completed" && (
              <button type="button" onClick={onLater} className="rounded-full bg-fill-3 px-4 py-2 text-[13px] font-medium text-text-muted transition active:scale-[0.96]">
                以后再说
              </button>
            )}
            {item.status !== "active" && (
              <button type="button" onClick={onReactivate} className="rounded-full bg-fill-3 px-4 py-2 text-[13px] font-medium text-text-muted transition active:scale-[0.96]">
                重新关注
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h4 className="mb-2 text-[13px] font-medium leading-5 text-text">{title}</h4>
      {children}
    </section>
  );
}

function ArrangementDetailRow({
  icon,
  label,
  value,
}: {
  icon: "time" | "pin" | "user";
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fill-3 text-text-tertiary">
        <ArrangementSmallIcon icon={icon} />
      </span>
      <p className="w-[56px] shrink-0 text-[13px] leading-7 text-text-tertiary">{label}</p>
      <p className="min-w-0 flex-1 text-[14px] leading-7 text-text">{value}</p>
    </div>
  );
}

function CreateArrangementSheet({
  draft,
  onChange,
  onClose,
  onSubmit,
}: {
  draft: ArrangementDraft;
  onChange: (draft: ArrangementDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const canSubmit = draft.title.trim().length > 0;

  const updateDraft = (key: keyof ArrangementDraft, value: string) => {
    onChange({ ...draft, [key]: value });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <button type="button" className="absolute inset-0 bg-overlay" onClick={onClose} aria-label="关闭新建安排" />
      <section className="relative z-10 max-h-[92%] w-full overflow-hidden rounded-t-[16px] border border-border-light bg-[var(--dialog-bg)] shadow-[0_-12px_36px_rgba(0,0,0,0.18)]" role="dialog" aria-modal="true" aria-label="新建安排">
        <header className="border-b border-border-light px-4 pb-3 pt-2.5">
          <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-fill-2" />
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold leading-6 text-text">新建安排</h2>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] font-medium transition active:scale-[0.96]",
                canSubmit ? "bg-primary text-on-primary" : "bg-fill-3 text-text-disabled"
              )}
            >
              保存
            </button>
          </div>
        </header>
        <div className="space-y-3 overflow-y-auto px-4 py-4">
          <FormField label="安排内容">
            <input
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              placeholder="比如：下午6点去接对象下班"
              className="w-full rounded-[12px] bg-surface-muted px-3 py-3 text-[15px] leading-5 text-text outline-none placeholder:text-input-placeholder focus:shadow-focus"
            />
          </FormField>

          <FormField label="时间类型">
            <div className="grid grid-cols-2 gap-2 rounded-[12px] bg-surface-muted p-1">
              {(["strong", "weak"] as const).map((timeKind) => (
                <button
                  key={timeKind}
                  type="button"
                  onClick={() => updateDraft("timeKind", timeKind)}
                  className={cn(
                    "rounded-[10px] px-3 py-2 text-[13px] font-medium transition active:scale-[0.98]",
                    draft.timeKind === timeKind
                      ? "bg-surface text-text shadow-soft"
                      : "text-text-tertiary"
                  )}
                >
                  {timeKind === "strong" ? "强时间" : "弱时间"}
                </button>
              ))}
            </div>
          </FormField>

          {draft.timeKind === "strong" ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="开始时间">
                <input
                  type="datetime-local"
                  value={draft.dueAt}
                  onChange={(event) => updateDraft("dueAt", event.target.value)}
                  className="w-full rounded-[12px] bg-surface-muted px-3 py-3 text-[14px] leading-5 text-text outline-none focus:shadow-focus"
                />
              </FormField>
              <FormField label="结束时间">
                <input
                  type="datetime-local"
                  value={draft.endAt}
                  onChange={(event) => updateDraft("endAt", event.target.value)}
                  className="w-full rounded-[12px] bg-surface-muted px-3 py-3 text-[14px] leading-5 text-text outline-none focus:shadow-focus"
                />
              </FormField>
            </div>
          ) : (
            <FormField label="弱时间描述">
              <input
                value={draft.weakTimeLabel}
                onChange={(event) => updateDraft("weakTimeLabel", event.target.value)}
                placeholder="比如：这周、有空时、以后再说"
                className="w-full rounded-[12px] bg-surface-muted px-3 py-3 text-[15px] leading-5 text-text outline-none placeholder:text-input-placeholder focus:shadow-focus"
              />
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="地点">
              <input
                value={draft.location}
                onChange={(event) => updateDraft("location", event.target.value)}
                placeholder="公司"
                className="w-full rounded-[12px] bg-surface-muted px-3 py-3 text-[15px] leading-5 text-text outline-none placeholder:text-input-placeholder focus:shadow-focus"
              />
            </FormField>
            <FormField label="相关人">
              <input
                value={draft.people}
                onChange={(event) => updateDraft("people", event.target.value)}
                placeholder="对象"
                className="w-full rounded-[12px] bg-surface-muted px-3 py-3 text-[15px] leading-5 text-text outline-none placeholder:text-input-placeholder focus:shadow-focus"
              />
            </FormField>
          </div>
          <FormField label="备注">
            <textarea
              value={draft.note}
              onChange={(event) => updateDraft("note", event.target.value)}
              placeholder="补充来源、上下文或提醒自己注意的事"
              className="min-h-[96px] w-full resize-none rounded-[12px] bg-surface-muted px-3 py-3 text-[15px] leading-6 text-text outline-none placeholder:text-input-placeholder focus:shadow-focus"
            />
          </FormField>
        </div>
      </section>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] leading-4 text-text-tertiary">{label}</span>
      {children}
    </label>
  );
}
