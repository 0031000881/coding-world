<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        if ($user->isStudent()) {
            return $project->student_id === $user->id;
        }

        // Teacher can view if they own the related task
        return $project->task && $project->task->teacher_id === $user->id;
    }

    public function update(User $user, Project $project): bool
    {
        return $user->isStudent() && $project->student_id === $user->id;
    }
}
