import { useState } from 'react';
import {
  Bell,
  Shield,
  Globe,
  Palette,
  AlertTriangle,
  Clock,
  LogOut,
  RotateCcw,
  Trash2,
  Smartphone,
  Mail,
  Wrench,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Modal } from '../components/common';
import { cn } from '../utils/helpers';

const Settings = () => {
  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    maintenanceReminders: true,
    criticalAlerts: true,
    defaultPriority: 'medium',
  });

  // System preferences state
  const [systemPreferences, setSystemPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
  });

  // Modal states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSignOutAllModal, setShowSignOutAllModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Toggle switch component
  const ToggleSwitch = ({ enabled, onToggle, disabled = false }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
        enabled ? 'bg-primary-600' : 'bg-gray-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );

  // Custom Select component
  const CustomSelect = ({ value, onChange, options, className }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10',
          'text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          'transition-colors cursor-pointer',
          className
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark (Coming Soon)' },
    { value: 'system', label: 'System Default' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'pt', label: 'Portuguese' },
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ];

  const handleResetSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Reset to defaults
    setAccountSettings({
      emailNotifications: true,
      maintenanceReminders: true,
      criticalAlerts: true,
      defaultPriority: 'medium',
    });
    setSystemPreferences({
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
    });
    setSecuritySettings({
      twoFactorEnabled: false,
    });
    
    setIsSaving(false);
    setShowResetModal(false);
  };

  const handleSignOutAll = async () => {
    setIsSaving(true);
    // Simulate API call: PUT /api/user/sessions/revoke-all
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSignOutAllModal(false);
    alert('Successfully signed out from all devices');
  };

  const handleDeactivateAccount = async () => {
    setIsSaving(true);
    // Simulate API call: POST /api/user/deactivate
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowDeactivateModal(false);
    // In real app, would redirect to login after deactivation
    alert('Account deactivation request submitted. You will receive a confirmation email.');
  };

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Manage application preferences and account behavior"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Account Settings Section */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
              <p className="text-sm text-gray-500">Configure notifications and default behaviors</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email updates about your account activity</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={accountSettings.emailNotifications}
                onToggle={() =>
                  setAccountSettings((prev) => ({
                    ...prev,
                    emailNotifications: !prev.emailNotifications,
                  }))
                }
              />
            </div>

            {/* Maintenance Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Maintenance Reminders</p>
                  <p className="text-sm text-gray-500">Get notified about upcoming scheduled maintenance</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={accountSettings.maintenanceReminders}
                onToggle={() =>
                  setAccountSettings((prev) => ({
                    ...prev,
                    maintenanceReminders: !prev.maintenanceReminders,
                  }))
                }
              />
            </div>

            {/* Critical Alert Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Critical Alert Notifications</p>
                  <p className="text-sm text-gray-500">Receive immediate alerts for critical equipment issues</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={accountSettings.criticalAlerts}
                onToggle={() =>
                  setAccountSettings((prev) => ({
                    ...prev,
                    criticalAlerts: !prev.criticalAlerts,
                  }))
                }
              />
            </div>

            {/* Default Priority Level */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Default Priority Level</p>
                  <p className="text-sm text-gray-500">Set the default priority for new maintenance requests</p>
                </div>
              </div>
              <div className="w-40">
                <CustomSelect
                  value={accountSettings.defaultPriority}
                  onChange={(value) =>
                    setAccountSettings((prev) => ({ ...prev, defaultPriority: value }))
                  }
                  options={priorityOptions}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* System Preferences Section */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Preferences</h2>
              <p className="text-sm text-gray-500">Customize your application experience</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Theme</p>
                  <p className="text-sm text-gray-500">Choose your preferred color theme</p>
                </div>
              </div>
              <div className="w-48">
                <CustomSelect
                  value={systemPreferences.theme}
                  onChange={(value) =>
                    setSystemPreferences((prev) => ({ ...prev, theme: value }))
                  }
                  options={themeOptions}
                />
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Language</p>
                  <p className="text-sm text-gray-500">Select your preferred language</p>
                </div>
              </div>
              <div className="w-48">
                <CustomSelect
                  value={systemPreferences.language}
                  onChange={(value) =>
                    setSystemPreferences((prev) => ({ ...prev, language: value }))
                  }
                  options={languageOptions}
                />
              </div>
            </div>

            {/* Timezone Selection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Timezone</p>
                  <p className="text-sm text-gray-500">Set your local timezone for accurate scheduling</p>
                </div>
              </div>
              <div className="w-48">
                <CustomSelect
                  value={systemPreferences.timezone}
                  onChange={(value) =>
                    setSystemPreferences((prev) => ({ ...prev, timezone: value }))
                  }
                  options={timezoneOptions}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings Section */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              <p className="text-sm text-gray-500">Manage your account security options</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={securitySettings.twoFactorEnabled}
                onToggle={() =>
                  setSecuritySettings((prev) => ({
                    ...prev,
                    twoFactorEnabled: !prev.twoFactorEnabled,
                  }))
                }
              />
            </div>

            {/* Sign Out from All Devices */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Sign Out from All Devices</p>
                  <p className="text-sm text-gray-500">Sign out from all other active sessions</p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowSignOutAllModal(true)}
              >
                Sign Out All
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone Section */}
        <Card className="border-red-200 bg-red-50/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
              <p className="text-sm text-red-600">Irreversible actions that affect your account</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Reset All Settings */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">Reset All Settings</p>
                  <p className="text-sm text-gray-500">Restore all settings to their default values</p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => setShowResetModal(true)}
              >
                Reset Settings
              </Button>
            </div>

            {/* Deactivate Account */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">Deactivate Account</p>
                  <p className="text-sm text-gray-500">Permanently deactivate your account and remove all data</p>
                </div>
              </div>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setShowDeactivateModal(true)}
              >
                Deactivate
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Reset Settings Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Settings"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleResetSettings}
              isLoading={isSaving}
            >
              Reset Settings
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <RotateCcw className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-gray-700">
              Are you sure you want to reset all settings to their default values? This action will:
            </p>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Reset notification preferences</li>
              <li>Reset theme and language settings</li>
              <li>Reset timezone to default</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Sign Out All Devices Modal */}
      <Modal
        isOpen={showSignOutAllModal}
        onClose={() => setShowSignOutAllModal(false)}
        title="Sign Out from All Devices"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSignOutAllModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleSignOutAll}
              isLoading={isSaving}
            >
              Sign Out All
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <LogOut className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-gray-700">
              This will sign you out from all devices except your current session. 
              You'll need to sign in again on those devices.
            </p>
          </div>
        </div>
      </Modal>

      {/* Deactivate Account Confirmation Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Deactivate Account"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeactivateModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeactivateAccount}
              isLoading={isSaving}
            >
              Deactivate Account
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-gray-700 font-medium">This action cannot be undone.</p>
            <p className="mt-2 text-sm text-gray-600">
              Deactivating your account will:
            </p>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Remove access to all maintenance data</li>
              <li>Cancel any pending maintenance requests</li>
              <li>Delete your personal information</li>
              <li>Revoke all team memberships</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
