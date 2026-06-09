'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Ticket,
  Copy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  formatRupiah,
  formatDate,
} from '@/lib/helpers';
import type { Voucher } from '@/lib/types';
import { toast } from 'sonner';

interface VoucherFormData {
  code: string;
  type: string;
  value: number;
  minPurchase: number;
  maxDiscount: number;
  quota: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const defaultFormData: VoucherFormData = {
  code: '',
  type: 'percentage',
  value: 0,
  minPurchase: 0,
  maxDiscount: 0,
  quota: 0,
  startDate: '',
  endDate: '',
  isActive: true,
};

export default function VoucherManager() {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState<VoucherFormData>(defaultFormData);

  // Fetch vouchers
  const { data: vouchers, isLoading } = useQuery<Voucher[]>({
    queryKey: ['admin-vouchers'],
    queryFn: () => fetch('/api/vouchers?admin=true&limit=100').then((r) => r.json()),
  });

  // Create voucher mutation
  const createMutation = useMutation({
    mutationFn: (data: VoucherFormData) =>
      fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      setAddDialogOpen(false);
      setFormData(defaultFormData);
      toast.success('Voucher created successfully');
    },
    onError: () => toast.error('Failed to create voucher'),
  });

  // Update voucher mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VoucherFormData> }) =>
      fetch(`/api/vouchers?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      setEditDialogOpen(false);
      setSelectedVoucher(null);
      setFormData(defaultFormData);
      toast.success('Voucher updated successfully');
    },
    onError: () => toast.error('Failed to update voucher'),
  });

  // Delete voucher mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/vouchers?id=${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      setDeleteDialogOpen(false);
      setSelectedVoucher(null);
      toast.success('Voucher deleted successfully');
    },
    onError: () => toast.error('Failed to delete voucher'),
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`/api/vouchers?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success('Voucher status updated');
    },
    onError: () => toast.error('Failed to update voucher status'),
  });

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minPurchase: voucher.minPurchase || 0,
      maxDiscount: voucher.maxDiscount || 0,
      quota: voucher.quota || 0,
      startDate: voucher.startDate ? voucher.startDate.split('T')[0] : '',
      endDate: voucher.endDate ? voucher.endDate.split('T')[0] : '',
      isActive: voucher.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setDeleteDialogOpen(true);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code ${code} copied to clipboard`);
  };

  const getVoucherTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      percentage: 'Percentage',
      nominal: 'Nominal',
      shipping: 'Free Shipping',
    };
    return labels[type] || type;
  };

  const getVoucherTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      percentage: 'bg-rose-100 text-rose-700',
      nominal: 'bg-amber-100 text-amber-700',
      shipping: 'bg-emerald-100 text-emerald-700',
    };
    return styles[type] || 'bg-gray-100 text-gray-700';
  };

  const formatVoucherValue = (type: string, value: number) => {
    if (type === 'percentage') return `${value}%`;
    if (type === 'nominal') return formatRupiah(value);
    return 'Free';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Vouchers</h3>
          <p className="text-sm text-gray-500">
            {vouchers?.length || 0} vouchers total
          </p>
        </div>
        <Button
          className="bg-rose-500 hover:bg-rose-600 text-white"
          onClick={() => {
            setFormData(defaultFormData);
            setAddDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Voucher
        </Button>
      </div>

      {/* Vouchers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Code</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Min Purchase</TableHead>
                  <TableHead className="text-center">Quota</TableHead>
                  <TableHead className="text-center">Used</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-14 mx-auto rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  : vouchers && vouchers.length > 0 ? (
                      vouchers.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-semibold text-gray-900">
                                {voucher.code}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => copyCode(voucher.code)}
                              >
                                <Copy className="h-3 w-3 text-gray-400" />
                              </Button>
                            </div>
                            {(voucher.startDate || voucher.endDate) && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {voucher.startDate && formatDate(voucher.startDate)}
                                {voucher.startDate && voucher.endDate && ' — '}
                                {voucher.endDate && formatDate(voucher.endDate)}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 py-0 ${getVoucherTypeBadge(voucher.type)}`}
                            >
                              {getVoucherTypeLabel(voucher.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {formatVoucherValue(voucher.type, voucher.value)}
                            </span>
                            {voucher.maxDiscount && voucher.maxDiscount > 0 && (
                              <p className="text-[10px] text-gray-400">
                                max {formatRupiah(voucher.maxDiscount)}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm text-gray-600">
                              {voucher.minPurchase ? formatRupiah(voucher.minPurchase) : '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm text-gray-600">
                              {voucher.quota || '∞'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm text-gray-600">{voucher.used}</span>
                            {voucher.quota && voucher.quota > 0 && (
                              <div className="w-full max-w-[60px] mx-auto mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-rose-500 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, (voucher.used / voucher.quota) * 100)}%`,
                                  }}
                                />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={voucher.isActive}
                              onCheckedChange={(checked) =>
                                toggleMutation.mutate({
                                  id: voucher.id,
                                  isActive: checked,
                                })
                              }
                              disabled={toggleMutation.isPending}
                            />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(voucher)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(voucher)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Ticket className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No vouchers found</p>
                          <p className="text-gray-400 text-sm">Create your first voucher</p>
                        </TableCell>
                      </TableRow>
                    )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Voucher Dialog */}
      <VoucherFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={() => createMutation.mutate(formData)}
        loading={createMutation.isPending}
        title="Add New Voucher"
      />

      <VoucherFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedVoucher(null);
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={() => {
          if (selectedVoucher) {
            updateMutation.mutate({ id: selectedVoucher.id, data: formData });
          }
        }}
        loading={updateMutation.isPending}
        title="Edit Voucher"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voucher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete voucher{' '}
              <span className="font-semibold text-gray-900">
                {selectedVoucher?.code}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedVoucher(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (selectedVoucher) deleteMutation.mutate(selectedVoucher.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface VoucherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: VoucherFormData;
  setFormData: (data: VoucherFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  title: string;
}

function VoucherFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  loading,
  title,
}: VoucherFormDialogProps) {
  const updateField = <K extends keyof VoucherFormData>(
    field: K,
    value: VoucherFormData[K]
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure the voucher details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Code */}
          <div className="grid gap-2">
            <Label htmlFor="voucher-code">Voucher Code *</Label>
            <Input
              id="voucher-code"
              value={formData.code}
              onChange={(e) => updateField('code', e.target.value.toUpperCase())}
              placeholder="e.g., WELCOME10"
              className="font-mono"
            />
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => updateField('type', val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                  <SelectItem value="shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="voucher-value">
                Value {formData.type === 'percentage' ? '(%)' : formData.type === 'nominal' ? '(Rp)' : ''}
              </Label>
              <Input
                id="voucher-value"
                type="number"
                min={0}
                value={formData.value}
                onChange={(e) => updateField('value', Number(e.target.value))}
                placeholder="0"
                disabled={formData.type === 'shipping'}
              />
            </div>
          </div>

          {/* Min Purchase + Max Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="voucher-min">Min Purchase (Rp)</Label>
              <Input
                id="voucher-min"
                type="number"
                min={0}
                value={formData.minPurchase}
                onChange={(e) => updateField('minPurchase', Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="voucher-max">Max Discount (Rp)</Label>
              <Input
                id="voucher-max"
                type="number"
                min={0}
                value={formData.maxDiscount}
                onChange={(e) => updateField('maxDiscount', Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Quota */}
          <div className="grid gap-2">
            <Label htmlFor="voucher-quota">Quota (0 = unlimited)</Label>
            <Input
              id="voucher-quota"
              type="number"
              min={0}
              value={formData.quota}
              onChange={(e) => updateField('quota', Number(e.target.value))}
              placeholder="0"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="voucher-start">Start Date</Label>
              <Input
                id="voucher-start"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="voucher-end">End Date</Label>
              <Input
                id="voucher-end"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between">
            <Label htmlFor="voucher-active">Active</Label>
            <Switch
              id="voucher-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateField('isActive', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-rose-500 hover:bg-rose-600 text-white"
            onClick={onSubmit}
            disabled={loading || !formData.code}
          >
            {loading ? 'Saving...' : title.includes('Add') ? 'Create Voucher' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
