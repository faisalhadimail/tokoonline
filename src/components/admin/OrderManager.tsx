'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  ShoppingBag,
  Download,
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  StickyNote,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  formatRupiah,
  formatDateTime,
  formatDate,
  getOrderStatusColor,
  getOrderStatusLabel,
} from '@/lib/helpers';
import type { Order, OrderItem } from '@/lib/types';
import { toast } from 'sonner';

const orderStatuses = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrderManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders', search, statusFilter],
    queryFn: () =>
      fetch(
        `/api/orders?admin=true&search=${search}&status=${statusFilter}&limit=100`
      ).then((r) => r.json()),
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status?: string; trackingNumber?: string; adminNotes?: string };
    }) =>
      fetch(`/api/orders?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated successfully');
    },
    onError: () => toast.error('Failed to update order'),
  });

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setAdminNotes((order as Order & { adminNotes?: string }).adminNotes || '');
    setDetailOpen(true);
  };

  const handleUpdateOrder = () => {
    if (!selectedOrder) return;
    updateOrderMutation.mutate({
      id: selectedOrder.id,
      data: {
        status: orderStatus,
        trackingNumber: trackingNumber,
        adminNotes: adminNotes,
      },
    });
  };

  const handleExport = () => {
    toast.info('Export feature coming soon');
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-emerald-100 text-emerald-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
          <p className="text-sm text-gray-500">
            {orders?.length || 0} orders total
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Search & Status Filter */}
      <Card>
        <CardContent className="pt-0 pb-0">
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="flex-wrap h-auto gap-1">
                {orderStatuses.map((s) => (
                  <TabsTrigger key={s.value} value={s.value} className="text-xs h-8 px-3">
                    {s.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Payment</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-14 mx-auto rounded-full" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  : orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <TableRow key={order.id} className="cursor-pointer" onClick={() => handleViewDetail(order)}>
                          <TableCell>
                            <p className="text-sm font-medium text-rose-600">
                              {order.orderNumber}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-900">Customer</p>
                            <p className="text-xs text-gray-500">ID: {order.userId.slice(0, 8)}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm text-gray-600">
                              {order.items?.length || 0} items
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatRupiah(order.total)}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 ${getOrderStatusColor(order.status)}`}
                            >
                              {getOrderStatusLabel(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 capitalize ${getPaymentStatusColor(order.paymentStatus)}`}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-xs text-gray-500">
                              {formatDate(order.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(order);
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No orders found</p>
                          <p className="text-gray-400 text-sm">
                            Try adjusting your search or filter
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber} — {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5">
              {/* Status & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" /> Order Status
                  </Label>
                  <Select value={orderStatus} onValueChange={setOrderStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses
                        .filter((s) => s.value !== 'all')
                        .map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {getOrderStatusLabel(s.value)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs text-gray-500 flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" /> Payment
                  </Label>
                  <div className="flex items-center gap-2 h-9">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                    >
                      {selectedOrder.paymentStatus}
                    </Badge>
                    {selectedOrder.paymentMethod && (
                      <span className="text-xs text-gray-500">{selectedOrder.paymentMethod}</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tracking Number */}
              <div className="grid gap-2">
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> Tracking Number
                </Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number..."
                />
              </div>

              {/* Order Items */}
              <div>
                <Label className="text-xs text-gray-500 mb-2 block flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> Order Items
                </Label>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items && selectedOrder.items.length > 0
                    ? selectedOrder.items.map((item: OrderItem) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3"
                        >
                          <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-gray-300 m-auto mt-[14px]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.variation && `Variation: ${item.variation} · `}
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 shrink-0">
                            {formatRupiah(item.subtotal)}
                          </p>
                        </div>
                      ))
                    : (
                      <p className="p-4 text-sm text-gray-400 text-center">
                        No items
                      </p>
                    )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatRupiah(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-900">{formatRupiah(selectedOrder.shippingCost)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Discount {selectedOrder.voucherCode && `(${selectedOrder.voucherCode})`}
                    </span>
                    <span className="text-emerald-600">-{formatRupiah(selectedOrder.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-rose-600">{formatRupiah(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Shipping Address
                  </Label>
                  <div className="border rounded-lg p-3 bg-gray-50 text-sm text-gray-700">
                    {(() => {
                      try {
                        const addr = JSON.parse(selectedOrder.shippingAddress);
                        return (
                          <div>
                            <p className="font-medium">{addr.recipient}</p>
                            <p className="text-gray-500 mt-1">{addr.phone}</p>
                            <p className="mt-1">{addr.address}</p>
                            <p className="text-gray-500">
                              {addr.city}, {addr.province} {addr.postalCode}
                            </p>
                          </div>
                        );
                      } catch {
                        return <p>{selectedOrder.shippingAddress}</p>;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="grid gap-2">
                <Label className="text-xs text-gray-500 flex items-center gap-1">
                  <StickyNote className="h-3.5 w-3.5" /> Admin Notes
                </Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes for this order..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-rose-500 hover:bg-rose-600 text-white"
              onClick={handleUpdateOrder}
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending ? 'Saving...' : 'Update Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
