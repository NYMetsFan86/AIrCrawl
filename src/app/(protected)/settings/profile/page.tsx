import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function UserProfile() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="first-name">
                First Name
              </label>
              <Input id="first-name" defaultValue="John" />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="last-name">
                Last Name
              </label>
              <Input id="last-name" defaultValue="Doe" />
            </div>
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email Address
            </label>
            <Input id="email" type="email" defaultValue="john.doe@example.com" />
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Account Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for crawl results
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="current-password">
              Current Password
            </label>
            <Input id="current-password" type="password" />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="new-password">
              New Password
            </label>
            <Input id="new-password" type="password" />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="confirm-password">
              Confirm New Password
            </label>
            <Input id="confirm-password" type="password" />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}