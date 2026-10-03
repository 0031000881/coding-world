<?php

namespace App\Policies;

use App\Models\Submission;
use App\Models\User;

class SubmissionPolicy
{
    public function view(User $user, Submission $submission): bool
    {
        if ($user->isStudent()) {
            return $submission->student_id === $user->id;
        }

        return $submission->task && $submission->task->teacher_id === $user->id;
    }

    public function grade(User $user, Submission $submission): bool
    {
        return $user->isTeacher() && $submission->task && $submission->task->teacher_id === $user->id;
    }
}
