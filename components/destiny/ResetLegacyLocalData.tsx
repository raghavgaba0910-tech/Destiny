'use client'

import { useEffect } from 'react'

const dataVersion = '2'
const versionKey = 'destiny-local-data-version'

export function ResetLegacyLocalData() {
  useEffect(() => {
    try {
      if (window.localStorage.getItem(versionKey) === dataVersion) return
      for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
        const key = window.localStorage.key(index)
        if (key?.startsWith('destiny-assessment-')) window.localStorage.removeItem(key)
      }
      window.localStorage.setItem(versionKey, dataVersion)
    } catch (error) {
      console.warn('Local assessment drafts could not be cleared:', error)
    }
  }, [])
  return null
}
