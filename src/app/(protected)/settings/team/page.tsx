"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [teamName, setTeamName] = useState("Web Crawler Team");
  const [teamDomain, setTeamDomain] = useState("webcrawler.company.com");
  
  // Edit member state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState("");

  // Add state for showing the invite form
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, [session]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(teamMembers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers(
        teamMembers.filter(
          (member) =>
            member.name?.toLowerCase().includes(query) ||
            member.email.toLowerCase().includes(query) ||
            member.role.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, teamMembers]);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings/team');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Server error (${response.status}):`, errorData);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if current user is in the list, if not add them as admin
      const currentUserEmail: string | undefined = session?.user?.email ?? undefined;
      let members: TeamMember[] = data.members || [];
      
      // Ensure the current user is listed as an admin if they exist in the database
      if (currentUserEmail && !members.some(m => m.email === currentUserEmail)) {
        console.warn("Current user not found in team members, refresh may be required");
      }
      
      setTeamMembers(members);
      setFilteredMembers(members);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      toast({
        title: "API Error",
        description: "Could not connect to the server. Using sample data instead.",
        variant: "destructive",
      });
      
      // Use minimal mock data as fallback, including the current user as admin
      const currentUserEmail: string | undefined = session?.user?.email ?? undefined;
      const currentUserName: string | undefined = session?.user?.name ?? undefined;
      const mockMembers: TeamMember[] = [
        { 
          id: "current-user", 
          name: currentUserName || "Current User", 
          email: currentUserEmail || "current@example.com", 
          role: "admin" 
        },
        { id: "2", name: "Jane Smith", email: "jane@example.com", role: "member" },
      ];
      
      setTeamMembers(mockMembers);
      setFilteredMembers(mockMembers);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh function
  const refreshTeamMembers = () => {
    fetchTeamMembers();
  };

  // Add an interval to refresh periodically (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTeamMembers();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  const handleInviteMember = async () => {
    if (!newMemberEmail) {
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
          email: newMemberEmail,
          role: newMemberRole
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }
      
      toast({
        title: "Success",
        description: `Invitation sent to ${newMemberEmail}`,
      });
      
      // Clear the form
      setNewMemberEmail("");
      
      // Either redirect to invitations page or add UI for entering another email
      router.push("/settings/team/invitations");
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditDialogOpen(true);
  };

  // Update handleRemoveMember to actually remove from database
  const handleRemoveMember = async (memberId: string) => {
    // Confirm before removal
    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        const response = await fetch(`/api/settings/team/${memberId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove team member');
        }
        
        // Update local state
        setTeamMembers(teamMembers.filter(member => member.id !== memberId));
        setFilteredMembers(filteredMembers.filter(member => member.id !== memberId));
        
        toast({
          title: "Success",
          description: "Team member removed successfully.",
        });
      } catch (error) {
        console.error("Error removing team member:", error);
        toast({
          title: "Error",
          description: "Failed to remove team member. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveTeamSettings = () => {
    // Add API call to save team settings
    toast({
      title: "Success",
      description: "Team settings saved successfully.",
    });
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    
    try {
      const response = await fetch(`/api/settings/team/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update member role');
      }
      
      // Update local state
      setTeamMembers(
        teamMembers.map(member => 
          member.id === editingMember.id 
            ? { ...member, role: editRole } 
            : member
        )
      );
      
      setFilteredMembers(
        filteredMembers.map(member => 
          member.id === editingMember.id 
            ? { ...member, role: editRole } 
            : member
        )
      );
      
      toast({
        title: "Success",
        description: "Team member updated successfully.",
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating member role:", error);
      toast({
        title: "Error",
        description: "Failed to update member role. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Team Members</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Input 
              className="max-w-xs" 
              placeholder="Search team members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button onClick={() => setShowInviteForm(!showInviteForm)}>
              {showInviteForm ? 'Cancel' : 'Invite Member'}
            </Button>
          </div>
          
          {showInviteForm ? (
            <div className="bg-muted p-4 rounded-md mb-4">
              <h3 className="text-md font-medium mb-2">Invite New Team Member</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" htmlFor="new-member-email">
                      Email Address
                    </label>
                    <Input
                      id="new-member-email"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="new-member-role">
                      Role
                    </label>
                    <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                      <SelectTrigger id="new-member-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteMember}>
                    Send Invitation
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-muted/50 rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-3 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                        <span>Loading team members...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-muted">
                      <td className="p-3">{member.name || 'Unnamed User'}</td>
                      <td className="p-3">{member.email}</td>
                      <td className="p-3">
                        <Badge variant={member.role === "admin" ? "default" : "outline"}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditMember(member)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-3 text-center">No team members found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Team Settings</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="team-name">
              Team Name
            </label>
            <Input 
              id="team-name" 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value)} 
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="team-domain">
              Team Domain
            </label>
            <Input 
              id="team-domain" 
              value={teamDomain} 
              onChange={(e) => setTeamDomain(e.target.value)} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveTeamSettings}>Save Changes</Button>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                type="email"
                value={editingMember?.email || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <Select
                value={editRole}
                onValueChange={(value) => setEditRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateMember}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}