"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  LuPlus,
  LuTrash,
  LuPencil,
  LuCheck,
  LuBell,
  LuMessageSquare,
  LuClock,
  LuX,
  LuCalendar,
  LuSend,
  LuEye,
  LuUsers,
  LuGift,
  LuCircleCheck,
  LuCircleX,
  LuLogOut,
  LuFileText,
} from "react-icons/lu";
import * as api from "@/lib/api";

interface PrivateNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Reminder {
  id: string;
  date: string;
  message: string;
  completed: boolean;
  createdAt: string;
}

interface TimelineEvent {
  type: string;
  date: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface ApplicationTrackingProps {
  applicationId: string;
  privateNotes: PrivateNote[];
  reminders: Reminder[];
  timeline: TimelineEvent[];
  onUpdate: (data: any) => void;
}

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  created: <LuFileText className="w-4 h-4" />,
  sent: <LuSend className="w-4 h-4" />,
  viewed: <LuEye className="w-4 h-4" />,
  interview_scheduled: <LuCalendar className="w-4 h-4" />,
  interview_done: <LuUsers className="w-4 h-4" />,
  offer_received: <LuGift className="w-4 h-4" />,
  accepted: <LuCircleCheck className="w-4 h-4" />,
  rejected: <LuCircleX className="w-4 h-4" />,
  withdrawn: <LuLogOut className="w-4 h-4" />,
  note_added: <LuMessageSquare className="w-4 h-4" />,
  reminder_set: <LuBell className="w-4 h-4" />,
  status_changed: <LuClock className="w-4 h-4" />,
};

const TIMELINE_COLORS: Record<string, string> = {
  created: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-600",
  viewed: "bg-purple-100 text-purple-600",
  interview_scheduled: "bg-yellow-100 text-yellow-600",
  interview_done: "bg-orange-100 text-orange-600",
  offer_received: "bg-green-100 text-green-600",
  accepted: "bg-green-200 text-green-700",
  rejected: "bg-red-100 text-red-600",
  withdrawn: "bg-gray-200 text-gray-500",
  note_added: "bg-indigo-100 text-indigo-600",
  reminder_set: "bg-amber-100 text-amber-600",
  status_changed: "bg-cyan-100 text-cyan-600",
};

export default function ApplicationTracking({
  applicationId,
  privateNotes = [],
  reminders = [],
  timeline = [],
  onUpdate,
}: ApplicationTrackingProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "reminders" | "timeline">("timeline");
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");
  const [newReminderMessage, setNewReminderMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ========== Notes ==========
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setLoading(true);
    try {
      const result = await api.addNote(applicationId, newNote.trim());
      onUpdate(result.application);
      setNewNote("");
      toast.success("Note ajoutée");
    } catch (err) {
      toast.error("Erreur lors de l'ajout de la note");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteContent.trim()) return;
    setLoading(true);
    try {
      const result = await api.updateNote(applicationId, noteId, editingNoteContent.trim());
      onUpdate(result.application);
      setEditingNoteId(null);
      setEditingNoteContent("");
      toast.success("Note mise à jour");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Supprimer cette note ?")) return;
    setLoading(true);
    try {
      const result = await api.deleteNote(applicationId, noteId);
      onUpdate(result.application);
      toast.success("Note supprimée");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  // ========== Reminders ==========
  const handleAddReminder = async () => {
    if (!newReminderDate || !newReminderMessage.trim()) return;
    setLoading(true);
    try {
      const result = await api.addReminder(
        applicationId,
        new Date(newReminderDate),
        newReminderMessage.trim()
      );
      onUpdate(result.application);
      setNewReminderDate("");
      setNewReminderMessage("");
      toast.success("Rappel programmé");
    } catch (err) {
      toast.error("Erreur lors de l'ajout du rappel");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    setLoading(true);
    try {
      const result = await api.completeReminder(applicationId, reminderId);
      onUpdate(result.application);
      toast.success("Rappel marqué comme terminé");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm("Supprimer ce rappel ?")) return;
    setLoading(true);
    try {
      const result = await api.deleteReminder(applicationId, reminderId);
      onUpdate(result.application);
      toast.success("Rappel supprimé");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const isOverdue = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "timeline"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LuClock className="inline w-4 h-4 mr-2" />
          Timeline ({timeline.length})
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "notes"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LuMessageSquare className="inline w-4 h-4 mr-2" />
          Notes ({privateNotes.length})
        </button>
        <button
          onClick={() => setActiveTab("reminders")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "reminders"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LuBell className="inline w-4 h-4 mr-2" />
          Rappels ({reminders.filter((r) => !r.completed).length})
        </button>
      </div>

      <div className="p-4">
        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="space-y-3">
            {timeline.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Aucun événement pour le moment
              </p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                {[...timeline].reverse().map((event, idx) => (
                  <div key={idx} className="relative pl-10 pb-4">
                    <div
                      className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                        TIMELINE_COLORS[event.type] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {TIMELINE_ICONS[event.type] || <LuClock className="w-3 h-3" />}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800">
                        {event.description || event.type}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            {/* Add note form */}
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note privée..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <button
                onClick={handleAddNote}
                disabled={loading || !newNote.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LuPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Notes list */}
            {privateNotes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Aucune note pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {[...privateNotes].reverse().map((note) => (
                  <div
                    key={note.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateNote(note.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            <LuCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingNoteContent("");
                            }}
                            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                          >
                            <LuX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {formatDate(note.createdAt)}
                            {note.updatedAt !== note.createdAt && " (modifiée)"}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingNoteContent(note.content);
                              }}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <LuPencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <LuTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === "reminders" && (
          <div className="space-y-4">
            {/* Add reminder form */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={newReminderDate}
                  onChange={(e) => setNewReminderDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newReminderMessage}
                  onChange={(e) => setNewReminderMessage(e.target.value)}
                  placeholder="Message du rappel (ex: Relancer le recruteur)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddReminder}
                  disabled={loading || !newReminderDate || !newReminderMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LuPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reminders list */}
            {reminders.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Aucun rappel programmé
              </p>
            ) : (
              <div className="space-y-2">
                {[...reminders]
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        reminder.completed
                          ? "bg-gray-50 border-gray-200 opacity-60"
                          : isOverdue(reminder.date)
                          ? "bg-red-50 border-red-200"
                          : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <button
                        onClick={() =>
                          !reminder.completed && handleCompleteReminder(reminder.id)
                        }
                        disabled={reminder.completed || loading}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          reminder.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-400 hover:border-green-500"
                        }`}
                      >
                        {reminder.completed && <LuCheck className="w-3 h-3" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            reminder.completed ? "line-through text-gray-500" : "text-gray-800"
                          }`}
                        >
                          {reminder.message}
                        </p>
                        <p
                          className={`text-xs ${
                            isOverdue(reminder.date) && !reminder.completed
                              ? "text-red-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          <LuCalendar className="inline w-3 h-3 mr-1" />
                          {formatShortDate(reminder.date)}
                          {isOverdue(reminder.date) && !reminder.completed && " (en retard)"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        disabled={loading}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <LuTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
