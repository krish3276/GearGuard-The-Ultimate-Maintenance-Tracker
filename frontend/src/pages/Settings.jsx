import { useState } from 'react';
import {
    Settings as SettingsIcon,
    Bell,
    Shield,
    Database,
    Globe,
    Mail,
    Smartphone,
    Clock,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    HardDrive,
    Users,
    Building,
    Calendar,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button } from '../components/common';
import { cn } from '../utils/helpers';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [generalSettings, setGeneralSettings] = useState({
        companyName: 'GearGuard Industries',
        timezone: 'UTC-5 (Eastern Time)',
        dateFormat: 'MM/DD/YYYY',
        language: 'English',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        maintenanceReminders: true,
        equipmentAlerts: true,
        teamUpdates: false,
        dailyDigest: true,
        reminderLeadTime: '24',
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        sessionTimeout: '30',
        passwordExpiry: '90',
        loginAttempts: '5',
    });

    const [maintenanceSettings, setMaintenanceSettings] = useState({
        autoSchedule: true,
        defaultPriority: 'medium',
        escalationTime: '48',
        workingHoursStart: '08:00',
        workingHoursEnd: '17:00',
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    });

    const tabs = [
        { id: 'general', name: 'General', icon: Globe },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'maintenance', name: 'Maintenance', icon: SettingsIcon },
        { id: 'system', name: 'System', icon: Database },
    ];

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const ToggleSwitch = ({ enabled, onToggle }) => (
        <button
            onClick={onToggle}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                enabled ? 'bg-gradient-to-r from-primary-500 to-cyan-500' : 'bg-dark-700'
            )}
        >
            <span
                className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-lg',
                    enabled ? 'translate-x-6' : 'translate-x-1'
                )}
            />
        </button>
    );

    const SelectInput = ({ label, value, onChange, options, disabled }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 disabled:opacity-50"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const TextInput = ({ label, value, onChange, placeholder, type = 'text' }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
            />
        </div>
    );

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-500/20 rounded-xl">
                    <Building className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">General Settings</h3>
                    <p className="text-sm text-gray-500">Configure basic application settings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                    label="Company Name"
                    value={generalSettings.companyName}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, companyName: v })}
                />
                <SelectInput
                    label="Timezone"
                    value={generalSettings.timezone}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, timezone: v })}
                    options={[
                        { value: 'UTC-5 (Eastern Time)', label: 'UTC-5 (Eastern Time)' },
                        { value: 'UTC-6 (Central Time)', label: 'UTC-6 (Central Time)' },
                        { value: 'UTC-7 (Mountain Time)', label: 'UTC-7 (Mountain Time)' },
                        { value: 'UTC-8 (Pacific Time)', label: 'UTC-8 (Pacific Time)' },
                        { value: 'UTC+0 (GMT)', label: 'UTC+0 (GMT)' },
                        { value: 'UTC+5:30 (IST)', label: 'UTC+5:30 (IST)' },
                    ]}
                />
                <SelectInput
                    label="Date Format"
                    value={generalSettings.dateFormat}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, dateFormat: v })}
                    options={[
                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                />
                <SelectInput
                    label="Language"
                    value={generalSettings.language}
                    onChange={(v) => setGeneralSettings({ ...generalSettings, language: v })}
                    options={[
                        { value: 'English', label: 'English' },
                        { value: 'Spanish', label: 'Spanish' },
                        { value: 'French', label: 'French' },
                        { value: 'German', label: 'German' },
                    ]}
                />
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                    <Bell className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
                    <p className="text-sm text-gray-500">Manage how you receive notifications</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-200">Email Notifications</p>
                            <p className="text-xs text-gray-500">Receive notifications via email</p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={notificationSettings.emailNotifications}
                        onToggle={() =>
                            setNotificationSettings({
                                ...notificationSettings,
                                emailNotifications: !notificationSettings.emailNotifications,
                            })
                        }
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-200">Push Notifications</p>
                            <p className="text-xs text-gray-500">Receive push notifications in browser</p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={notificationSettings.pushNotifications}
                        onToggle={() =>
                            setNotificationSettings({
                                ...notificationSettings,
                                pushNotifications: !notificationSettings.pushNotifications,
                            })
                        }
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-200">Maintenance Reminders</p>
                            <p className="text-xs text-gray-500">Get reminders before scheduled maintenance</p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={notificationSettings.maintenanceReminders}
                        onToggle={() =>
                            setNotificationSettings({
                                ...notificationSettings,
                                maintenanceReminders: !notificationSettings.maintenanceReminders,
                            })
                        }
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-200">Equipment Alerts</p>
                            <p className="text-xs text-gray-500">Get notified about equipment issues</p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={notificationSettings.equipmentAlerts}
                        onToggle={() =>
                            setNotificationSettings({
                                ...notificationSettings,
                                equipmentAlerts: !notificationSettings.equipmentAlerts,
                            })
                        }
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-200">Team Updates</p>
                            <p className="text-xs text-gray-500">Get notified about team changes</p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={notificationSettings.teamUpdates}
                        onToggle={() =>
                            setNotificationSettings({
                                ...notificationSettings,
                                teamUpdates: !notificationSettings.teamUpdates,
                            })
                        }
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-200">Daily Digest</p>
                            <p className="text-xs text-gray-500">Receive a daily summary of activities</p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={notificationSettings.dailyDigest}
                        onToggle={() =>
                            setNotificationSettings({
                                ...notificationSettings,
                                dailyDigest: !notificationSettings.dailyDigest,
                            })
                        }
                    />
                </div>

                <SelectInput
                    label="Reminder Lead Time"
                    value={notificationSettings.reminderLeadTime}
                    onChange={(v) => setNotificationSettings({ ...notificationSettings, reminderLeadTime: v })}
                    options={[
                        { value: '1', label: '1 hour before' },
                        { value: '6', label: '6 hours before' },
                        { value: '12', label: '12 hours before' },
                        { value: '24', label: '24 hours before' },
                        { value: '48', label: '48 hours before' },
                        { value: '72', label: '72 hours before' },
                    ]}
                />
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-500/20 rounded-xl">
                    <Shield className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                    <p className="text-sm text-gray-500">Configure security and authentication options</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-200">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-500">Add an extra layer of security</p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={securitySettings.twoFactorAuth}
                        onToggle={() =>
                            setSecuritySettings({
                                ...securitySettings,
                                twoFactorAuth: !securitySettings.twoFactorAuth,
                            })
                        }
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectInput
                        label="Session Timeout (minutes)"
                        value={securitySettings.sessionTimeout}
                        onChange={(v) => setSecuritySettings({ ...securitySettings, sessionTimeout: v })}
                        options={[
                            { value: '15', label: '15 minutes' },
                            { value: '30', label: '30 minutes' },
                            { value: '60', label: '1 hour' },
                            { value: '120', label: '2 hours' },
                            { value: '480', label: '8 hours' },
                        ]}
                    />
                    <SelectInput
                        label="Password Expiry (days)"
                        value={securitySettings.passwordExpiry}
                        onChange={(v) => setSecuritySettings({ ...securitySettings, passwordExpiry: v })}
                        options={[
                            { value: '30', label: '30 days' },
                            { value: '60', label: '60 days' },
                            { value: '90', label: '90 days' },
                            { value: '180', label: '180 days' },
                            { value: 'never', label: 'Never' },
                        ]}
                    />
                    <SelectInput
                        label="Max Login Attempts"
                        value={securitySettings.loginAttempts}
                        onChange={(v) => setSecuritySettings({ ...securitySettings, loginAttempts: v })}
                        options={[
                            { value: '3', label: '3 attempts' },
                            { value: '5', label: '5 attempts' },
                            { value: '10', label: '10 attempts' },
                        ]}
                    />
                </div>
            </div>
        </div>
    );

    const renderMaintenanceSettings = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500/20 rounded-xl">
                    <SettingsIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Maintenance Settings</h3>
                    <p className="text-sm text-gray-500">Configure maintenance scheduling options</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-200">Auto-Schedule Maintenance</p>
                            <p className="text-xs text-gray-500">Automatically schedule recurring maintenance</p>
                        </div>
                    </div>
                    <ToggleSwitch
                        enabled={maintenanceSettings.autoSchedule}
                        onToggle={() =>
                            setMaintenanceSettings({
                                ...maintenanceSettings,
                                autoSchedule: !maintenanceSettings.autoSchedule,
                            })
                        }
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectInput
                        label="Default Priority"
                        value={maintenanceSettings.defaultPriority}
                        onChange={(v) => setMaintenanceSettings({ ...maintenanceSettings, defaultPriority: v })}
                        options={[
                            { value: 'low', label: 'Low' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'high', label: 'High' },
                            { value: 'critical', label: 'Critical' },
                        ]}
                    />
                    <SelectInput
                        label="Escalation Time (hours)"
                        value={maintenanceSettings.escalationTime}
                        onChange={(v) => setMaintenanceSettings({ ...maintenanceSettings, escalationTime: v })}
                        options={[
                            { value: '24', label: '24 hours' },
                            { value: '48', label: '48 hours' },
                            { value: '72', label: '72 hours' },
                            { value: '168', label: '1 week' },
                        ]}
                    />
                    <TextInput
                        label="Working Hours Start"
                        type="time"
                        value={maintenanceSettings.workingHoursStart}
                        onChange={(v) => setMaintenanceSettings({ ...maintenanceSettings, workingHoursStart: v })}
                    />
                    <TextInput
                        label="Working Hours End"
                        type="time"
                        value={maintenanceSettings.workingHoursEnd}
                        onChange={(v) => setMaintenanceSettings({ ...maintenanceSettings, workingHoursEnd: v })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Working Days</label>
                    <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <button
                                key={day}
                                onClick={() => {
                                    const days = maintenanceSettings.workingDays.includes(day)
                                        ? maintenanceSettings.workingDays.filter((d) => d !== day)
                                        : [...maintenanceSettings.workingDays, day];
                                    setMaintenanceSettings({ ...maintenanceSettings, workingDays: days });
                                }}
                                className={cn(
                                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                                    maintenanceSettings.workingDays.includes(day)
                                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                        : 'bg-dark-800 text-gray-400 border border-dark-600 hover:border-dark-500'
                                )}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSystemSettings = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <Database className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">System Settings</h3>
                    <p className="text-sm text-gray-500">View system information and manage data</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <HardDrive className="w-5 h-5 text-gray-500" />
                        <p className="text-sm font-medium text-gray-200">Storage Usage</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Used</span>
                            <span className="text-gray-200">24.5 GB / 100 GB</span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                            <div className="h-full w-1/4 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <Database className="w-5 h-5 text-gray-500" />
                        <p className="text-sm font-medium text-gray-200">Database Status</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-sm text-emerald-400">Connected & Healthy</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-dark-900/50 rounded-xl border border-dark-700/50">
                <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className="w-5 h-5 text-gray-500" />
                    <div>
                        <p className="text-sm font-medium text-gray-200">System Version</p>
                        <p className="text-xs text-gray-500">GearGuard v2.1.0</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />}>
                        Check for Updates
                    </Button>
                </div>
            </div>

            <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/30">
                <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <p className="text-sm font-medium text-rose-300">Danger Zone</p>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                    These actions are irreversible. Please proceed with caution.
                </p>
                <div className="flex gap-3">
                    <Button variant="danger" size="sm">
                        Clear Cache
                    </Button>
                    <Button variant="danger" size="sm">
                        Export All Data
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralSettings();
            case 'notifications':
                return renderNotificationSettings();
            case 'security':
                return renderSecuritySettings();
            case 'maintenance':
                return renderMaintenanceSettings();
            case 'system':
                return renderSystemSettings();
            default:
                return renderGeneralSettings();
        }
    };

    return (
        <div>
            <Header
                title="Settings"
                subtitle="Configure your application preferences and system settings"
            />

            <div className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-64 flex-shrink-0">
                        <Card className="p-2">
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-gradient-to-r from-primary-600/80 to-primary-500/60 text-white shadow-glow-sm'
                                                    : 'text-gray-400 hover:bg-glass-hover hover:text-white'
                                            )}
                                        >
                                            <tab.icon className="w-5 h-5" />
                                            {tab.name}
                                        </button>
                                    );
                                })}
                            </nav>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <Card>
                            {renderTabContent()}

                            {/* Save Button */}
                            <div className="mt-8 pt-6 border-t border-dark-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {saveSuccess && (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                            <span className="text-sm text-emerald-400">Settings saved successfully!</span>
                                        </>
                                    )}
                                </div>
                                <Button
                                    onClick={handleSave}
                                    isLoading={isSaving}
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
