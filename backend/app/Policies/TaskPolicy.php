<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function update(User $user, Task $task): bool
    {
        return $user->isTeacher() && $task->teacher_id === $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->isTeacher() && $task->teacher_id === $user->id;
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->isTeacher()) {
            return $task->teacher_id === $user->id;
        }

        return $task->assignedStudents()->where('users.id', $user->id)->exists();
    }
}
