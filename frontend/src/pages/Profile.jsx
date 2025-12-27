import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Lock,
  Bell,
  Palette,
  Save,
  Edit2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Button, Input, Avatar } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/helpers';

const Profile = () => {
  const { user } = useAuth();
  
  // Profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'John Smith',
    email: user?.email || 'john@gearguard.com',
    phone: '+1 (555) 123-4567',
    department: 'Operations',
    location: 'Main Facility - Building A',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    maintenanceAlerts: true,
    systemUpdates: false,
    theme: 'light',
  });

  const handleProfileSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handlePasswordUpdate = async () => {
    setPasswordError('');
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsUpdatingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password updated successfully!');
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
        enabled ? 'bg-primary-600' : 'bg-gray-300'
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

  return (
    <div>
      <Header
        title="My Profile"
        subtitle="Manage your personal information and account settings"
      />

      <div className="p-6 space-y-6">
        {/* Profile Overview Card */}
        <Card>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar name={profileData.fullName} size="xl" />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">{profileData.fullName}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 capitalize">
                  {user?.role || 'Admin'}
                </span>
                <span className="flex items-center gap-2 text-gray-500">
                  <Mail className="w-4 h-4" />
                  {profileData.email}
                </span>
              </div>
            </div>
            <Button
              variant={isEditing ? 'secondary' : 'primary'}
              leftIcon={<Edit2 className="w-4 h-4" />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Section */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-500">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                value={profileData.fullName}
                onChange={(v) => setProfileData({ ...profileData, fullName: v })}
                disabled={!isEditing}
                leftIcon={<User className="w-4 h-4 text-gray-400" />}
              />
              
              <Input
                label="Email Address"
                type="email"
                value={profileData.email}
                onChange={(v) => setProfileData({ ...profileData, email: v })}
                disabled={true}
                leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
              />
              
              <Input
                label="Phone Number"
                type="tel"
                value={profileData.phone}
                onChange={(v) => setProfileData({ ...profileData, phone: v })}
                disabled={!isEditing}
                leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
              />
              
              <Input
                label="Department"
                value={profileData.department}
                onChange={(v) => setProfileData({ ...profileData, department: v })}
                disabled={!isEditing}
                leftIcon={<Building className="w-4 h-4 text-gray-400" />}
              />
              
              <Input
                label="Location"
                value={profileData.location}
                onChange={(v) => setProfileData({ ...profileData, location: v })}
                disabled={!isEditing}
                leftIcon={<MapPin className="w-4 h-4 text-gray-400" />}
              />

              {isEditing && (
                <div className="pt-4">
                  <Button
                    onClick={handleProfileSave}
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                    className="w-full"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Security Section */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                <p className="text-sm text-gray-500">Change your password</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(v) => setPasswordData({ ...passwordData, currentPassword: v })}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(v) => setPasswordData({ ...passwordData, newPassword: v })}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(v) => setPasswordData({ ...passwordData, confirmPassword: v })}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}

              <div className="pt-4">
                <Button
                  onClick={handlePasswordUpdate}
                  isLoading={isUpdatingPassword}
                  variant="secondary"
                  leftIcon={<Lock className="w-4 h-4" />}
                  className="w-full"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences Section */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
              <p className="text-sm text-gray-500">Manage your notification and display preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Preferences */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Notifications</h4>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive updates via email</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={preferences.emailNotifications}
                  onToggle={() => togglePreference('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Maintenance Alerts</p>
                    <p className="text-xs text-gray-500">Get notified about maintenance events</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={preferences.maintenanceAlerts}
                  onToggle={() => togglePreference('maintenanceAlerts')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Updates</p>
                    <p className="text-xs text-gray-500">Receive system update notifications</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={preferences.systemUpdates}
                  onToggle={() => togglePreference('systemUpdates')}
                />
              </div>
            </div>

            {/* Theme Preferences */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Appearance</h4>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Theme</p>
                    <p className="text-xs text-gray-500">Choose your preferred theme</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 transition-colors',
                      preferences.theme === 'light'
                        ? 'border-primary-500 bg-white'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div className="w-full h-8 bg-gray-100 rounded mb-2" />
                    <span className="text-sm font-medium text-gray-700">Light</span>
                  </button>
                  <button
                    onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 transition-colors',
                      preferences.theme === 'dark'
                        ? 'border-primary-500 bg-gray-800'
                        : 'border-gray-200 bg-gray-800 hover:border-gray-300'
                    )}
                  >
                    <div className="w-full h-8 bg-gray-700 rounded mb-2" />
                    <span className="text-sm font-medium text-gray-300">Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
