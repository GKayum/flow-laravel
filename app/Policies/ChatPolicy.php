<?php

namespace App\Policies;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ChatPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Chat $chat): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Chat $chat): Response
    {
        return $chat->users()
            ->where('user_id', $user->id)
            ->wherePivot('role', 'owner')
            ->exists()
                ? Response::allow()
                : Response::deny('Вы не можете редактировать чат');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Chat $chat): Response
    {
        return $chat->users()
            ->where('user_id', $user->id)
            ->wherePivot('role', 'owner')
            ->exists()
                ? Response::allow()
                : Response::deny('Вы не можете удалить чат');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Chat $chat): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Chat $chat): bool
    {
        return false;
    }

    public function changeRole(User $user, Chat $chat): Response
    {
        if (!$chat->is_group) {
            return Response::deny('В приватном чате нельзя изменять роли');
        }

        return $chat->users()
            ->where('user_id', $user->id)
            ->wherePivot('role', 'owner')
            ->exists()
                ? Response::allow()
                : Response::deny('У вас нет прав для изменения ролей');
    }

    public function addMember(User $user, Chat $chat): Response
    {
        if (!$chat->is_group) {
            return Response::deny('Нельзя добавлять участников в приватный чат');
        }

        return $chat->users()
            ->where('user_id', $user->id)
            ->wherePivotIn('role', ['owner', 'admin']) 
            ->exists()
                ? Response::allow()
                : Response::deny('Вы не можете добавлять участников');
    }

    public function removeMember(User $user, Chat $chat, User $member): Response
    {
        if (!$chat->is_group) {
            return Response::deny('Нельзя удалять участников из приватного чата');
        }

        $currentUserRole = $chat->users()
            ->where('user_id', $user->id)
            ->first()?->pivot?->role;

        // Если роль не найдена - доступ запрещен
        if (!$currentUserRole) {
            return Response::deny('Вы не состоите в чате');
        }

        if ($currentUserRole === 'owner') {
            return Response::allow();
        }

        if ($currentUserRole === 'admin') {
            if ($member) {
                $memberRole = $chat->users()
                    ->where('user_id', $member->id)
                    ->first()?->pivot?->role;
                
                if ($memberRole === 'owner') {
                    return Response::deny('Вы не можете удалить владельца чата');
                }
            }
            return Response::allow();
        }

        return Response::deny('У вас нет прав на удаления участников');
    }
}
