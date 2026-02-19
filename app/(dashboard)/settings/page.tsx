"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Settings, Bell, Lock, Eye } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    dailyDigest: true,
    weeklyReport: true,
  });
  const [visibility, setVisibility] = useState({
    showEmail: true,
    showPhone: false,
  });
  const [theme, setTheme] = useState("light");
  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your application preferences and security settings</p>
        </div>
        {/* Profile Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Profile Settings
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">First Name</Label>
                <Input type="text" placeholder="John" defaultValue="John" />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">Last Name</Label>
                <Input type="text" placeholder="Omondi" defaultValue="Omondi" />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Email Address</Label>
              <Input type="email" placeholder="john@example.com" defaultValue="john@example.com" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</Label>
              <Input type="tel" placeholder="+254 712 345 678" defaultValue="+254 712 345 678" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Department</Label>
              <Select defaultValue="fraud-detection">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fraud-detection">Fraud Detection</SelectItem>
                  <SelectItem value="investigations">Investigations</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </Card>
        {/* Notification Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Alerts</p>
                <p className="text-sm text-gray-600">Receive real-time alerts via email</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, emailAlerts: e.target.checked })
                }
                className="h-5 w-5 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">SMS Alerts</p>
                <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.smsAlerts}
                onChange={(e) =>
                  setNotifications({ ...notifications, smsAlerts: e.target.checked })
                }
                className="h-5 w-5 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Daily Digest</p>
                <p className="text-sm text-gray-600">Summary of daily fraud detection activities</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.dailyDigest}
                onChange={(e) =>
                  setNotifications({ ...notifications, dailyDigest: e.target.checked })
                }
                className="h-5 w-5 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Weekly Report</p>
                <p className="text-sm text-gray-600">Comprehensive weekly analysis report</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyReport}
                onChange={(e) =>
                  setNotifications({ ...notifications, weeklyReport: e.target.checked })
                }
                className="h-5 w-5 cursor-pointer"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">Save Preferences</Button>
            </div>
          </div>
        </Card>
        {/* Privacy Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Show Email in Profile</p>
                <p className="text-sm text-gray-600">Allow other team members to see your email</p>
              </div>
              <input
                type="checkbox"
                checked={visibility.showEmail}
                onChange={(e) =>
                  setVisibility({ ...visibility, showEmail: e.target.checked })
                }
                className="h-5 w-5 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Show Phone in Profile</p>
                <p className="text-sm text-gray-600">Allow other team members to see your phone number</p>
              </div>
              <input
                type="checkbox"
                checked={visibility.showPhone}
                onChange={(e) =>
                  setVisibility({ ...visibility, showPhone: e.target.checked })
                }
                className="h-5 w-5 cursor-pointer"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">Save Privacy Settings</Button>
            </div>
          </div>
        </Card>
        {/* Theme Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Theme & Display</h2>
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Preferred Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">Save Theme</Button>
            </div>
          </div>
        </Card>
        {/* Security Settings */}
        <Card className="p-6 border-red-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Current Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">New Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="bg-red-600 hover:bg-red-700">Change Password</Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
