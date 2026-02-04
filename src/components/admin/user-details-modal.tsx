'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/services/admin.service';
import { Mail, Calendar, CheckCircle, XCircle, Shield, CreditCard, TrendingUp, Edit2, Ban } from 'lucide-react';
import { format } from 'date-fns';

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: User) => void;
  onSuspend: (userId: number, userName: string) => void;
}

export function UserDetailsModal({ user, open, onOpenChange, onEdit, onSuspend }: UserDetailsModalProps) {
  if (!user) return null;

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'starter':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pro':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'business':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'superadmin':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const usagePercentage = (user.usage_count / user.usage_limit) * 100;
  const remainingLeads = user.usage_limit - user.usage_count;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div>{user.name}</div>
              <div className="text-sm font-normal text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            User ID: {user.id}
          </DialogDescription>
        </DialogHeader>

        {/* User Details Grid */}
        <div className="grid gap-4 py-4">
          {/* Tier and Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Subscription Tier
              </label>
              <Badge variant="outline" className={getTierBadgeColor(user.tier)}>
                <CreditCard className="h-3 w-3 mr-1" />
                {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Role
              </label>
              <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                <Shield className="h-3 w-3 mr-1" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Email Verification */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Email Status
            </label>
            <div className="flex items-center gap-2">
              {user.email_verified_at ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    Verified on {format(new Date(user.email_verified_at), 'MMM d, yyyy')}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">Not verified</span>
                </>
              )}
            </div>
          </div>

          {/* Usage Statistics */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Usage Statistics
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Used: {user.usage_count.toLocaleString()} leads</span>
                <span className="text-muted-foreground">Limit: {user.usage_limit.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usagePercentage >= 90 ? 'bg-red-600' : usagePercentage >= 70 ? 'bg-orange-500' : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{usagePercentage.toFixed(1)}% used</span>
                <span>{remainingLeads.toLocaleString()} remaining</span>
              </div>
            </div>
          </div>

          {/* Stripe Customer ID */}
          {user.stripe_customer_id && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Stripe Customer ID
              </label>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{user.stripe_customer_id}</code>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Account Created
              </label>
              <span className="text-sm">{format(new Date(user.created_at), 'MMM d, yyyy')}</span>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last Updated
              </label>
              <span className="text-sm">{format(new Date(user.updated_at), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {user.last_login_at && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last Login
              </label>
              <span className="text-sm">{format(new Date(user.last_login_at), 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onSuspend(user.id, user.name);
              onOpenChange(false);
            }}
          >
            <Ban className="h-4 w-4 mr-2" />
            Suspend User
          </Button>
          <Button onClick={() => onEdit(user)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
