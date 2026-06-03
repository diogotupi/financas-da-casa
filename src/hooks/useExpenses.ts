import { useCallback, useEffect, useRef, useState } from 'react'
import { readExpensesCache, writeExpensesCache } from '../lib/expenseCache'
import { findExpense, normalizeExpense } from '../lib/expenses'
import { isSyncConfigured, saveExpenses } from '../lib/sync'
import { subscribeSyncPoll } from '../lib/syncPoll'
import type { Expense, PaymentMethod, Person } from '../types'

const LEGACY_STORAGE_KEY = 'financas-da-casa-expenses'

export type SyncState = 'loading' | 'ok' | 'stale' | 'error'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => readExpensesCache())
  const [loading, setLoading] = useState(true)
  const [syncState, setSyncState] = useState<SyncState>('loading')
  const [error, setError] = useState<string | null>(null)
  const expensesRef = useRef(expenses)
  const savingRef = useRef(false)

  expensesRef.current = expenses

  const applySyncFailure = useCallback((err: Error) => {
    const cached = readExpensesCache()
    const fallback = expensesRef.current.length > 0 ? expensesRef.current : cached

    if (fallback.length > 0) {
      setExpenses(fallback)
      setSyncState('stale')
      setError(
        err.message.includes('rate limit')
          ? 'Limite da API do GitHub atingido. Mostrando a última cópia — tentamos de novo em alguns minutos.'
          : 'Não foi possível sincronizar agora. Mostrando a última cópia salva — os dados no GitHub estão seguros.',
      )
    } else {
      setSyncState('error')
      setError(err.message)
    }
    setLoading(false)
  }, [])

  const applySyncSuccess = useCallback((data: Expense[]) => {
    setExpenses(data)
    writeExpensesCache(data)
    setSyncState('ok')
    setLoading(false)
    setError(null)
    return data
  }, [])

  useEffect(() => {
    if (!isSyncConfigured) {
      setError('sync-not-configured')
      setLoading(false)
      setSyncState('error')
      return
    }

    let migrated = false

    return subscribeSyncPoll((result) => {
      if (savingRef.current) return

      if (result.ok) {
        const data = applySyncSuccess(result.data.expenses)

        if (!migrated && data.length === 0) {
          migrated = true
          void (async () => {
            try {
              const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
              if (!raw) return
              const legacy = JSON.parse(raw) as unknown[]
              const list = legacy
                .map(normalizeExpense)
                .filter((e): e is Expense => e !== null)
              if (list.length === 0) return
              savingRef.current = true
              await saveExpenses(list)
              writeExpensesCache(list)
              localStorage.removeItem(LEGACY_STORAGE_KEY)
              setExpenses(list)
              setSyncState('ok')
              setError(null)
            } catch {
              // ignora migração
            } finally {
              savingRef.current = false
            }
          })()
        }
        return
      }

      applySyncFailure(result.error)
    })
  }, [applySyncFailure, applySyncSuccess])

  const persist = useCallback(
    async (next: Expense[]) => {
      savingRef.current = true
      setExpenses(next)
      writeExpensesCache(next)
      try {
        await saveExpenses(next)
        setSyncState('ok')
        setError(null)
      } catch (err) {
        setSyncState('stale')
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível salvar na nuvem. Tente de novo em alguns minutos.',
        )
        throw err
      } finally {
        savingRef.current = false
      }
    },
    [],
  )

  const addExpense = useCallback(
    async (data: {
      description: string
      amount: number
      paidBy: Person
      date: string
      paymentMethod: PaymentMethod
      installments?: number
    }) => {
      const expense: Expense = {
        id: crypto.randomUUID(),
        description: data.description.trim(),
        amount: data.amount,
        paidBy: data.paidBy,
        date: data.date,
        paymentMethod: data.paymentMethod,
        ...(data.paymentMethod === 'credito' &&
        data.installments &&
        data.installments >= 2
          ? { installments: data.installments }
          : {}),
      }
      await persist([expense, ...expensesRef.current])
    },
    [persist],
  )

  const removeExpense = useCallback(
    async (id: string) => {
      const next = expensesRef.current.filter((e) => e.id !== id)
      await persist(next)
    },
    [persist],
  )

  const updateExpense = useCallback(
    async (
      id: string,
      patch: { description?: string; amount?: number },
      options?: { fromInstallmentSlice?: boolean },
    ) => {
      const current = findExpense(expensesRef.current, id)
      if (!current) return

      let description =
        patch.description !== undefined ? patch.description.trim() : current.description
      let amount = patch.amount !== undefined ? patch.amount : current.amount

      if (options?.fromInstallmentSlice && current.paymentMethod === 'credito') {
        const n = current.installments ?? 1
        if (n >= 2 && patch.amount !== undefined) {
          amount = Math.round(patch.amount * n * 100) / 100
        }
        if (patch.description !== undefined) {
          description = patch.description.replace(/\s+\d+\/\d+$/, '').trim() || description
        }
      }

      if (!description || amount <= 0) return
      if (description === current.description && amount === current.amount) return

      const next = expensesRef.current.map((e) =>
        e.id === id ? { ...e, description, amount } : e,
      )
      await persist(next)
    },
    [persist],
  )

  return {
    expenses,
    loading,
    synced: syncState === 'ok',
    syncState,
    error,
    addExpense,
    removeExpense,
    updateExpense,
  }
}
