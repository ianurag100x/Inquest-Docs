<script setup lang="ts">
import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from "date-fns";
import { calendarEvents, type CalendarEvent } from "~/data/calendar-events";

interface ParsedEvent extends CalendarEvent {
  startDate: Date;
  endDate: Date;
}

const MAX_LANES = 3;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const today = new Date();
const view = ref<"month" | "year">("month");
const currentDate = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const selectedDay = ref<Date>(today);

const events = computed<ParsedEvent[]>(() =>
  calendarEvents
    .map((e) => ({
      ...e,
      startDate: parseISO(e.start),
      endDate: parseISO(e.end ?? e.start),
    }))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
);

function eventsForDay(day: Date) {
  return events.value.filter((e) =>
    isWithinInterval(day, { start: e.startDate, end: e.endDate }),
  );
}

/* ---------------- Month view ---------------- */

const monthGridWeeks = computed(() => {
  const monthStart = startOfMonth(currentDate.value);
  const monthEnd = endOfMonth(currentDate.value);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
});

interface Bar {
  event: ParsedEvent;
  colStart: number;
  colEnd: number;
  lane: number;
}

function computeWeekBars(week: Date[]): { bars: Bar[]; hidden: number[] } {
  const weekStart = week[0];
  const weekEnd = week[6];
  const relevant = events.value
    .filter((e) => e.endDate >= weekStart && e.startDate <= weekEnd)
    .sort((a, b) => {
      const byStart = a.startDate.getTime() - b.startDate.getTime();
      if (byStart !== 0) return byStart;
      return (
        b.endDate.getTime() -
        b.startDate.getTime() -
        (a.endDate.getTime() - a.startDate.getTime())
      );
    });

  const laneEnds: number[] = []; // next free grid column per lane
  const bars: Bar[] = [];
  const hidden = [0, 0, 0, 0, 0, 0, 0];

  for (const e of relevant) {
    const start = e.startDate < weekStart ? weekStart : e.startDate;
    const end = e.endDate > weekEnd ? weekEnd : e.endDate;
    const colStart = differenceInCalendarDays(start, weekStart) + 1; // 1..7
    const colEnd = differenceInCalendarDays(end, weekStart) + 2; // exclusive, 2..8

    let lane = laneEnds.findIndex((freeCol) => freeCol <= colStart);
    if (lane === -1) {
      if (laneEnds.length < MAX_LANES) {
        lane = laneEnds.length;
        laneEnds.push(0);
      } else {
        for (let c = colStart; c < colEnd; c++) hidden[c - 1]++;
        continue;
      }
    }
    laneEnds[lane] = colEnd;
    bars.push({ event: e, colStart, colEnd, lane });
  }

  return { bars, hidden };
}

const weeksWithBars = computed(() =>
  monthGridWeeks.value.map((week) => ({ week, ...computeWeekBars(week) })),
);

function prevMonth() {
  currentDate.value = subMonths(currentDate.value, 1);
}
function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1);
}
function goToday() {
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDay.value = today;
  view.value = "month";
}
function selectDay(day: Date) {
  selectedDay.value = day;
  if (!isSameMonth(day, currentDate.value))
    currentDate.value = new Date(day.getFullYear(), day.getMonth(), 1);
}

/* ---------------- Year view ---------------- */

const yearMonths = computed(() => {
  const year = currentDate.value.getFullYear();
  return Array.from({ length: 12 }, (_, m) => {
    const monthDate = new Date(year, m, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const eventCount = events.value.filter(
      (e) => e.startDate <= monthEnd && e.endDate >= monthStart,
    ).length;
    return { monthDate, days, eventCount };
  });
});

function prevYear() {
  currentDate.value = subYears(currentDate.value, 1);
}
function nextYear() {
  currentDate.value = addYears(currentDate.value, 1);
}
function openMonth(monthDate: Date) {
  currentDate.value = new Date(monthDate);
  view.value = "month";
}

/* ---------------- Selected day panel ---------------- */

const selectedDayEvents = computed(() => eventsForDay(selectedDay.value));

function eventDateLabel(e: ParsedEvent) {
  if (isSameDay(e.startDate, e.endDate))
    return format(e.startDate, "EEE, MMM d, yyyy");
  const sameYear = isSameYear(e.startDate, e.endDate);
  return `${format(e.startDate, sameYear ? "MMM d" : "MMM d, yyyy")} – ${format(e.endDate, "MMM d, yyyy")}`;
}

const colorClasses: Record<string, string> = {
  primary: "bg-primary text-inverted",
  secondary: "bg-secondary text-inverted",
  success: "bg-success text-inverted",
  warning: "bg-warning text-inverted",
  error: "bg-error text-inverted",
  info: "bg-info text-inverted",
  neutral: "bg-neutral text-inverted",
};
function barClass(color?: string) {
  return colorClasses[color ?? "primary"] ?? colorClasses.primary;
}
</script>

<template>
  <div
    class="not-prose my-6 rounded-lg border border-(--ui-border) bg-(--ui-bg) overflow-hidden"
  >
    <!-- Toolbar -->
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-(--ui-border) px-4 py-3"
    >
      <div class="flex items-center gap-2">
        <LucideCalendarDays class="size-5 text-(--ui-text-muted)" />
        <span class="text-lg font-semibold text-(--ui-text-highlighted)">
          {{
            view === "month"
              ? format(currentDate, "MMMM yyyy")
              : currentDate.getFullYear()
          }}
        </span>
      </div>

      <div class="flex items-center gap-1.5">
        <UButton size="xs" color="neutral" variant="soft" @click="goToday"
          >Today</UButton
        >

        <div class="flex items-center rounded-md border border-(--ui-border)">
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            square
            :aria-label="view === 'month' ? 'Previous month' : 'Previous year'"
            @click="view === 'month' ? prevMonth() : prevYear()"
          >
            <LucideChevronLeft class="size-4" />
          </UButton>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            square
            :aria-label="view === 'month' ? 'Next month' : 'Next year'"
            @click="view === 'month' ? nextMonth() : nextYear()"
          >
            <LucideChevronRight class="size-4" />
          </UButton>
        </div>

        <div
          class="flex items-center rounded-md border border-(--ui-border) p-0.5"
        >
          <button
            class="rounded px-2 py-1 text-xs font-medium transition-colors"
            :class="
              view === 'month'
                ? 'bg-primary text-inverted'
                : 'text-(--ui-text-muted) hover:text-(--ui-text)'
            "
            @click="view = 'month'"
          >
            Month
          </button>
          <button
            class="rounded px-2 py-1 text-xs font-medium transition-colors"
            :class="
              view === 'year'
                ? 'bg-primary text-inverted'
                : 'text-(--ui-text-muted) hover:text-(--ui-text)'
            "
            @click="view = 'year'"
          >
            Year
          </button>
        </div>
      </div>
    </div>

    <!-- Month view -->
    <div v-if="view === 'month'">
      <div
        class="grid grid-cols-7 border-b border-(--ui-border) bg-(--ui-bg-elevated)/40"
      >
        <div
          v-for="d in WEEKDAYS"
          :key="d"
          class="py-2 text-center text-[11px] font-medium uppercase tracking-wide text-(--ui-text-muted)"
        >
          {{ d }}
        </div>
      </div>

      <div>
        <div
          v-for="{ week, bars, hidden } in weeksWithBars"
          :key="week[0].toISOString()"
          class="relative border-b border-(--ui-border) last:border-b-0"
        >
          <!-- day cells -->
          <div class="grid grid-cols-7">
            <button
              v-for="day in week"
              :key="day.toISOString()"
              type="button"
              class="flex h-[88px] sm:h-[104px] flex-col items-start gap-1 border-r border-(--ui-border) p-1.5 pb-0 text-left last:border-r-0 transition-colors"
              :class="[
                !isSameMonth(day, currentDate)
                  ? 'bg-(--ui-bg-elevated)/30 text-(--ui-text-dimmed)'
                  : 'text-(--ui-text)',
                isSameDay(day, selectedDay)
                  ? 'ring-2 ring-inset ring-primary'
                  : 'hover:bg-(--ui-bg-elevated)/60',
              ]"
              @click="selectDay(day)"
            >
              <span
                class="flex size-6 items-center justify-center rounded-full text-xs font-medium"
                :class="isToday(day) ? 'bg-primary text-inverted' : ''"
              >
                {{ format(day, "d") }}
              </span>
            </button>
          </div>

          <!-- event bars overlay -->
          <div
            class="pointer-events-none absolute inset-x-0 top-8 sm:top-9 grid grid-cols-7 gap-x-0 px-0.5"
          >
            <div
              v-for="bar in bars"
              :key="bar.event.id + bar.lane"
              class="pointer-events-auto mb-[3px] mx-0.5 truncate rounded px-1.5 py-[2px] text-[10px] sm:text-[11px] font-medium cursor-pointer"
              :class="barClass(bar.event.color)"
              :style="{
                gridColumnStart: bar.colStart,
                gridColumnEnd: bar.colEnd,
                gridRow: bar.lane + 1,
              }"
              :title="bar.event.title"
              @click="selectDay(week[bar.colStart - 1])"
            >
              {{ bar.event.title }}
            </div>
          </div>

          <!-- +N more indicators -->
          <div
            class="pointer-events-none absolute inset-x-0 bottom-0.5 grid grid-cols-7 px-0.5"
          >
            <div v-for="(count, i) in hidden" :key="i" class="px-1.5">
              <span
                v-if="count > 0"
                class="pointer-events-auto cursor-pointer text-[10px] font-medium text-(--ui-text-muted) hover:text-(--ui-text)"
                @click="selectDay(week[i])"
              >
                +{{ count }} more
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Year view -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-(--ui-border) p-px"
    >
      <div
        v-for="m in yearMonths"
        :key="m.monthDate.toISOString()"
        class="bg-(--ui-bg) p-3 cursor-pointer hover:bg-(--ui-bg-elevated)/50 transition-colors"
        @click="openMonth(m.monthDate)"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-semibold text-(--ui-text-highlighted)">{{
            format(m.monthDate, "MMMM")
          }}</span>
          <UBadge
            v-if="m.eventCount"
            size="xs"
            color="primary"
            variant="subtle"
            >{{ m.eventCount }}</UBadge
          >
        </div>
        <div class="grid grid-cols-7 gap-y-1 text-center">
          <span
            v-for="d in WEEKDAYS"
            :key="d"
            class="text-[9px] text-(--ui-text-dimmed)"
            >{{ d[0] }}</span
          >
          <span
            v-for="day in m.days"
            :key="day.toISOString()"
            class="relative flex h-5 items-center justify-center text-[10px]"
            :class="
              !isSameMonth(day, m.monthDate)
                ? 'text-(--ui-text-dimmed)/40'
                : 'text-(--ui-text-muted)'
            "
          >
            {{ format(day, "d") }}
            <span
              v-if="isSameMonth(day, m.monthDate) && eventsForDay(day).length"
              class="absolute bottom-0 size-1 rounded-full"
              :class="isToday(day) ? 'bg-primary' : 'bg-primary/60'"
            />
          </span>
        </div>
      </div>
    </div>

    <!-- Selected day details -->
    <div
      class="border-t border-(--ui-border) bg-(--ui-bg-elevated)/30 px-4 py-3"
    >
      <p
        class="mb-2 text-xs font-medium uppercase tracking-wide text-(--ui-text-muted)"
      >
        {{ format(selectedDay, "EEEE, MMMM d, yyyy") }}
      </p>

      <p
        v-if="!selectedDayEvents.length"
        class="text-sm text-(--ui-text-dimmed)"
      >
        No events on this day.
      </p>

      <ul v-else class="flex flex-col gap-2">
        <li
          v-for="e in selectedDayEvents"
          :key="e.id"
          class="flex items-start gap-2 rounded-md border border-(--ui-border) bg-(--ui-bg) p-2.5"
        >
          <span
            class="mt-1 size-2 shrink-0 rounded-full"
            :class="barClass(e.color).split(' ')[0]"
          />
          <div class="min-w-0">
            <p class="text-sm font-medium text-(--ui-text-highlighted)">
              {{ e.title }}
            </p>
            <p class="text-xs text-(--ui-text-muted)">
              {{ eventDateLabel(e) }}
            </p>
            <p
              v-if="e.location"
              class="mt-0.5 flex items-center gap-1 text-xs text-(--ui-text-muted)"
            >
              <LucideMapPin class="size-3" /> {{ e.location }}
            </p>
            <p v-if="e.description" class="mt-1 text-xs text-(--ui-text)">
              {{ e.description }}
            </p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
