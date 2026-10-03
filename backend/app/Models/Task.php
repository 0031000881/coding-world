<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    const DIFFICULTY_BEGINNER = 'beginner';
    const DIFFICULTY_INTERMEDIATE = 'intermediate';
    const DIFFICULTY_ADVANCED = 'advanced';

    protected $fillable = [
        'teacher_id',
        'title',
        'instructions',
        'requirements',
        'difficulty',
        'deadline',
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function assignments()
    {
        return $this->hasMany(TaskAssignment::class);
    }

    public function assignedStudents()
    {
        return $this->belongsToMany(User::class, 'task_assignments', 'task_id', 'student_id')
            ->withTimestamps();
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function isPastDeadline(): bool
    {
        return $this->deadline !== null && now()->greaterThan($this->deadline);
    }
}
