import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPayments,
  fetchPayment,
  requestPayment,
  verifyPayment,
  refundPayment,
} from '../api/payments'
import { PaymentRequestBody, PaymentVerifyBody } from '../types/api'
import { useAuthStore } from '../store/auth'

export const usePayments = () => {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
    enabled: !!accessToken,
    throwOnError: false,
  })
}

export const usePayment = (paymentId: number) =>
  useQuery({
    queryKey: ['payments', paymentId],
    queryFn: () => fetchPayment(paymentId),
    enabled: paymentId > 0,
    throwOnError: false,
  })

export const useRequestPayment = () =>
  useMutation({ mutationFn: (body: PaymentRequestBody) => requestPayment(body) })

export const useVerifyPayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: PaymentVerifyBody) => verifyPayment(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export const useRefundPayment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (paymentId: number) => refundPayment(paymentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })
}
