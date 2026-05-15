import { PaymentResponse } from '../types/api'

const KEY = 'paymentHistory'

export interface PaymentHistoryItem extends PaymentResponse {
  savedAt: string
}

export function savePaymentHistory(payment: PaymentResponse): void {
  const existing = loadPaymentHistory()
  const already = existing.find((p) => p.orderId === payment.orderId)
  if (already) return
  const item: PaymentHistoryItem = { ...payment, savedAt: new Date().toISOString() }
  localStorage.setItem(KEY, JSON.stringify([item, ...existing].slice(0, 100)))
}

export function loadPaymentHistory(): PaymentHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}
