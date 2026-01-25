import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, store_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const hasRole = (role: UserRole, storeId?: string): boolean => {
    if (!roles) return false;
    return roles.some(r => 
      r.role === role && (!storeId || r.store_id === storeId)
    );
  };

  const isSuperadmin = hasRole('superadmin');
  const isStoreOwner = (storeId?: string) => hasRole('store_owner', storeId);
  const isStoreAdmin = (storeId?: string) => hasRole('store_admin', storeId);

  return {
    roles,
    isLoading,
    hasRole,
    isSuperadmin,
    isStoreOwner,
    isStoreAdmin,
  };
}
