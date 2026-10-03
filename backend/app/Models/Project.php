<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'student_id',
        'html_code',
        'css_code',
        'js_code',
        'last_saved_at',
    ];

    protected $casts = [
        'last_saved_at' => 'datetime',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function latestSubmission()
    {
        return $this->hasOne(Submission::class)->latestOfMany();
    }
}
