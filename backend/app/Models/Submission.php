<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    use HasFactory;

    const STATUS_SUBMITTED = 'submitted';
    const STATUS_GRADED = 'graded';

    protected $fillable = [
        'task_id',
        'project_id',
        'student_id',
        'html_code',
        'css_code',
        'js_code',
        'status',
        'grade',
        'feedback',
        'submitted_at',
        'graded_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'grade' => 'integer',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
