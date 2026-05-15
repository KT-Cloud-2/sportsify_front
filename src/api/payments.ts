import { client } from './client'
import {
  PaymentResponse,
  CreatePaymentRequest,
  ConfirmPaymentRequest,
  CancelPaymentRequest,
} from '../types/api'

export const createPayment = (body: CreatePaymentRequest) =>
  client.post<PaymentResponse>('/payments', body).then((r) => r.data)

export const confirmPayment = (body: ConfirmPaymentRequest) =>
  client.post<PaymentResponse>('/payments/confirm', body).then((r) => r.data)

export const confirmPaymentMock = (body: ConfirmPaymentRequest) =>
  client.post<PaymentResponse>('/payments/confirm/mock', body).then((r) => r.data)

export const cancelPayment = (paymentId: number, body: CancelPaymentRequest) =>
  client.post<PaymentResponse>(`/payments/${paymentId}/cancel`, body).then((r) => r.data)
