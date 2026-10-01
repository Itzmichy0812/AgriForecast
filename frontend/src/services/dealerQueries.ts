import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dealerService } from './dealerService'
import type { AdjustForecastInput, CreateManualRequestInput } from '@/types/dealer'

export const dealerQueryKeys = {
  all: ['dealer'] as const,
  dashboard: () => [...dealerQueryKeys.all, 'dashboard'] as const,
  forecasts: (params?: Record<string, unknown>) =>
    [...dealerQueryKeys.all, 'forecasts', params] as const,
  forecast: (id: string) => [...dealerQueryKeys.all, 'forecast', id] as const,
  inventory: (params?: Record<string, unknown>) =>
    [...dealerQueryKeys.all, 'inventory', params] as const,
  requests: (params?: Record<string, unknown>) =>
    [...dealerQueryKeys.all, 'requests', params] as const,
  request: (id: string) => [...dealerQueryKeys.all, 'request', id] as const,
}

// Queries
export function useDealerDashboard() {
  return useQuery({
    queryKey: dealerQueryKeys.dashboard(),
    queryFn: () => dealerService.getDashboardSummary(),
  })
}

export function useDealerForecasts(params?: {
  search?: string
  status?: string
  productGroup?: string
  periodKey?: string
}) {
  return useQuery({
    queryKey: dealerQueryKeys.forecasts(params),
    queryFn: () => dealerService.getForecasts(params),
  })
}

export function useDealerForecast(id: string) {
  return useQuery({
    queryKey: dealerQueryKeys.forecast(id),
    queryFn: () => dealerService.getForecastById(id),
    enabled: Boolean(id),
  })
}

export function useDealerInventory(params?: {
  search?: string
  status?: string
}) {
  return useQuery({
    queryKey: dealerQueryKeys.inventory(params),
    queryFn: () => dealerService.getInventory(params),
  })
}

export function useDealerRequests(params?: {
  search?: string
  urgency?: string
  fulfillment?: string
}) {
  return useQuery({
    queryKey: dealerQueryKeys.requests(params),
    queryFn: () => dealerService.getRequests(params),
  })
}

export function useDealerRequest(id: string) {
  return useQuery({
    queryKey: dealerQueryKeys.request(id),
    queryFn: () => dealerService.getRequestById(id),
    enabled: Boolean(id),
  })
}

// Mutations
export function useAdjustForecast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdjustForecastInput) => dealerService.adjustForecast(input),
    onSuccess: (data) => {
      queryClient.setQueryData(dealerQueryKeys.forecast(data.id), data)
      queryClient.invalidateQueries({ queryKey: [...dealerQueryKeys.all, 'forecasts'] })
      queryClient.invalidateQueries({ queryKey: dealerQueryKeys.dashboard() })
    },
  })
}

export function useRevertForecast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (forecastId: string) => dealerService.revertForecast(forecastId),
    onSuccess: (data) => {
      queryClient.setQueryData(dealerQueryKeys.forecast(data.id), data)
      queryClient.invalidateQueries({ queryKey: [...dealerQueryKeys.all, 'forecasts'] })
      queryClient.invalidateQueries({ queryKey: dealerQueryKeys.dashboard() })
    },
  })
}

export function useCreateManualRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateManualRequestInput) => dealerService.createRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...dealerQueryKeys.all, 'requests'] })
      queryClient.invalidateQueries({ queryKey: dealerQueryKeys.dashboard() })
    },
  })
}