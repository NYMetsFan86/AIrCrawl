"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

// Define the permission structure as an interface
interface RolePermission {
  role: string;
  crawls: boolean;
  alerts: boolean;
  settings: boolean;
  api: boolean;
  analytics: boolean;
}

export default function TeamPermissionsPage() {
  const [permissions, setPermissions] = useState<RolePermission[]>([
    { role: "Admin", crawls: true, alerts: true, settings: true, api: true, analytics: true },
    { role: "Editor", crawls: true, alerts: true, settings: false, api: true, analytics: true },
    { role: "Viewer", crawls: false, alerts: true, settings: false, api: false, analytics: true },
  ]);

  const togglePermission = (roleIndex: number, permission: keyof Omit<RolePermission, 'role'>) => {
    setPermissions(prev => {
      const updated = [...prev];
      updated[roleIndex] = {
        ...updated[roleIndex],
        [permission]: !(updated[roleIndex] as RolePermission)[permission]
      } as RolePermission;
      return updated;
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">User Permissions</h2>
      <p className="text-muted-foreground mb-6">
        Configure access rights for different user roles in your organization.
      </p>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Crawls</TableHead>
            <TableHead>Alerts</TableHead>
            <TableHead>Settings</TableHead>
            <TableHead>API Access</TableHead>
            <TableHead>Analytics</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((role, index) => (
            <TableRow key={role.role}>
              <TableCell className="font-medium">{role.role}</TableCell>
              <TableCell>
                <Switch 
                  checked={role.crawls} 
                  onCheckedChange={() => togglePermission(index, "crawls")} 
                />
              </TableCell>
              <TableCell>
                <Switch 
                  checked={role.alerts} 
                  onCheckedChange={() => togglePermission(index, "alerts")} 
                />
              </TableCell>
              <TableCell>
                <Switch 
                  checked={role.settings} 
                  onCheckedChange={() => togglePermission(index, "settings")} 
                />
              </TableCell>
              <TableCell>
                <Switch 
                  checked={role.api} 
                  onCheckedChange={() => togglePermission(index, "api")} 
                />
              </TableCell>
              <TableCell>
                <Switch 
                  checked={role.analytics} 
                  onCheckedChange={() => togglePermission(index, "analytics")} 
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}