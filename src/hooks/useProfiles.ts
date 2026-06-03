import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchProfiles, isSyncConfigured, saveProfiles } from '../lib/sync'
import { SYNC_POLL_MS } from '../lib/syncConfig'
import type { Person, Profiles } from '../types'

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profiles>({})
  const [uploading, setUploading] = useState<Person | null>(null)
  const profilesRef = useRef(profiles)
  const savingRef = useRef(false)

  profilesRef.current = profiles

  const pull = useCallback(async () => {
    if (!isSyncConfigured) return
    if (savingRef.current) return

    try {
      const data = await fetchProfiles()
      setProfiles(data)
    } catch {
      // mantém último estado conhecido
    }
  }, [])

  useEffect(() => {
    if (!isSyncConfigured) return

    void pull()
    const id = setInterval(() => void pull(), SYNC_POLL_MS)
    return () => clearInterval(id)
  }, [pull])

  const uploadPhoto = useCallback(async (person: Person, dataUrl: string) => {
    setUploading(person)
    savingRef.current = true
    try {
      const next = { ...profilesRef.current, [person]: dataUrl }
      setProfiles(next)
      await saveProfiles(next)
    } finally {
      savingRef.current = false
      setUploading(null)
    }
  }, [])

  return { profiles, uploading, uploadPhoto }
}
