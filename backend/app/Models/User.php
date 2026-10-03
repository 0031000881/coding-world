<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_STUDENT = 'student';
    const ROLE_TEACHER = 'teacher';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function isTeacher(): bool
    {
        return $this->role === self::ROLE_TEACHER;
    }

    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

    // Tasks this user created (only meaningful for teachers)
    public function tasksCreated()
    {
        return $this->hasMany(Task::class, 'teacher_id');
    }

    // Tasks assigned to this user (only meaningful for students)
    public function assignedTasks()
    {
        return $this->belongsToMany(Task::class, 'task_assignments', 'student_id', 'task_id')
            ->withPivot('id')
            ->withTimestamps();
    }

    public function projects()
    {
        return $this->hasMany(Project::class, 'student_id');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'student_id');
    }
}
