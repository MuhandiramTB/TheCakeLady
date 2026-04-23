import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import Input from '../ui/Input.jsx';
import PasswordInput from '../ui/PasswordInput.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    setProfileMsg('');
    try {
      const res = await api('/auth/profile', { method: 'PUT', body: profileForm });
      login(res.data, localStorage.getItem('token'));
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg('Error: ' + err.message);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('Error: Passwords do not match');
      return;
    }
    setIsSubmittingPassword(true);
    try {
      await api('/auth/password', {
        method: 'PUT',
        body: { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
      });
      setPasswordMsg('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordMsg('Error: ' + err.message);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="py-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Personal Details</h2>
          <form onSubmit={handleProfileSubmit}>
            {profileMsg && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium animate-slide-up ${profileMsg.startsWith('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                {profileMsg}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
              <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-[15px]">{user?.email}</div>
            </div>
            <Input
              label="Full Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
            <Input
              label="Mobile Number"
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="07X XXX XXXX"
              required
            />
            <Button type="submit" isLoading={isSubmittingProfile} className="w-full">
              Update Profile
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            {passwordMsg && (
              <div className={`p-3 rounded-lg mb-4 text-sm font-medium animate-slide-up ${passwordMsg.startsWith('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                {passwordMsg}
              </div>
            )}
            <PasswordInput
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
            <PasswordInput
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Min 6 characters"
              required
            />
            <PasswordInput
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
            <Button type="submit" isLoading={isSubmittingPassword} className="w-full">
              Change Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
