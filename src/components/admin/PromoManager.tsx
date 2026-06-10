'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  Tag,
  Percent,
  Truck as TruckIcon,
  Gift,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { formatRupiah, formatDate } from '@/lib/helpers';
import type { Promo } from '@/lib/types';
import { toast } from 'sonner';

interface PromoFormData {
  name: string;
  code: string;
  description: string;
  type: string;
  value: number;
  scope: string;
  productIds: string;
  minPurchase: number;
  maxDiscount: number;
  quota: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerText: string;
  bannerSubtext: string;
  bannerBg: string;
}

const defaultFormData: PromoFormData = {
  name: '',
  code: '',
  description: '',
  type: 'percentage',
  value: 0,
  scope: 'global',
  productIds: '',
  minPurchase: 0,
  maxDiscount: 0,
  quota: 0,
  startDate: '',
  endDate: '',
  isActive: true,
  bannerText: '',
  bannerSubtext: '',
  bannerBg: 'from-rose-600 to-rose-500',
};

function generatePromoCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PROMO-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const bannerBgOptions = [
  { value: 'from-rose-600 to-rose-500', label: 'Rose Gradient' },
  { value: 'from-amber-500 to-orange-500', label: 'Amber Gradient' },
  { value: 'from-emerald-600 to-teal-500', label: 'Emerald Gradient' },
  { value: 'from-stone-700 to-stone-600', label: 'Stone Gradient' },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'percentage':
      return <Percent className="h-3 w-3" />;
    case 'fixed':
      return <Tag className="h-3 w-3" />;
    case 'shipping':
      return <TruckIcon className="h-3 w-3" />;
    default:
      return <Tag className="h-3 w-3" />;
  }
}

function getTypeBadgeStyle(type: string) {
  const styles: Record<string, string> = {
    percentage: 'bg-violet-50 text-violet-700',
    fixed: 'bg-amber-50 text-amber-700',
    shipping: 'bg-emerald-50 text-emerald-700',
  };
  return styles[type] || 'bg-gray-100 text-gray-700';
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    percentage: 'Persentase',
    fixed: 'Nominal Tetap',
    shipping: 'Potongan Ongkir',
  };
  return labels[type] || type;
}

function getScopeBadgeStyle(scope: string) {
  const styles: Record<string, string> = {
    global: 'bg-blue-50 text-blue-700',
    per_item: 'bg-orange-50 text-orange-700',
  };
  return styles[scope] || 'bg-gray-100 text-gray-700';
}

function getScopeLabel(scope: string) {
  const labels: Record<string, string> = {
    global: 'Global',
    per_item: 'Per Item',
  };
  return labels[scope] || scope;
}

function formatPromoValue(type: string, value: number) {
  if (type === 'percentage') return `${value}%`;
  if (type === 'fixed') return formatRupiah(value);
  if (type === 'shipping') return 'Gratis';
  return String(value);
}

export default function PromoManager() {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [formData, setFormData] = useState<PromoFormData>(defaultFormData);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch promos
  const { data: promos, isLoading } = useQuery<Promo[]>({
    queryKey: ['admin-promos'],
    queryFn: () => fetch('/api/promos').then((r) => r.json()),
  });

  // Create promo mutation
  const createMutation = useMutation({
    mutationFn: (data: PromoFormData) =>
      fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      setAddDialogOpen(false);
      setFormData(defaultFormData);
      toast.success('Promo created successfully');
    },
    onError: () => toast.error('Failed to create promo'),
  });

  // Update promo mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PromoFormData> }) =>
      fetch(`/api/promos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      setEditDialogOpen(false);
      setSelectedPromo(null);
      setFormData(defaultFormData);
      toast.success('Promo updated successfully');
    },
    onError: () => toast.error('Failed to update promo'),
  });

  // Delete promo mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/promos/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      setDeleteDialogOpen(false);
      setSelectedPromo(null);
      toast.success('Promo deleted successfully');
    },
    onError: () => toast.error('Failed to delete promo'),
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetch(`/api/promos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      toast.success('Promo status updated');
    },
    onError: () => toast.error('Failed to update promo status'),
  });

  const handleEdit = (promo: Promo) => {
    setSelectedPromo(promo);
    setFormData({
      name: promo.name,
      code: promo.code,
      description: promo.description || '',
      type: promo.type,
      value: promo.value,
      scope: promo.scope,
      productIds: promo.productIds || '',
      minPurchase: promo.minPurchase || 0,
      maxDiscount: promo.maxDiscount || 0,
      quota: promo.quota || 0,
      startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
      endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
      isActive: promo.isActive,
      bannerText: promo.bannerText || '',
      bannerSubtext: promo.bannerSubtext || '',
      bannerBg: promo.bannerBg || 'from-rose-600 to-rose-500',
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (promo: Promo) => {
    setSelectedPromo(promo);
    setDeleteDialogOpen(true);
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Code ${code} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = () => {
    const submitData = {
      ...formData,
      code: formData.code.trim() || generatePromoCode(),
    };
    createMutation.mutate(submitData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Promos</h3>
          <p className="text-sm text-gray-500">
            {promos?.length || 0} promos total
          </p>
        </div>
        <Button
          className="bg-rose-600 hover:bg-rose-700 text-white"
          onClick={() => {
            setFormData(defaultFormData);
            setAddDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Promo
        </Button>
      </div>

      {/* Promos Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-center">Scope</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Quota</TableHead>
                  <TableHead className="text-center">Date Range</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-14 mx-auto rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  : promos && promos.length > 0 ? (
                      promos.map((promo) => {
                        const quotaUsage = promo.quota
                          ? Math.min(100, (promo.used / promo.quota) * 100)
                          : 0;
                        return (
                          <TableRow key={promo.id}>
                            {/* Name */}
                            <TableCell>
                              <span className="text-sm font-medium text-gray-900">
                                {promo.name}
                              </span>
                            </TableCell>

                            {/* Code with copy */}
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-mono font-semibold text-gray-900">
                                  {promo.code}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => copyCode(promo.code, promo.id)}
                                >
                                  {copiedId === promo.id ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>

                            {/* Type */}
                            <TableCell className="text-center">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] px-1.5 py-0 gap-1 ${getTypeBadgeStyle(promo.type)}`}
                              >
                                {getTypeIcon(promo.type)}
                                {getTypeLabel(promo.type)}
                              </Badge>
                            </TableCell>

                            {/* Value */}
                            <TableCell className="text-right">
                              <span className="text-sm font-medium text-gray-900">
                                {formatPromoValue(promo.type, promo.value)}
                              </span>
                              {promo.type === 'percentage' && promo.maxDiscount && promo.maxDiscount > 0 && (
                                <p className="text-[10px] text-gray-400">
                                  max {formatRupiah(promo.maxDiscount)}
                                </p>
                              )}
                            </TableCell>

                            {/* Scope */}
                            <TableCell className="text-center">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] px-1.5 py-0 ${getScopeBadgeStyle(promo.scope)}`}
                              >
                                {getScopeLabel(promo.scope)}
                              </Badge>
                            </TableCell>

                            {/* Status */}
                            <TableCell className="text-center">
                              <Switch
                                checked={promo.isActive}
                                onCheckedChange={(checked) =>
                                  toggleMutation.mutate({
                                    id: promo.id,
                                    isActive: checked,
                                  })
                                }
                                disabled={toggleMutation.isPending}
                              />
                            </TableCell>

                            {/* Quota usage */}
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-xs text-gray-600">
                                  {promo.used}{promo.quota ? ` / ${promo.quota}` : ' / ∞'}
                                </span>
                                {promo.quota && promo.quota > 0 && (
                                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        quotaUsage >= 100
                                          ? 'bg-red-500'
                                          : quotaUsage >= 75
                                            ? 'bg-amber-500'
                                            : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${quotaUsage}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            {/* Date Range */}
                            <TableCell className="text-center">
                              <span className="text-[11px] text-gray-500">
                                {promo.startDate ? formatDate(promo.startDate).split(',')[0] : '—'}
                                {' → '}
                                {promo.endDate ? formatDate(promo.endDate).split(',')[0] : '—'}
                              </span>
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEdit(promo)}
                                >
                                  <Pencil className="h-4 w-4 text-gray-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDelete(promo)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <Gift className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No promos found</p>
                          <p className="text-gray-400 text-sm">Create your first promo campaign</p>
                        </TableCell>
                      </TableRow>
                    )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Promo Dialog */}
      <PromoFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateSubmit}
        loading={createMutation.isPending}
        title="Add New Promo"
        isEdit={false}
      />

      <PromoFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedPromo(null);
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={() => {
          if (selectedPromo) {
            updateMutation.mutate({ id: selectedPromo.id, data: formData });
          }
        }}
        loading={updateMutation.isPending}
        title="Edit Promo"
        isEdit={true}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete promo{' '}
              <span className="font-semibold text-gray-900">
                {selectedPromo?.name}
              </span>
              {' '}({selectedPromo?.code})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPromo(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (selectedPromo) deleteMutation.mutate(selectedPromo.id);
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

/* ──────────── Form Dialog ──────────── */

interface PromoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PromoFormData;
  setFormData: (data: PromoFormData) => void;
  onSubmit: () => void;
  loading: boolean;
  title: string;
  isEdit: boolean;
}

function PromoFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  loading,
  title,
  isEdit,
}: PromoFormDialogProps) {
  const updateField = <K extends keyof PromoFormData>(
    field: K,
    value: PromoFormData[K]
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the promo details below.'
              : 'Configure the new promo campaign below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* ── Basic Info ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Basic Info
            </p>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="promo-name">Promo Name *</Label>
              <Input
                id="promo-name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Flash Sale Ramadhan"
              />
            </div>

            {/* Code */}
            <div className="grid gap-2">
              <Label htmlFor="promo-code">
                Promo Code {isEdit ? '*' : '(auto-generated if empty)'}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="promo-code"
                  value={formData.code}
                  onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                  placeholder="e.g., RAMADAN50"
                  className="font-mono flex-1"
                />
                {!isEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateField('code', generatePromoCode())}
                  >
                    Auto
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="promo-desc">Description</Label>
              <Textarea
                id="promo-desc"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe this promo..."
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* ── Discount Config ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Discount Configuration
            </p>

            {/* Type + Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Nominal Tetap (Rp)</SelectItem>
                    <SelectItem value="shipping">Potongan Ongkir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promo-value">
                  Value{' '}
                  {formData.type === 'percentage'
                    ? '(%)'
                    : formData.type === 'fixed'
                      ? '(Rp)'
                      : ''}
                </Label>
                <Input
                  id="promo-value"
                  type="number"
                  min={0}
                  value={formData.value}
                  onChange={(e) => updateField('value', Number(e.target.value))}
                  placeholder="0"
                  disabled={formData.type === 'shipping'}
                />
              </div>
            </div>

            {/* Scope */}
            <div className="grid gap-2">
              <Label>Scope *</Label>
              <Select
                value={formData.scope}
                onValueChange={(val) => updateField('scope', val)}
              >
                <SelectTrigger className="w-full sm:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (semua produk)</SelectItem>
                  <SelectItem value="per_item">Per Item (produk tertentu)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product IDs (only for per_item) */}
            {formData.scope === 'per_item' && (
              <div className="grid gap-2">
                <Label htmlFor="promo-products">Product IDs (comma-separated)</Label>
                <Input
                  id="promo-products"
                  value={formData.productIds}
                  onChange={(e) => updateField('productIds', e.target.value)}
                  placeholder="e.g., clxabc123, clxdef456"
                  className="font-mono"
                />
                <p className="text-xs text-gray-400">
                  Enter product IDs separated by commas. This promo will only apply to these products.
                </p>
              </div>
            )}

            {/* Min Purchase + Max Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="promo-min-purchase">Min Purchase (Rp)</Label>
                <Input
                  id="promo-min-purchase"
                  type="number"
                  min={0}
                  value={formData.minPurchase}
                  onChange={(e) => updateField('minPurchase', Number(e.target.value))}
                  placeholder="0"
                />
                <p className="text-xs text-gray-400">Leave 0 for no minimum</p>
              </div>
              {formData.type === 'percentage' && (
                <div className="grid gap-2">
                  <Label htmlFor="promo-max-discount">Max Discount (Rp)</Label>
                  <Input
                    id="promo-max-discount"
                    type="number"
                    min={0}
                    value={formData.maxDiscount}
                    onChange={(e) => updateField('maxDiscount', Number(e.target.value))}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-400">Cap for percentage type</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Schedule & Limits ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Schedule &amp; Limits
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="promo-quota">Quota</Label>
                <Input
                  id="promo-quota"
                  type="number"
                  min={0}
                  value={formData.quota}
                  onChange={(e) => updateField('quota', Number(e.target.value))}
                  placeholder="0"
                />
                <p className="text-xs text-gray-400">0 = unlimited</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promo-start">Start Date</Label>
                <Input
                  id="promo-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promo-end">End Date</Label>
                <Input
                  id="promo-end"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="promo-active">Active</Label>
              <Switch
                id="promo-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => updateField('isActive', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* ── Banner Config ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Homepage Banner
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="promo-banner-text">Banner Text</Label>
                <Input
                  id="promo-banner-text"
                  value={formData.bannerText}
                  onChange={(e) => updateField('bannerText', e.target.value)}
                  placeholder="e.g., Flash Sale 50% Off!"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promo-banner-subtext">Banner Subtext</Label>
                <Input
                  id="promo-banner-subtext"
                  value={formData.bannerSubtext}
                  onChange={(e) => updateField('bannerSubtext', e.target.value)}
                  placeholder="e.g., Limited time only"
                />
              </div>
            </div>

            {/* Banner Background */}
            <div className="grid gap-2">
              <Label>Banner Background</Label>
              <Select
                value={formData.bannerBg}
                onValueChange={(val) => updateField('bannerBg', val)}
              >
                <SelectTrigger className="w-full sm:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bannerBgOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-sm bg-gradient-to-r ${opt.value}`}
                        />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banner Preview */}
            {formData.bannerText && (
              <div
                className={`bg-gradient-to-r ${formData.bannerBg} rounded-lg p-4 text-white`}
              >
                <p className="font-bold text-lg">{formData.bannerText}</p>
                {formData.bannerSubtext && (
                  <p className="text-sm opacity-80">{formData.bannerSubtext}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-rose-600 hover:bg-rose-700 text-white"
            onClick={onSubmit}
            disabled={loading || !formData.name}
          >
            {loading
              ? 'Saving...'
              : isEdit
                ? 'Save Changes'
                : 'Create Promo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
