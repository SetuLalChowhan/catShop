"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye, Trash2, Calendar, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiErrorMessage } from "@/lib/api";
import {
  useAdminBookings,
  useDeleteBooking,
  useUpdateBookingStatus,
} from "@/lib/queries";
import { Booking, BookingStatus } from "@/types";
import { formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export default function BookingManagementPage() {
  const [search, setSearch] = useState("");
  // Debounced copy of the search box — search runs on the backend, so we
  // don't fire a request per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);

  // Debounce the search box (350ms) before it hits the backend, and go back
  // to page 1 once the settled query fires so results stay aligned.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Cached per page/status/search combination: switching sections or pages
  // shows previously fetched data instantly instead of re-loading every time.
  const bookingsQuery = useAdminBookings({
    page,
    status: statusFilter,
    search: debouncedSearch,
  });
  const bookings = Array.isArray(bookingsQuery.data)
    ? bookingsQuery.data
    : bookingsQuery.data?.bookings ?? [];
  const pagination = !Array.isArray(bookingsQuery.data)
    ? (bookingsQuery.data?.pagination ?? null)
    : null;
  const loading = bookingsQuery.isPending;

  const updateStatus = useUpdateBookingStatus();
  const deleteBooking = useDeleteBooking();

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update booking status"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBooking.mutateAsync(deleteTarget._id);
      toast.success("Booking record deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete booking"));
    }
  };

  const bookingBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-soft text-amber-deep border-amber-deep/30">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-sage text-white">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
          Booking Management
        </h1>
        <p className="text-sm text-muted-foreground">
          View customer reservation requests, update booking statuses, and manage inquiries.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search by customer name, email..."
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
              <SelectItem value="all">All Statuses ({bookings.length})</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Selected Cat</th>
                  <th className="py-3.5 px-4">Preferred Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((booking) => {
                  const catObj = typeof booking.cat === "object" ? booking.cat : null;
                  return (
                    <tr key={booking._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {booking.customerName}
                        <span className="text-[11px] text-muted-foreground font-normal block">
                          Submitted {formatDate(booking.createdAt)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="text-xs">
                          <span className="block font-medium text-foreground">{booking.email}</span>
                          <span>{booking.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {catObj ? (
                          <span className="font-semibold text-foreground">{catObj.name} ({catObj.breed})</span>
                        ) : (
                          "General Inquiry"
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDate(booking.preferredDate)}
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={booking.status}
                          onValueChange={(val: BookingStatus) => handleStatusChange(booking._id, val)}
                        >
                          <SelectTrigger className="h-8 rounded-lg text-xs w-32">
                            <SelectValue>{bookingBadge(booking.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewBooking(booking)}
                          className="rounded-lg h-8 px-2.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(booking)}
                          className="rounded-lg h-8 px-2.5 text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {pagination && pagination.pages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
                <span className="text-xs text-muted-foreground font-medium">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total bookings)
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
      <Dialog open={!!viewBooking} onOpenChange={(open) => !open && setViewBooking(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Booking Details</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submitted on {formatDateTime(viewBooking?.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {viewBooking && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{viewBooking.customerName}</span>
                  {bookingBadge(viewBooking.status)}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {viewBooking.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary" /> {viewBooking.phone}
                  </div>
                </div>
              </div>

              {viewBooking.preferredDate && (
                <div className="p-3 rounded-xl bg-card border border-border">
                  <span className="text-xs font-semibold text-muted-foreground block">Preferred Date</span>
                  <span className="font-medium text-foreground">{formatDate(viewBooking.preferredDate)}</span>
                </div>
              )}

              {viewBooking.message && (
                <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground block">Customer Message</span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{viewBooking.message}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button onClick={() => setViewBooking(null)}>Close Window</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking for {deleteTarget?.customerName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The booking request will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
