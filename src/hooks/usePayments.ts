import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createPayment,
  confirmPayment,
  confirmPaymentMock,
  cancelPayment,
} from '../api/payments'
import {
  CreatePaymentRequest,
  ConfirmPaymentRequest,
  CancelPaymentRequest,
} from '../types/api'

export const useCreatePayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePaymentRequest) => createPayment(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

export const useConfirmPayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ConfirmPaymentRequest) => confirmPayment(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

export const useConfirmPaymentMock = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ConfirmPaymentRequest) => confirmPaymentMock(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })
}

export const useCancelPayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ paymentId, body }: { paymentId: number; body: CancelPaymentRequest }) =>
      cancelPayment(paymentId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })
}
