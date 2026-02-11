import { Protocol } from "./types";

export const DEFAULT_PROTOCOL = Protocol.SOCKS5;

export const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  bg: '#1e293b',
  text: '#e2e8f0'
};

export const MOCK_LOGS = [
  "در حال آغاز اتصال سوکت...",
  "دست‌دهی (Handshake) موفقیت‌آمیز بود.",
  "بررسی سازگاری پروتکل...",
  "بررسی تاخیر: ۴۵ میلی‌ثانیه",
  "اتصال توسط میزبان رد شد.",
  "پایان زمان انتظار برای هدرهای پاسخ.",
  "روش احراز هویت پشتیبانی نمی‌شود.",
];