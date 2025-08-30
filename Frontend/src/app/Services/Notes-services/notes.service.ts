import { Injectable } from '@angular/core';

export interface Note {
  id: number;
  title: string;
  description: string;
  assignee?: string;
  tag?: string;
  priority?: string;
  due_date?: string;
  status?: string;
  isImportant?: boolean;
  isDeleted?: boolean;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private storageKey = 'notes';

  constructor() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  private saveNotes(notes: Note[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(notes));
  }

  getNotes(): Note[] {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  addNote(note: Note): void {
    const notes = this.getNotes();
    notes.push(note);
    this.saveNotes(notes);
  }

  updateNotes(notes: Note[]): void {
    this.saveNotes(notes);
  }

  deleteNote(id: number): void {
    const notes = this.getNotes();
    const updated = notes.map(n => n.id === id ? { ...n, isDeleted: true } : n);
    this.saveNotes(updated);
  }

  toggleImportant(note: Note): void {
    const notes = this.getNotes();
    const updated = notes.map(n =>
      n.id === note.id ? { ...n, isImportant: !n.isImportant } : n
    );
    this.saveNotes(updated);
  }
}