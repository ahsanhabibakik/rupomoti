'use client'

import { useState } from 'react'
import { Plus, Shield, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Badge } from "@/components/ui/badge"

type PermissionGroupKey = 'products' | 'orders' | 'customers' | 'categories' | 'coupons' | 'reviews' | 'settings' | 'users' | 'roles';

type Role = {
  id: number;
  name: string;
  description: string;
  users: number;
  permissions: Record<PermissionGroupKey, string[]>;
};

// Mock data for demonstration
const roles: Role[] = [
  {
    id: 1,
    name: 'Super Admin',
    description: 'Full access to all features and settings including user and role management',
    users: 2,
    permissions: {
      products: ['create', 'read', 'update', 'delete'],
      orders: ['create', 'read', 'update', 'delete'],
      customers: ['create', 'read', 'update', 'delete'],
      categories: ['create', 'read', 'update', 'delete'],
      coupons: ['create', 'read', 'update', 'delete'],
      reviews: ['create', 'read', 'update', 'delete'],
      settings: ['create', 'read', 'update', 'delete'],
      users: ['create', 'read', 'update', 'delete'],
      roles: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    id: 2,
    name: 'Admin',
    description: 'Access to most features except user management',
    users: 2,
    permissions: {
      products: ['create', 'read', 'update', 'delete'],
      orders: ['create', 'read', 'update', 'delete'],
      customers: ['create', 'read', 'update', 'delete'],
      categories: ['create', 'read', 'update', 'delete'],
      coupons: ['create', 'read', 'update', 'delete'],
      reviews: ['create', 'read', 'update', 'delete'],
      settings: ['read', 'update'],
      users: ['read'],
      roles: ['read'],
    },
  },
  {
    id: 3,
    name: 'Manager',
    description: 'Access to product and order management',
    users: 3,
    permissions: {
      products: ['create', 'read', 'update'],
      orders: ['create', 'read', 'update'],
      customers: ['read'],
      categories: ['read'],
      coupons: ['read'],
      reviews: ['read', 'update'],
      settings: ['read'],
      users: ['read'],
      roles: ['read'],
    },
  },
  {
    id: 4,
    name: 'Support',
    description: 'Access to customer support features',
    users: 4,
    permissions: {
      products: ['read'],
      orders: ['read', 'update'],
      customers: ['read', 'update'],
      categories: ['read'],
      coupons: ['read'],
      reviews: ['read', 'update'],
      settings: ['read'],
      users: ['read'],
      roles: ['read'],
    },
  },
]

const permissionGroups: { name: string; key: PermissionGroupKey; permissions: string[] }[] = [
  {
    name: 'Products',
    key: 'products',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    name: 'Orders',
    key: 'orders',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    name: 'Customers',
    key: 'customers',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    name: 'Categories',
    key: 'categories',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    name: 'Coupons',
    key: 'coupons',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    name: 'Reviews',
    key: 'reviews',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    name: 'Settings',
    key: 'settings',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    name: 'Users',
    key: 'users',
    permissions: ['create', 'read', 'update', 'delete'],
  },
  {
    name: 'Roles',
    key: 'roles',
    permissions: ['create', 'read', 'update', 'delete'],
  },
]

export default function RolesPage() {
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, string[]>,
  })

  const handleCreateRole = async () => {
    try {
      // TODO: Implement role creation API call
      console.log('Creating new role:', newRole)
      toast.success('Role created successfully')
      setIsDialogOpen(false)
      setNewRole({
        name: '',
        description: '',
        permissions: {},
      })
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Failed to create role')
    }
  }

  const handleUpdateRole = async (roleId: number, updates: any) => {
    try {
      // TODO: Implement role update API call
      console.log('Updating role:', roleId, updates)
      toast.success('Role updated successfully')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role')
    }
  }

  const handleDeleteRole = async (roleId: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        // TODO: Implement role deletion API call
        console.log('Deleting role:', roleId)
        toast.success('Role deleted successfully')
      } catch (error) {
        console.error('Error deleting role:', error)
        toast.error('Failed to delete role')
      }
    }
  }

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role and its permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Input
                  id="roleDescription"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Permissions</h3>
                {permissionGroups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <Label>{group.name}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {group.permissions.map((permission) => (
                        <div
                          key={permission}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            id={`${group.key}-${permission}`}
                            checked={
                              newRole.permissions[group.key]?.includes(
                                permission
                              ) || false
                            }
                            onCheckedChange={(checked) => {
                              const currentPermissions =
                                newRole.permissions[group.key] || []
                              setNewRole({
                                ...newRole,
                                permissions: {
                                  ...newRole.permissions,
                                  [group.key]: checked
                                    ? [...currentPermissions, permission]
                                    : currentPermissions.filter(
                                        (p: string) => p !== permission
                                      ),
                                },
                              })
                            }}
                          />
                          <Label
                            htmlFor={`${group.key}-${permission}`}
                            className="text-sm font-normal"
                          >
                            {permission.charAt(0).toUpperCase() +
                              permission.slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-6">
        {filteredRoles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {role.name}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {role.users} users
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRole(role)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {permissionGroups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <h4 className="font-medium">{group.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          variant={
                            role.permissions[group.key]?.includes(permission)
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRole && (
        <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Role: {selectedRole.name}</DialogTitle>
              <DialogDescription>
                Modify role permissions and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editRoleName">Role Name</Label>
                <Input
                  id="editRoleName"
                  value={selectedRole.name}
                  onChange={(e) =>
                    setSelectedRole({ ...selectedRole, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRoleDescription">Description</Label>
                <Input
                  id="editRoleDescription"
                  value={selectedRole.description}
                  onChange={(e) =>
                    setSelectedRole({
                      ...selectedRole,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Permissions</h3>
                {permissionGroups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <Label>{group.name}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {group.permissions.map((permission) => (
                        <div
                          key={permission}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            id={`edit-${group.key}-${permission}`}
                            checked={
                              selectedRole.permissions[group.key]?.includes(
                                permission
                              ) || false
                            }
                            onCheckedChange={(checked) => {
                              const currentPermissions =
                                selectedRole.permissions[group.key] || []
                              setSelectedRole({
                                ...selectedRole,
                                permissions: {
                                  ...selectedRole.permissions,
                                  [group.key]: checked
                                    ? [...currentPermissions, permission]
                                    : currentPermissions.filter(
                                        (p: string) => p !== permission
                                      ),
                                },
                              })
                            }}
                          />
                          <Label
                            htmlFor={`edit-${group.key}-${permission}`}
                            className="text-sm font-normal"
                          >
                            {permission.charAt(0).toUpperCase() +
                              permission.slice(1)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedRole(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleUpdateRole(selectedRole.id, selectedRole)
                  setSelectedRole(null)
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 