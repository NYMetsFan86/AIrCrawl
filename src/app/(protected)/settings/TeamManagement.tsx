"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Users, Shield, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  sent: string;
}

export default function TeamManagement() {
  const { data: session } = useSession();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchTeamMembers();
      fetchInvitations();
    }
  }, [session]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(teamMembers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers(
        teamMembers.filter(
          (member) =>
            member.name.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query) ||
            member.role.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, teamMembers]);

  const fetchTeamMembers = async () => {
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/team');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setTeamMembers(data.members || []);
      setFilteredMembers(data.members || []);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/settings/team/invitations');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      toast({
        title: "Error",
        description: "Failed to load invitations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch('/api/settings/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: "member"
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send invitation');
      }
      
      toast({
        title: "Success",
        description: `Invitation sent to ${inviteEmail}`,
      });
      
      setInviteEmail("");
      setInviteOpen(false);
      fetchInvitations();
    } catch (error) {
      console.error("Failed to invite team member:", error);
      toast({
        title: "Error",
        description: (error as any).message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#011627] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Team Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their access.
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to your team member's email.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage team members and their roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {member.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Manage pending team invitations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>{invite.role}</TableCell>
                      <TableCell>{formatDate(invite.sent)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Resend
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Configure permissions for each role in your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium">Permission</div>
                  <div className="col-span-1 text-center font-medium">Admin</div>
                  <div className="col-span-1 text-center font-medium">Member</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2 border-t">
                  <div className="col-span-1">Manage Team</div>
                  <div className="col-span-1 text-center">✓</div>
                  <div className="col-span-1 text-center">-</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2 border-t">
                  <div className="col-span-1">Manage Crawls</div>
                  <div className="col-span-1 text-center">✓</div>
                  <div className="col-span-1 text-center">✓</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2 border-t">
                  <div className="col-span-1">Manage Alerts</div>
                  <div className="col-span-1 text-center">✓</div>
                  <div className="col-span-1 text-center">✓</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2 border-t">
                  <div className="col-span-1">Manage API Keys</div>
                  <div className="col-span-1 text-center">✓</div>
                  <div className="col-span-1 text-center">-</div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-2 border-t">
                  <div className="col-span-1">Billing & Subscription</div>
                  <div className="col-span-1 text-center">✓</div>
                  <div className="col-span-1 text-center">-</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}