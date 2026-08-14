"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, Trash2, Mail, Phone, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getData, patchData, deleteData, apiErrorMessage } from "@/lib/api";
import { ContactMessage, ContactMessageStatus } from "@/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export default function ContactManagementPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number } | null>(null);

  const [viewContact, setViewContact] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const fetchContacts = async (pageNum = page) => {
    try {
      setLoading(true);
      const res = await getData<{ contacts: ContactMessage[]; pagination?: { page: number; limit: number; total: number; pages: number } }>(
        `/api/admin/contacts?page=${pageNum}&limit=10${statusFilter !== "all" ? `&status=${statusFilter}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`
      );
      if (Array.isArray(res)) {
        setContacts(res);
      } else if (res?.contacts) {
        setContacts(res.contacts);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to fetch contact messages"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(page);
  }, [page, statusFilter, search]);

  const handleStatusChange = async (id: string, newStatus: ContactMessageStatus) => {
    try {
      await patchData(`/api/admin/contacts/${id}`, { status: newStatus });
      toast.success(`Message status updated to ${newStatus}`);
      fetchContacts();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update message status"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteData(`/api/admin/contacts/${deleteTarget._id}`);
      toast.success("Contact message deleted");
      setDeleteTarget(null);
      fetchContacts();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete contact message"));
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search.trim() !== "") {
        const q = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchSubject = c.subject.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchSubject) return false;
      }
      return true;
    });
  }, [contacts, statusFilter, search]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge className="bg-primary text-primary-foreground font-semibold">Unread</Badge>;
      case "read":
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Read</Badge>;
      case "replied":
        return <Badge className="bg-sage text-white">Replied</Badge>;
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
          Contact Messages Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and respond to inquiries submitted from the website contact page.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search by name, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-lg">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages ({contacts.length})</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading contact messages...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No contact messages found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {contact.name}
                      <span className="text-xs text-muted-foreground font-normal block">
                        {contact.email} {contact.phone ? `• ${contact.phone}` : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {contact.subject}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <Select
                        value={contact.status}
                        onValueChange={(val: ContactMessageStatus) => handleStatusChange(contact._id, val)}
                      >
                        <SelectTrigger className="h-8 rounded-lg text-xs w-32">
                          <SelectValue>{statusBadge(contact.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unread">Unread</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewContact(contact);
                          if (contact.status === "unread") {
                            handleStatusChange(contact._id, "read");
                          }
                        }}
                        className="rounded-lg h-8 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(contact)}
                        className="rounded-lg h-8 px-2.5 text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination && pagination.pages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
                <span className="text-xs text-muted-foreground font-medium">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total messages)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg h-8 text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    className="rounded-lg h-8 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Dialog open={!!viewContact} onOpenChange={(open) => !open && setViewContact(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Contact Message</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Received on {formatDateTime(viewContact?.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {viewContact && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{viewContact.name}</span>
                  {statusBadge(viewContact.status)}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {viewContact.email}
                  </div>
                  {viewContact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary" /> {viewContact.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-xs font-semibold text-muted-foreground block">Subject</span>
                <span className="font-medium text-foreground">{viewContact.subject}</span>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                <span className="text-xs font-semibold text-muted-foreground block">Message Content</span>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{viewContact.message}</p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <a
                  href={`mailto:${viewContact.email}?subject=Re: ${encodeURIComponent(viewContact.subject)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" /> Reply via Email
                </a>
                <Button onClick={() => setViewContact(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message from {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The contact message will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
