export interface ParsedTask {
  title: string;
  priority: string;
  dueDate: string | undefined;
  assignee: string;
  domain: string;
  estimatedMinutes: number | undefined;
}

const PRIORITY_KEYWORDS: Record<string, string> = {
  urgent: 'P1',
  high: 'P2',
  medium: 'P3',
  low: 'P4',
};

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const ASSIGNEES = ['maneesh', 'ashish', 'likitesh', 'sumeeth', 'chandu'];

function getNextWeekday(targetDay: number): Date {
  const today = new Date();
  const current = today.getDay();
  const diff = (targetDay - current + 7) % 7 || 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result;
}

function formatDate(date: Date, time?: string): string {
  const iso = date.toISOString().slice(0, 10);
  if (time) {
    return `${iso}T${time}`;
  }
  return iso;
}

function parseTime(token: string): string | null {
  // Match "3pm", "3am", "15:00", "9:30am"
  const twelveHour = token.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/i);
  if (twelveHour) {
    let hours = parseInt(twelveHour[1], 10);
    const minutes = twelveHour[2] ? parseInt(twelveHour[2], 10) : 0;
    const meridiem = twelveHour[3].toLowerCase();
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  // Match "15:00", "09:30"
  const twentyFourHour = token.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    const hours = parseInt(twentyFourHour[1], 10);
    const minutes = parseInt(twentyFourHour[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }
  return null;
}

export function parseTaskInput(input: string): ParsedTask {
  let remaining = input.trim();
  let priority = 'P3';
  let dueDate: string | undefined;
  let assignee = 'Self';
  let domain = 'professional';
  let estimatedMinutes: number | undefined;
  let parsedTime: string | undefined;

  // 1. Priority: explicit P1-P4 (case-insensitive)
  const explicitPriority = remaining.match(/\b(P[1-4])\b/i);
  if (explicitPriority) {
    priority = explicitPriority[1].toUpperCase();
    remaining = remaining.replace(explicitPriority[0], ' ');
  } else {
    // Keyword priorities (urgent, high, medium, low) — only match whole words
    for (const [keyword, level] of Object.entries(PRIORITY_KEYWORDS)) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(remaining)) {
        priority = level;
        remaining = remaining.replace(regex, ' ');
        break;
      }
    }
  }

  // 2. Estimated time: "Xm", "X min", "Xh", "X hour(s)" — parse before due date to avoid token conflicts
  const timeEstimatePattern = /\b(\d+)\s*(hours?|h|minutes?|mins?|m)\b/gi;
  let timeMatch: RegExpExecArray | null;
  while ((timeMatch = timeEstimatePattern.exec(remaining)) !== null) {
    const value = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      estimatedMinutes = value * 60;
    } else {
      estimatedMinutes = value;
    }
    remaining = remaining.replace(timeMatch[0], ' ');
    // Reset regex since we modified the string
    timeEstimatePattern.lastIndex = 0;
    break;
  }

  // 3. Due date: scan tokens for date keywords and time
  const tokens = remaining.split(/\s+/);
  const usedTokenIndices = new Set<number>();
  let dateBase: Date | undefined;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].toLowerCase();
    const nextToken = tokens[i + 1]?.toLowerCase();

    if (token === 'today') {
      dateBase = new Date();
      usedTokenIndices.add(i);
    } else if (token === 'tomorrow') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      dateBase = d;
      usedTokenIndices.add(i);
    } else if (token === 'next' && nextToken === 'week') {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      dateBase = d;
      usedTokenIndices.add(i);
      usedTokenIndices.add(i + 1);
    } else if (WEEKDAYS.includes(token)) {
      dateBase = getNextWeekday(WEEKDAYS.indexOf(token));
      usedTokenIndices.add(i);
    } else {
      // YYYY-MM-DD
      const isoDate = tokens[i].match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoDate) {
        dateBase = new Date(tokens[i]);
        usedTokenIndices.add(i);
        continue;
      }
      // MM/DD
      const mdDate = tokens[i].match(/^(\d{1,2})\/(\d{1,2})$/);
      if (mdDate) {
        const year = new Date().getFullYear();
        dateBase = new Date(`${year}-${mdDate[1].padStart(2, '0')}-${mdDate[2].padStart(2, '0')}`);
        usedTokenIndices.add(i);
        continue;
      }
      // Time patterns
      const time = parseTime(tokens[i]);
      if (time && !parsedTime) {
        parsedTime = time;
        usedTokenIndices.add(i);
      }
    }
  }

  if (dateBase !== undefined) {
    dueDate = formatDate(dateBase, parsedTime);
  } else if (parsedTime) {
    // Time given but no explicit date — assume today
    dueDate = formatDate(new Date(), parsedTime);
  }

  // Remove used date/time tokens from remaining
  const filteredTokens = tokens.filter((_, i) => !usedTokenIndices.has(i));
  remaining = filteredTokens.join(' ');

  // 4. Assignee: "for Maneesh", "for Ashish", etc.
  const assigneePattern = new RegExp(`\\bfor\\s+(${ASSIGNEES.join('|')})\\b`, 'i');
  const assigneeMatch = remaining.match(assigneePattern);
  if (assigneeMatch) {
    const name = assigneeMatch[1];
    assignee = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    remaining = remaining.replace(assigneeMatch[0], ' ');
  } else {
    // Also check if an assignee name appears without "for" prefix — used for preview badge
    const bareAssigneePattern = new RegExp(`\\b(${ASSIGNEES.join('|')})\\b`, 'i');
    const bareMatch = remaining.match(bareAssigneePattern);
    if (bareMatch) {
      const name = bareMatch[1];
      assignee = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      // Do NOT remove from title — the name likely appears in context like "Call Maneesh about leads"
    }
  }

  // 5. Domain
  const personalKeywords = /\b(personal|health|fitness)\b/i;
  if (personalKeywords.test(remaining)) {
    domain = 'personal';
    remaining = remaining.replace(personalKeywords, ' ');
  }

  // Clean up title
  const title = remaining.replace(/\s{2,}/g, ' ').trim();

  return {
    title,
    priority,
    dueDate,
    assignee,
    domain,
    estimatedMinutes,
  };
}
