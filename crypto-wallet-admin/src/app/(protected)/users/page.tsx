'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { UserFilters } from '@/components/users/UserFilters';
import { UserList } from '@/components/users/UserList';
import { UserForm } from '@/components/users/UserForm';
import { UserDetails } from '@/components/users/UserDetails';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { User, UserSort } from '@/types/users';

export default function UsersPage() {
  const {
    users,
    selectedUser,
    userActivity,
    filters,
    sort,
    pagination,
    isLoading,
    error,
    fetchUsers,
    fetchUserById,
    fetchUserActivity,
    createUser,
    updateUser,
    setFilters,
    setSort,
    setPage,
  } = useUserStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, filters, sort, pagination.page]);

  const handleSort = (field: keyof User) => {
    setSort({
      field,
      direction:
        sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    } as UserSort);
  };

  const handleUserClick = async (user: User) => {
    await Promise.all([fetchUserById(user.id), fetchUserActivity(user.id)]);
    setIsDetailsModalOpen(true);
  };

  const handleCreateUser = async (data: any) => {
    try {
      await createUser(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Novo Usuário
        </button>
      </div>

      <div className="space-y-6">
        <UserFilters filters={filters} onApplyFilters={setFilters} />

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <UserList
              users={users}
              sortField={sort.field}
              sortDirection={sort.direction}
              onSort={handleSort}
              onUserClick={handleUserClick}
            />

            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Usuário"
      >
        <UserForm onSubmit={handleCreateUser} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Usuário"
      >
        {selectedUser && (
          <UserForm
            user={selectedUser}
            onSubmit={handleUpdateUser}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalhes do Usuário"
        size="xl"
      >
        {selectedUser && userActivity && (
          <div className="space-y-4">
            <UserDetails user={selectedUser} activity={userActivity} />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Editar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
