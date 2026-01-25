import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconPlus, 
  IconSearch, 
  IconEdit, 
  IconTrash,
  IconUser,
  IconMail,
  IconPhone,
  IconShield
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

const roles = [
  { id: 'product_staff', name: 'Product Listing Staff', description: 'Can add and edit products' },
  { id: 'inventory_manager', name: 'Inventory Manager', description: 'Manages stock levels and movements' },
  { id: 'finance_manager', name: 'Finance Manager', description: 'Access to sales and financial reports' },
  { id: 'pos_cashier', name: 'POS Cashier', description: 'Can process sales and billing' },
];

const staffMembers = [
  { id: 1, name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43210', role: 'inventory_manager', status: 'active', avatar: '👩' },
  { id: 2, name: 'Rahul Verma', email: 'rahul@example.com', phone: '+91 87654 32109', role: 'pos_cashier', status: 'active', avatar: '👨' },
  { id: 3, name: 'Anita Singh', email: 'anita@example.com', phone: '+91 76543 21098', role: 'product_staff', status: 'active', avatar: '👩' },
  { id: 4, name: 'Vikram Patel', email: 'vikram@example.com', phone: '+91 65432 10987', role: 'finance_manager', status: 'inactive', avatar: '👨' },
];

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredStaff = staffMembers.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their roles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <IconPlus className="w-4 h-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="hero" className="w-full" onClick={() => setIsAddDialogOpen(false)}>
                Add Staff Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => {
          const count = staffMembers.filter(s => s.role === role.id).length;
          return (
            <div key={role.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconShield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{role.name}</p>
                  <p className="text-xs text-muted-foreground">{count} member{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search staff members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Staff Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Staff Member</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl">
                        {staff.avatar}
                      </div>
                      <span className="font-medium text-foreground">{staff.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconMail className="w-4 h-4" />
                        {staff.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconPhone className="w-4 h-4" />
                        {staff.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-foreground">
                      {roles.find(r => r.id === staff.role)?.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      staff.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <IconEdit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                        <IconTrash className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
