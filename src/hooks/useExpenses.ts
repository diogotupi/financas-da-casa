import { useCallback, useEffect, useState } from 'react'
import type { Expense, Person } from '../types'

const STORAGE_KEY = 'financas-da-casa-expenses'

function load(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Expense[]
  } catch {
    return []
  }
}

function save(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(load)

  useEffect(() => {
    save(expenses)
  }, [expenses])

  const addExpense = useCallback(
    (data: { description: string; amount: number; paidBy: Person; date: string }) => {
      const expense: Expense = {
        id: crypto.randomUUID(),
        description: data.description.trim(),
        amount: data.amount,
        paidBy: data.paidBy,
        date: data.date,
        settled: false,
      }
      setExpenses((prev) => [expense, ...prev])
    },
    [],
  )

  const toggleSettled = useCallback((id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, settled: !e.settled } : e)),
    )
  }, [])

  const removeExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { expenses, addExpense, toggleSettled, removeExpense }
}
