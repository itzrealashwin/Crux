import React, { useState } from "react";
import {
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Mail,
  Shield,
  ShieldCheck,
  UserPlus,
  Filter,
  Download,
  Loader2,
  BadgeCheck,
  ShieldAlert,
  Eye,
  EyeOff
} from "lucide-react";

// UI Components
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

// Hooks
import { useAllAdmins, useAdminProfile } from "../hooks/useAdmin";

export default function ManageAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "ADMIN",
    password: "", // Added password field for creation
  });

  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "ADMIN",
    isActive: true,
    password: "",
  });

  // API Integrations
  const { data: adminsResponse, isLoading, isError } = useAllAdmins();
  const { createProfile, isCreating, updateProfile, isUpdating, deleteProfile, isDeleting } = useAdminProfile();

  // Extract array of admins from response
  const admins = Array.isArray(adminsResponse?.data) 
    ? adminsResponse.data 
    : Array.isArray(adminsResponse) 
      ? adminsResponse 
      : [];

  const filteredAdmins = admins.filter((admin) => {
    const fullName = `${admin?.firstName || ""} ${admin?.lastName || ""}`.toLowerCase();
    const email = admin?.email?.toLowerCase() || "";
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const getInitials = (firstName, lastName) => {
    const f = firstName?.[0] || "A";
    const l = lastName?.[0] || "D";
    return (f + l).toUpperCase();
  };

  const handleAddAdmin = async () => {
    if (formData.firstName && formData.email) {
      try {
        await createProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          password: formData.password || "Crux@123", // fallback default password
        });
        setFormData({ firstName: "", lastName: "", email: "", role: "ADMIN", password: "" });
        setIsAddDialogOpen(false);
      } catch (error) {
        console.error("Error creating admin:", error);
      }
    }
  };

  const handleUpdateAdmin = async () => {
    if (editingAdmin) {
      try {
        // Warning: The backend endpoint might only be configured to update the logged-in admin.
        // We pass the id in the payload structure anyways so it scales if the controller changes.
        const payload = {
          id: editingAdmin.adminCode || editingAdmin._id || editingAdmin.id,
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          email: editFormData.email,
          role: editFormData.role,
          isActive: editFormData.isActive,
        };
        if (editFormData.password) {
          payload.password = editFormData.password;
        }

        await updateProfile(payload);
        setIsEditDialogOpen(false);
        setEditingAdmin(null);
      } catch (error) {
        console.error("Error updating admin:", error);
      }
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (confirm("Are you sure you want to permanently delete this admin? This action cannot be undone.")) {
      try {
        await deleteProfile(id);
      } catch (error) {
        console.error("Error deleting admin:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manage Admins
          </h1>
          <p className="text-sm text-muted-foreground">
            Control access and roles for the administrative team.
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="h-10 gap-2 w-fit shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 shadow-sm bg-card transition-colors hover:border-primary/20">
          <CardHeader className="pb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Admins</p>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (
              <p className="text-3xl font-bold text-foreground">{admins.length}</p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm bg-card transition-colors hover:border-primary/20">
          <CardHeader className="pb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Super Admins</p>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (
              <p className="text-3xl font-bold text-foreground">
                {admins.filter((a) => a.accountDetails?.role === "SUPER_ADMIN").length}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm bg-card transition-colors hover:border-primary/20">
          <CardHeader className="pb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Status</p>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (
              <p className="text-3xl font-bold text-emerald-600">
                {admins.filter((a) => a.isActive).length}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20 px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg font-semibold">Administrative Team</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background focus:ring-1"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableHead className="px-6 py-4 font-semibold">Admin</TableHead>
                  <TableHead className="px-6 py-4 font-semibold">Role</TableHead>
                  <TableHead className="px-6 py-4 font-semibold hidden sm:table-cell">Join Date</TableHead>
                  <TableHead className="px-6 py-4 font-semibold">Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan="5" className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p>Loading admins...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <TableRow
                      key={admin.adminCode || admin._id || admin.id}
                      className="group border-b border-border/40 hover:bg-muted/10 transition-colors"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border shadow-sm">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                              {getInitials(admin.firstName, admin.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-foreground">
                              {admin.firstName} {admin.lastName}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <Mail className="h-3 w-3" />
                              {admin.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {admin.accountDetails?.role === "SUPER_ADMIN" ? (
                            <ShieldCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium whitespace-nowrap">
                            {admin.accountDetails?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) : "-"}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <Badge
                            variant={admin.isActive ? "outline" : "secondary"}
                            className={`capitalize font-semibold border-none rounded-full px-3 whitespace-nowrap ${
                              admin.isActive
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-muted text-muted-foreground opacity-70"
                            }`}
                          >
                            {admin.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {admin.isVerified ? (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 flex items-center gap-1">
                              <BadgeCheck className="h-3 w-3" /> Verified
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" /> Unverified
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 shadow-lg border-border/60">
                            <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="cursor-pointer gap-2 py-2"
                              onClick={() => {
                                setEditingAdmin(admin);
                                setEditFormData({
                                  firstName: admin.firstName || "",
                                  lastName: admin.lastName || "",
                                  email: admin.email || "",
                                  role: admin.accountDetails?.role || "ADMIN",
                                  isActive: admin.isActive !== undefined ? admin.isActive : true,
                                  password: "",
                                });
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={isDeleting}
                              onClick={() => handleDeleteAdmin(admin.adminCode || admin._id || admin.id)}
                              className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer gap-2 py-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Remove Access</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="5" className="h-32 text-center">
                      <p className="text-sm text-muted-foreground italic">
                        No administrators found matching "{searchQuery}"
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Assign administrative privileges to a new team member.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                  First Name
                </label>
                <Input
                  id="firstName"
                  placeholder="Robert"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  placeholder="Fox"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Official Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="robert@crux.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-10"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">
                Access Level
              </label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Standard Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="h-10 px-6"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} className="h-10 px-6" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Admin Profile</DialogTitle>
            <DialogDescription>
              Update access levels and details for this team member.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground">
                  First Name
                </label>
                <Input
                  placeholder="Robert"
                  value={editFormData.firstName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, firstName: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Last Name
                </label>
                <Input
                  placeholder="Fox"
                  value={editFormData.lastName}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, lastName: e.target.value })
                  }
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">
                Official Email
              </label>
              <Input
                type="email"
                placeholder="robert@crux.com"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                className="h-10"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">
                New Password (Optional)
              </label>
              <div className="relative">
                <Input
                  type={showEditPassword ? "text" : "password"}
                  placeholder="Leave blank to keep current"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, password: e.target.value })
                  }
                  className="h-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                >
                  {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-foreground">
                Access Level
              </label>
              <Select
                value={editFormData.role}
                onValueChange={(val) => setEditFormData({ ...editFormData, role: val })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Standard Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 mt-2">
              <div className="flex items-center justify-between border rounded-lg p-3 shadow-sm border-border/40">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold text-foreground">
                    Active Status
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable this administrator account.
                  </p>
                </div>
                <Switch
                  checked={editFormData.isActive}
                  onCheckedChange={(checked) => 
                    setEditFormData({ ...editFormData, isActive: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="h-10 px-6"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAdmin} className="h-10 px-6" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

