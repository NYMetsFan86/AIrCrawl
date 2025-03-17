"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function UserProfileSettings() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log({ name, email, company, twoFactorEnabled });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">User Profile</h2>
      
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <div className="mb-2">Profile Photo</div>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-500 text-sm">No Image</span>
              )}
            </div>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </Button>
          </div>
        </div>

        <div>
          <label className="block mb-2">Full Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="max-w-md"
          />
        </div>

        <div>
          <label className="block mb-2">Email Address</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            type="email"
            className="max-w-md"
          />
        </div>

        <div>
          <label className="block mb-2">Company</label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter your company name"
            className="max-w-md"
          />
        </div>

        <div>
          <div>
            <div>Two-Factor Authentication</div>
            <div className="text-sm text-gray-500">Enable for additional account security</div>
          </div>
          <div className="flex items-center mt-2">
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
              id="two-factor"
            />
            <label htmlFor="two-factor" className="ml-2">
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </label>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          className="bg-[#011627] text-white hover:bg-[#01111b]"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}