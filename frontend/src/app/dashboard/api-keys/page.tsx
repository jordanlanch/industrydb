'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { apiKeyService, APIKey, CreateAPIKeyResponse, APIKeyStats } from '@/services/apikey.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Key, Copy, Trash2, RotateCcw, AlertCircle, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function APIKeysPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [stats, setStats] = useState<APIKeyStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
  const [creating, setCreating] = useState(false);

  // Show created key dialog
  const [createdKey, setCreatedKey] = useState<CreateAPIKeyResponse | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<APIKey | null>(null);

  // Revoke confirmation
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<APIKey | null>(null);

  useEffect(() => {
    if (user?.subscription_tier !== 'business') {
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [keysData, statsData] = await Promise.all([
        apiKeyService.list(),
        apiKeyService.getStats(),
      ]);
      setApiKeys(keysData);
      setStats(statsData);
    } catch (error: any) {
      toast({
        title: 'Error loading API keys',
        description: error.response?.data?.message || 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for the API key',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      const response = await apiKeyService.create({
        name: newKeyName,
        expires_at: newKeyExpiry || undefined,
      });

      setCreatedKey(response);
      setShowKeyDialog(true);
      setCreateDialogOpen(false);
      setNewKeyName('');
      setNewKeyExpiry('');

      // Reload keys list
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error creating API key',
        description: error.response?.data?.message || 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey.key);
      setKeyCopied(true);
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard',
      });
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  const handleRevoke = async () => {
    if (!keyToRevoke) return;

    try {
      await apiKeyService.revoke(keyToRevoke.id);
      toast({
        title: 'API key revoked',
        description: `${keyToRevoke.name} has been revoked`,
      });
      setRevokeConfirmOpen(false);
      setKeyToRevoke(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error revoking API key',
        description: error.response?.data?.message || 'Failed to revoke API key',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!keyToDelete) return;

    try {
      await apiKeyService.delete(keyToDelete.id);
      toast({
        title: 'API key deleted',
        description: `${keyToDelete.name} has been permanently deleted`,
      });
      setDeleteConfirmOpen(false);
      setKeyToDelete(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Error deleting API key',
        description: error.response?.data?.message || 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if user has Business tier
  if (user?.subscription_tier !== 'business') {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <Key className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground mb-6">
            API keys are available exclusively on the Business tier
          </p>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Upgrade to Business Tier</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get programmatic access to IndustryDB with API keys on our Business plan
              </p>
              <Button>Upgrade Now</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">API Keys</h1>
            <p className="text-muted-foreground">
              Manage your API keys for programmatic access to IndustryDB
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Key className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Keys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_keys}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Keys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active_keys}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_usage}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Last Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{formatDate(stats.last_used)}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first API key to start accessing IndustryDB programmatically
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Key className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <Card key={key.id} className={key.revoked ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{key.name}</CardTitle>
                      {key.revoked ? (
                        <Badge variant="destructive">Revoked</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                      {key.expires_at && new Date(key.expires_at) < new Date() && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {key.prefix}••••••••
                        </code>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!key.revoked && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setKeyToRevoke(key);
                            setRevokeConfirmOpen(true);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setKeyToDelete(key);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Created</div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(key.created_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Last Used</div>
                    <div>{formatDate(key.last_used_at)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Usage Count</div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {key.usage_count}
                    </div>
                  </div>
                  {key.expires_at && (
                    <div>
                      <div className="text-muted-foreground mb-1">Expires</div>
                      <div>{formatDate(key.expires_at)}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for programmatic access to IndustryDB
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production Server"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="expires_at">Expires At (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={newKeyExpiry}
                onChange={(e) => setNewKeyExpiry(e.target.value)}
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 mb-1">Important</p>
                  <p className="text-yellow-700">
                    The API key will only be shown once. Make sure to copy and store it securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create API Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show Created Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created Successfully</DialogTitle>
            <DialogDescription>
              Copy your API key now. This is the only time it will be displayed.
            </DialogDescription>
          </DialogHeader>
          {createdKey && (
            <div className="space-y-4 py-4">
              <div>
                <Label>API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    readOnly
                    value={createdKey.key}
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleCopyKey} variant="outline">
                    {keyCopied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900 mb-1">Warning</p>
                    <p className="text-red-700">
                      Store this API key securely. You won't be able to see it again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowKeyDialog(false)}>
              I've saved my API key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <AlertDialog open={revokeConfirmOpen} onOpenChange={setRevokeConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately invalidate the API key "{keyToRevoke?.name}".
              Any applications using this key will lose access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} className="bg-red-600 hover:bg-red-700">
              Revoke API Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the API key "{keyToDelete?.name}" and all its usage history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
