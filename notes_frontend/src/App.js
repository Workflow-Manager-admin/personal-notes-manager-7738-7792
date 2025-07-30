import React, { useState, useEffect, useMemo } from "react";
import "./App.css";

/**
 * Modern Notes App - Main Component
 * Implements sidebar navigation, header, main panel for note CRUD, and search
 * - Light, modern theme with provided palette
 * - Pure React + CSS (no UI library)
 */

// Default demo data
const DEMO_NOTES = [
  {
    id: 1,
    title: "Welcome to Notes",
    content: "Select a note or create a new one to get started.",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Your Second Note",
    content: "Notes are editable. Click 'Add' to make a new one.",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  },
];

// Helper for id generation
const nextNoteId = (notes) =>
  notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;

// PUBLIC_INTERFACE
function App() {
  // State: list of notes, selected note id, search value, editing state
  const [notes, setNotes] = useState(() => {
    // Can be replaced with backend load in future
    return DEMO_NOTES;
  });
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(notes.length > 0 ? notes[0].id : null);
  const [editing, setEditing] = useState(false);

  // Derived: filtered notes based on search
  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
    );
  }, [search, notes]);

  // Find selected note obj
  const selectedNote = notes.find((n) => n.id === selectedId) || null;

  // Ensure selectedId always valid (after delete)
  useEffect(() => {
    if (!selectedId && notes.length > 0) setSelectedId(notes[0].id);
    if (selectedId && !notes.some((n) => n.id === selectedId) && notes.length)
      setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  // Handlers
  // PUBLIC_INTERFACE
  function handleAddNote() {
    const now = new Date().toISOString();
    const newNote = {
      id: nextNoteId(notes),
      title: "Untitled",
      content: "",
      created: now,
      updated: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    setEditing(true);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    let idx = notes.findIndex((n) => n.id === id);
    if (idx !== -1) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      // Adjust selection on deletion
      if (selectedId === id) {
        // Pick next visible note if exists
        if (notes.length > 1) {
          const remain = notes.filter((n) => n.id !== id);
          setSelectedId(remain[0].id);
        } else {
          setSelectedId(null);
        }
      }
    }
  }

  // PUBLIC_INTERFACE
  function handleSaveNote(updatedNote) {
    setNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? { ...updatedNote, updated: new Date().toISOString() } : note))
    );
    setEditing(false);
  }

  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setSelectedId(id);
    setEditing(false);
  }

  // PUBLIC_INTERFACE
  function handleEditStart() {
    setEditing(true);
  }

  // Header theme (CSS variable conf)
  useEffect(() => {
    // Set theme variables for app
    document.documentElement.style.setProperty("--primary", "#1976d2");
    document.documentElement.style.setProperty("--secondary", "#424242");
    document.documentElement.style.setProperty("--accent", "#ffab00");
    document.documentElement.style.setProperty("--bg", "#f8f9fc");
    document.documentElement.style.setProperty("--bg-panel", "#fff");
    document.documentElement.style.setProperty("--sidebar-bg", "#e7eefc");
    document.documentElement.style.setProperty("--border", "#e0e0e0");
    document.documentElement.style.setProperty("--text-main", "#222");
    document.documentElement.style.setProperty("--text-light", "#fff");
    document.documentElement.style.setProperty("--text-secondary", "#757575");
  }, []);

  return (
    <div className="notes-app-root">
      <Sidebar
        notes={filteredNotes}
        selectedId={selectedId}
        onSelect={handleSelectNote}
        onDelete={handleDeleteNote}
        search={search}
        setSearch={setSearch}
        onAdd={handleAddNote}
      />
      <main className="main-panel">
        <Header
          onAdd={handleAddNote}
          search={search}
          setSearch={setSearch}
        />
        <div className="note-panel">
          {selectedNote ? (
            editing ? (
              <NoteEditor note={selectedNote}
                onSave={handleSaveNote}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <NoteViewer
                note={selectedNote}
                onEdit={handleEditStart}
                onDelete={handleDeleteNote}
              />
            )
          ) : (
            <EmptyState onAdd={handleAddNote} />
          )}
        </div>
      </main>
    </div>
  );
}

// Sidebar navigation with note list
function Sidebar({
  notes,
  selectedId,
  onSelect,
  onDelete,
  search,
  setSearch,
  onAdd,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Notes</span>
        <button className="btn-accent" onClick={onAdd} title="Add note">
          ＋
        </button>
      </div>
      <div className="sidebar-search">
        <input
          type="text"
          className="search-box"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ul className="note-list">
        {notes.length === 0 && (
          <li className="note-empty">No notes found.</li>
        )}
        {notes.map((note) => (
          <li
            key={note.id}
            className={`note-list-item ${
              note.id === selectedId ? "selected" : ""
            }`}
            onClick={() => onSelect(note.id)}
            tabIndex={0}
            aria-current={note.id === selectedId}
          >
            <div className="note-title">{note.title}</div>
            <button
              className="delete-btn"
              title="Delete note"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// Header with search and add note button
function Header({ onAdd, search, setSearch }) {
  return (
    <div className="app-header">
      <div className="logo-area">
        <span className="header-logo">🗒️</span>
        <span className="header-title">NotesApp</span>
      </div>
      <div className="header-search">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box main"
        />
      </div>
      <div>
        <button className="btn-accent header-add" onClick={onAdd} title="Add note">
          ＋ Add
        </button>
      </div>
    </div>
  );
}

// Note viewer panel
function NoteViewer({ note, onEdit, onDelete }) {
  return (
    <div className="note-view">
      <div className="note-meta">
        <span className="note-view-title">{note.title}</span>
        <div>
          <button className="btn btn-secondary" onClick={onEdit} title="Edit note">
            ✏️ Edit
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(note.id)} title="Delete note">
            🗑 Delete
          </button>
        </div>
      </div>
      <div className="note-content">{note.content || <em>(Empty note)</em>}</div>
      <div className="note-timestamp">
        <small>
          Created: {new Date(note.created).toLocaleString()}
          {" | "}Updated: {new Date(note.updated).toLocaleString()}
        </small>
      </div>
    </div>
  );
}

// Note editor panel
function NoteEditor({ note, onSave, onCancel }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  // Allow focusing the first field on open
  useEffect(() => {
    document.getElementById("title-input")?.focus();
  }, []);

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length === 0) return;
    onSave({ ...note, title: trimmed, content });
  }

  return (
    <form className="note-edit" onSubmit={handleSubmit}>
      <input
        id="title-input"
        className="note-edit-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        maxLength={100}
        required
        autoFocus
      />
      <textarea
        className="note-edit-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        placeholder="Write your note here..."
      />
      <div className="edit-actions">
        <button className="btn btn-primary" type="submit">
          💾 Save
        </button>
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// Empty state panel
function EmptyState({ onAdd }) {
  return (
    <div className="empty-state">
      <p>
        <strong>No note selected.</strong>
        <br />
        Click &quot;Add&quot; to create your first note!
      </p>
      <button className="btn btn-accent" onClick={onAdd}>
        ＋ Add Note
      </button>
    </div>
  );
}

export default App;
