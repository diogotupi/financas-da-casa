import { useCallback, useEffect, useRef, useState } from 'react'
import { isSyncConfigured, saveProfiles } from '../lib/sync'
import { subscribeSyncPoll } from '../lib/syncPoll'
import type { Person, Profiles } from '../types'

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profiles>({})
  const [uploading, setUploading] = useState<Person | null>(null)
  const profilesRef = useRef(profiles)
  const savingRef = useRef(false)

  profilesRef.current = profiles

  useEffect(() => {
    if (!isSyncConfigured) return

    return subscribeSyncPoll((result) => {
      if (savingRef.current) return
      if (result.ok) setProfiles(result.data.profiles)
    })
  }, [])

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
