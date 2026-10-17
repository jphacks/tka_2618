// 日付と時刻の表示用の関数です。

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// '2026-10-01' → '2026年10月1日'
export function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return `${year}年${month}月${day}日`;
}

// '2026-10-18T19:00' → '10月18日（日）19:00'
export function formatDateTime(dateTime: string) {
  const [date, time] = dateTime.split('T');
  const [year, month, day] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${month}月${day}日（${weekday}）${time}`;
}

// '2026-10-18T19:00' → '2026/10/18 19:00'（入力欄の表示用）
export function formatDateTimeInput(dateTime: string) {
  const [date, time] = dateTime.split('T');
  return `${date.split('-').join('/')} ${time}`;
}

// 今日の日付を '2026-10-18' の形で返します
export function todayString(now = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
