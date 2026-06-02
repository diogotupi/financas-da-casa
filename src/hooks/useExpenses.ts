import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchExpenses, isSyncConfigured, saveExpenses } from '../lib/sync'
import type { Expense, Person } from '../types'

const LEGACY_STORAGE_KEY = 'financas-da-casa-expenses'
const POLL_MS = 1200

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const expensesRef = useRef(expenses)
  const savingRef = useRef(false)

  expensesRef.current = expenses

  const pull = useCallback(async () => {
    if (!isSyncConfigured) return
    if (savingRef.current) return

    try {
      const data = await fetchExpenses()
      setExpenses(data)
      setSynced(true)
      setLoading(false)
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de sincronização')
      setLoading(false)
      setSynced(false)
      return null
    }
  }, [])

  useEffect(() => {
    if (!isSyncConfigured) {
      setError('sync-not-configured')
      setLoading(false)
      return
    }

    let cancelled = false

    async function init() {
      const data = await pull()
      if (cancelled) return

      if (data && data.length === 0) {
        try {
          const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
          if (raw) {
            const legacy = JSON.parse(raw) as Expense[]
            if (legacy.length > 0) {
              savingRef.current = true
              await saveExpenses(legacy)
              localStorage.removeItem(LEGACY_STORAGE_KEY)
              setExpenses(legacy)
            }
          }
        } catch {
          // ignora migração
        } finally {
          savingRef.current = false
        }
      }
    }

    void init()
    const id = setInterval(() => void pull(), POLL_MS)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [pull])

  const persist = useCallback(async (next: Expense[]) => {
    savingRef.current = true
    setExpenses(next)
    try {
      await saveExpenses(next)
      setSynced(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
      await pull()
      throw err
    } finally {
      savingRef.current = false
    }
  }, [pull])

  const addExpense = useCallback(
    async (data: {
      description: string
      amount: number
      paidBy: Person
      date: string
    }) => {
      const expense: Expense = {
        id: crypto.randomUUID(),
        description: data.description.trim(),
        amount: data.amount,
        paidBy: data.paidBy,
        date: data.date,
        settled: false,
      }
      await persist([expense, ...expensesRef.current])
    },
    [persist],
  )

  const toggleSettled = useCallback(
    async (id: string) => {
      const next = expensesRef.current.map((e) =>
        e.id === id ? { ...e, settled: !e.settled } : e,
      )
      await persist(next)
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

  return {
    expenses,
    loading,
    synced,
    error,
    addExpense,
    toggleSettled,
    removeExpense,
  }
}
