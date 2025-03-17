import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function GeneralSettings() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="app-name">
              Application Name
            </label>
            <Input id="app-name" defaultValue="Web Crawler" />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="default-scan-depth">
              Default Scan Depth
            </label>
            <Input id="default-scan-depth" type="number" defaultValue={3} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Auto Archive</h3>
              <p className="text-sm text-muted-foreground">
                Automatically archive crawls older than 30 days
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for completed crawls
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Slack Integration</h3>
              <p className="text-sm text-muted-foreground">
                Send crawl results to Slack channel
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </section>
      
      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}