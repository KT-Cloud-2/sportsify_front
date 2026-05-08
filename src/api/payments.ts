import { client } from './client'
import { PaymentResponse, PaymentRequestBody, PaymentVerifyBody } from '../types/api'

export const fetchPayments = () =>
  client.get<PaymentResponse[]>('/api/payments').then((r) => r.data)

export const fetchPayment = (paymentId: number) =>
  client.get<PaymentResponse>(`/api/payments/${paymentId}`).then((r) => r.data)

export const requestPayment = (body: PaymentRequestBody) =>
  client.post<PaymentResponse>('/api/payments/request', body).then((r) => r.data)

export const verifyPayment = (body: PaymentVerifyBody) =>
  client.post<PaymentResponse>('/api/payments/verify', body).then((r) => r.data)

export const refundPayment = (paymentId: number) =>
  client.post<void>(`/api/payments/${paymentId}/refund`)
