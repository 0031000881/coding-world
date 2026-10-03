<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    // Teacher: list all students (with optional search)
    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user->isTeacher()) {
            return response()->json(['message' => 'Only teachers can view the student list.'], 403);
        }

        $query = User::where('role', 'student');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $students = $query->withCount([
            'assignedTasks',
            'submissions',
        ])->orderBy('name')->get();

        return response()->json(['students' => $students]);
    }

    // Teacher: view one student's progress (tasks, submissions) - scoped to this teacher's tasks
    public function show(Request $request, User $student)
    {
        $user = $request->user();

        if (! $user->isTeacher() || $student->role !== 'student') {
            return response()->json(['message' => 'Not authorized.'], 403);
        }

        $teacherTaskIds = $user->tasksCreated()->pluck('id');

        $assignedTasks = $student->assignedTasks()
            ->whereIn('tasks.id', $teacherTaskIds)
            ->get();

        $submissions = $student->submissions()
            ->whereIn('task_id', $teacherTaskIds)
            ->with('task:id,title')
            ->latest('submitted_at')
            ->get();

        return response()->json([
            'student' => $student->only('id', 'name', 'email'),
            'assigned_tasks' => $assignedTasks,
            'submissions' => $submissions,
        ]);
    }
}
