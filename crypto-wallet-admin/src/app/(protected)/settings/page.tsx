'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/Card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { toast } from 'sonner';
import { useSettingsStore } from '../../../store/settingsStore';

interface Settings {
  kycAutoApproval: boolean;
  minTransactionAmount: string;
  maxTransactionAmount: string;
  whatsappNotificationDelay: string;
  rateLimit: {
    requests: string;
    duration: string;
  };
  blockchainSettings: {
    gasPrice: string;
    confirmations: string;
  };
}

const SettingsPage: React.FC = () => {
  const { settings, isLoading, error, fetchSettings, updateSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      if (!settings) return;
      await updateSettings(settings);
      toast.success('Configurações salvas com sucesso');
    } catch (err: any) {
      toast.error('Erro ao salvar configurações');
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>KYC Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Auto-approve Level 1 KYC</span>
            <Switch
              checked={settings.kycAutoApproval}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, kycAutoApproval: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Transaction Amount (USD)
              </label>
              <Input
                type="number"
                value={settings.minTransactionAmount}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    minTransactionAmount: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Maximum Transaction Amount (USD)
              </label>
              <Input
                type="number"
                value={settings.maxTransactionAmount}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maxTransactionAmount: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Notification Delay (seconds)
            </label>
            <Input
              type="number"
              value={settings.whatsappNotificationDelay}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  whatsappNotificationDelay: e.target.value,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Requests per Duration
              </label>
              <Input
                type="number"
                value={settings.rateLimit.requests}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    rateLimit: { ...prev.rateLimit, requests: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (seconds)
              </label>
              <Input
                type="number"
                value={settings.rateLimit.duration}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    rateLimit: { ...prev.rateLimit, duration: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blockchain Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Gas Price (GWEI)
              </label>
              <Input
                type="number"
                value={settings.blockchainSettings.gasPrice}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    blockchainSettings: {
                      ...prev.blockchainSettings,
                      gasPrice: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Required Confirmations
              </label>
              <Input
                type="number"
                value={settings.blockchainSettings.confirmations}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    blockchainSettings: {
                      ...prev.blockchainSettings,
                      confirmations: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
