/**
 * SCM TanStack Query hooks.
 * Wraps scmService with React Query for caching, invalidation, and mutations.
 * Follows the same pattern as dealerQueries.ts.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { scmService } from '@/services/scmService'
import type {
  TransferStatus,
  PurchaseRecommendationStatus,
  SupplyPeriod,
  POLine,
} from '@/types/scm'

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const scmKeys = {
  all: ['scm'] as const,
  dashboard: () => [...scmKeys.all, 'dashboard'] as const,
  requirements: (opts?: object) => [...scmKeys.all, 'requirements', opts ?? {}] as const,
  requirement: (id: string) => [...scmKeys.all, 'requirement', id] as const,
  transfers: (opts?: object) => [...scmKeys.all, 'transfers', opts ?? {}] as const,
  transfer: (id: string) => [...scmKeys.all, 'transfer', id] as const,
  centralInventory: () => [...scmKeys.all, 'central-inventory'] as const,
  centralAllocations: (opts?: object) => [...scmKeys.all, 'central-allocations', opts ?? {}] as const,
  suppliers: (opts?: object) => [...scmKeys.all, 'suppliers', opts ?? {}] as const,
  supplier: (id: string) => [...scmKeys.all, 'supplier', id] as const,
  recommendations: (opts?: object) => [...scmKeys.all, 'recommendations', opts ?? {}] as const,
  recommendation: (id: string) => [...scmKeys.all, 'recommendation', id] as const,
  purchaseOrders: (opts?: object) => [...scmKeys.all, 'purchase-orders', opts ?? {}] as const,
  purchaseOrder: (id: string) => [...scmKeys.all, 'purchase-order', id] as const,
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export function useScmDashboard() {
  return useQuery({
    queryKey: scmKeys.dashboard(),
    queryFn: () => scmService.getDashboardSummary(),
    staleTime: 0,
  })
}

// ─── Regional Requirements ───────────────────────────────────────────────────

export function useRegionalRequirements(opts?: {
  region?: string
  sku?: string
  period?: SupplyPeriod
  hasShortage?: boolean
}) {
  return useQuery({
    queryKey: scmKeys.requirements(opts),
    queryFn: () => scmService.getRequirements(opts),
    staleTime: 0,
  })
}

export function useRegionalRequirement(id: string | null) {
  return useQuery({
    queryKey: scmKeys.requirement(id ?? ''),
    queryFn: () => scmService.getRequirementById(id!),
    enabled: !!id,
    staleTime: 0,
  })
}

export function useOverrideRequirement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      scmOverride: number
      reason?: string
    }) => Promise.resolve(scmService.overrideRequirement(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scmKeys.all })
    },
  })
}

// ─── Transfers ───────────────────────────────────────────────────────────────

export function useTransfers(opts?: {
  status?: TransferStatus | 'all'
  region?: string
}) {
  return useQuery({
    queryKey: scmKeys.transfers(opts),
    queryFn: () => scmService.getTransfers(opts),
    staleTime: 0,
  })
}

export function useTransfer(id: string | null) {
  return useQuery({
    queryKey: scmKeys.transfer(id ?? ''),
    queryFn: () => scmService.getTransferById(id!),
    enabled: !!id,
    staleTime: 0,
  })
}

export function useConfirmTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      role: 'source_rm' | 'dest_rm'
      comment?: string
    }) => Promise.resolve(scmService.confirmTransfer(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scmKeys.all })
    },
  })
}

export function useRequestTransferRevision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      requestedByRole: 'source_rm' | 'dest_rm'
      comment: string
      proposedAlternativeQty?: number
    }) => Promise.resolve(scmService.requestTransferRevision(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scmKeys.all })
    },
  })
}

// ─── Central Inventory ───────────────────────────────────────────────────────

export function useCentralInventory() {
  return useQuery({
    queryKey: scmKeys.centralInventory(),
    queryFn: () => scmService.getCentralInventory(),
    staleTime: 0,
  })
}

// ─── Central Allocations ─────────────────────────────────────────────────────

export function useCentralAllocations(opts?: {
  region?: string
  period?: SupplyPeriod
}) {
  return useQuery({
    queryKey: scmKeys.centralAllocations(opts),
    queryFn: () => scmService.getCentralAllocations(opts),
    staleTime: 0,
  })
}

export function useFinalizeAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      scmFinalAllocation: number
      reason?: string
    }) => Promise.resolve(scmService.finalizeAllocation(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scmKeys.all })
    },
  })
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export function useSuppliers(opts?: { category?: string }) {
  return useQuery({
    queryKey: scmKeys.suppliers(opts),
    queryFn: () => scmService.getSuppliers(opts),
    staleTime: 60_000,
  })
}

export function useSupplier(id: string | null) {
  return useQuery({
    queryKey: scmKeys.supplier(id ?? ''),
    queryFn: () => scmService.getSupplierById(id!),
    enabled: !!id,
    staleTime: 60_000,
  })
}

// ─── Purchase Recommendations ─────────────────────────────────────────────────

export function usePurchaseRecommendations(opts?: {
  status?: PurchaseRecommendationStatus | 'all'
  period?: SupplyPeriod
}) {
  return useQuery({
    queryKey: scmKeys.recommendations(opts),
    queryFn: () => scmService.getPurchaseRecommendations(opts),
    staleTime: 0,
  })
}

export function usePurchaseRecommendation(id: string | null) {
  return useQuery({
    queryKey: scmKeys.recommendation(id ?? ''),
    queryFn: () => scmService.getPurchaseRecommendationById(id!),
    enabled: !!id,
    staleTime: 0,
  })
}

export function useAcceptRecommendation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      scmQty: number
      reason?: string
      selectedSupplierId: string
    }) => Promise.resolve(scmService.acceptRecommendation(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scmKeys.all })
    },
  })
}

export function useDismissRecommendation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => Promise.resolve(scmService.dismissRecommendation(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scmKeys.all })
    },
  })
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export function usePurchaseOrders(opts?: { status?: string; period?: SupplyPeriod }) {
  return useQuery({
    queryKey: scmKeys.purchaseOrders(opts),
    queryFn: () => scmService.getPurchaseOrders(opts),
    staleTime: 0,
  })
}

export function usePurchaseOrder(id: string | null) {
  return useQuery({
    queryKey: scmKeys.purchaseOrder(id ?? ''),
    queryFn: () => scmService.getPurchaseOrderById(id!),
    enabled: !!id,
    staleTime: 0,
  })
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      recommendationId: string
      supplierId: string
      supplierName: string
      lines: Omit<POLine, 'id'>[]
      notes?: string
      createdBy: string
      period: SupplyPeriod
    }) => Promise.resolve(scmService.createPurchaseOrder(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scmKeys.all })
    },
  })
}

export function useApprovePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; approvedBy: string }) =>
      Promise.resolve(scmService.approvePurchaseOrder(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scmKeys.all })
    },
  })
}
