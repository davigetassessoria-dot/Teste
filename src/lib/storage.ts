import { supabase } from './supabase'
import type { Project } from '../types'

const STORAGE_KEY = 'appforge_project'

export async function saveProject(project: Project): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
  } catch {
    // localStorage might be full, ignore
  }
}

export async function loadProject(id: string): Promise<Project | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const project = JSON.parse(raw) as Project
    return project.id === id ? project : null
  } catch {
    return null
  }
}
