'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { User } from '@/services/admin.service';
import { CreditCard, Shield, TrendingUp, Loader2 } from 'lucide-react';

interface EditUserTierModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: number, data: { tier?: string; role?: string; usage_limit?: number }) => Promise<void>;
}

export function EditUserTierModal({ user, open, onOpenChange, onSave }: EditUserTierModalProps) {
  const [tier, setTier] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setTier(user.tier);
      setRole(user.role);
      setUsageLimit(user.usage_limit.toString());
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updates: { tier?: string; role?: string; usage_limit?: number } = {};

      // Only include changed fields
      if (tier !== user.tier) updates.tier = tier;
      if (role !== user.role) updates.role = role;
      const limitValue = parseInt(usageLimit, 10);
      if (!isNaN(limitValue) && limitValue !== user.usage_limit) {
        updates.usage_limit = limitValue;
      }

      await onSave(user.id, updates);
      onOpenChange(false);
    } catch (error) {
      // Error handling done in parent
    } finally {
      setSaving(false);
    }
  };

  // Predefined limits for each tier
  const tierLimits: { [key: string]: number } = {
    free: 50,
    starter: 500,
    pro: 2000,
    business: 10000,
  };

  // Auto-update usage limit when tier changes
  const handleTierChange = (newTier: string) => {
    setTier(newTier);
    if (tierLimits[newTier]) {
      setUsageLimit(tierLimits[newTier].toString());
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
          <DialogDescription>
            Update {user.name}'s subscription tier, role, or usage limits.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Subscription Tier */}
          <div className="space-y-2">
            <Label htmlFor="tier" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription Tier
            </Label>
            <Select value={tier} onValueChange={handleTierChange}>
              <SelectTrigger id="tier">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    Free ($0/mo - 50 leads)
                  </div>
                </SelectItem>
                <SelectItem value="starter">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Starter ($49/mo - 500 leads)
                  </div>
                </SelectItem>
                <SelectItem value="pro">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    Pro ($149/mo - 2,000 leads)
                  </div>
                </SelectItem>
                <SelectItem value="business">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Business ($349/mo - 10,000 leads)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changing tier will automatically update usage limits
            </p>
          </div>

          {/* Usage Limit */}
          <div className="space-y-2">
            <Label htmlFor="usage_limit" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Custom Usage Limit
            </Label>
            <Input
              id="usage_limit"
              type="number"
              min="0"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Enter custom limit"
            />
            <p className="text-xs text-muted-foreground">
              Override default tier limit (leave as is to use tier default)
            </p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              User Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    User (Standard access)
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    Admin (Can manage users)
                  </div>
                </SelectItem>
                <SelectItem value="superadmin">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Superadmin (Full access)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              ⚠️ Be careful when granting admin privileges
            </p>
          </div>

          {/* Summary of Changes */}
          <div className="bg-gray-50 p-3 rounded-md border">
            <p className="text-xs font-medium mb-2">Summary of Changes:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {tier !== user.tier && (
                <li>• Tier: {user.tier} → {tier}</li>
              )}
              {role !== user.role && (
                <li>• Role: {user.role} → {role}</li>
              )}
              {parseInt(usageLimit, 10) !== user.usage_limit && (
                <li>• Usage Limit: {user.usage_limit.toLocaleString()} → {parseInt(usageLimit, 10).toLocaleString()}</li>
              )}
              {tier === user.tier && role === user.role && parseInt(usageLimit, 10) === user.usage_limit && (
                <li className="text-gray-400">No changes to save</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || (tier === user.tier && role === user.role && parseInt(usageLimit, 10) === user.usage_limit)}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
