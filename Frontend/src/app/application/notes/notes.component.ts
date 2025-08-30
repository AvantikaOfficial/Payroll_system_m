import { Component, OnInit } from '@angular/core';
import { NotesService, Note } from '../../Services/Notes-services/notes.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  showModal = false;

  newNote: Note = {
    id: 0,
    title: '',
    description: '',
    assignee: '',
    tag: '',
    priority: 'Low',
    due_date: '',
    status: 'Pending',
    isImportant: false,
    isDeleted: false,
    selected: false
  };

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.notes = this.notesService.getNotes();
    this.filteredNotes = this.notes.filter(n => !n.isDeleted);
  }

  showAll(): void {
    this.filteredNotes = this.notes.filter(n => !n.isDeleted);
  }

  showImportant(): void {
    this.filteredNotes = this.notes.filter(n => n.isImportant && !n.isDeleted);
  }

  showTrash(): void {
    this.filteredNotes = this.notes.filter(n => n.isDeleted);
  }

  addNote(): void {
    if (!this.newNote.title.trim()) return;

    this.newNote.id = Date.now();
    this.notesService.addNote({ ...this.newNote });
    this.newNote = {
      id: 0,
      title: '',
      description: '',
      assignee: '',
      tag: '',
      priority: 'Low',
      due_date: '',
      status: 'Pending',
      isImportant: false,
      isDeleted: false,
      selected: false
    };
    this.closeModal();
    this.loadNotes();
  }

  deleteNote(id: number): void {
    this.notesService.deleteNote(id);
    this.loadNotes();
  }

  toggleImportant(note: Note): void {
    this.notesService.toggleImportant(note);
    this.loadNotes();
  }

  onBulkActionFromEvent(event: Event): void {
    const action = (event.target as HTMLSelectElement).value;
    if (action === 'delete') {
      this.notes.filter(n => n.selected).forEach(n => {
        this.notesService.deleteNote(n.id);
      });
    } else if (action === 'mark') {
      this.notes.forEach(n => (n.selected = true));
    } else if (action === 'unmark') {
      this.notes.forEach(n => (n.selected = false));
    }
    this.notesService.updateNotes(this.notes);
    this.loadNotes();
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}