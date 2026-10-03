<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    // Teacher: list tasks they created
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isTeacher()) {
            $tasks = Task::where('teacher_id', $user->id)
                ->withCount(['assignedStudents', 'submissions'])
                ->latest()
                ->get();
        } else {
            // Student: tasks assigned to them
            $tasks = $user->assignedTasks()
                ->with('teacher:id,name')
                ->latest('tasks.created_at')
                ->get();
        }

        return response()->json(['tasks' => $tasks]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->isTeacher()) {
            return response()->json(['message' => 'Only teachers can create tasks.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'instructions' => ['required', 'string'],
            'requirements' => ['nullable', 'string'],
            'difficulty' => ['required', 'in:beginner,intermediate,advanced'],
            'deadline' => ['nullable', 'date'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'exists:users,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $task = Task::create([
            'teacher_id' => $user->id,
            'title' => $request->title,
            'instructions' => $request->instructions,
            'requirements' => $request->requirements,
            'difficulty' => $request->difficulty,
            'deadline' => $request->deadline,
        ]);

        if ($request->filled('student_ids')) {
            $studentIds = User::whereIn('id', $request->student_ids)
                ->where('role', 'student')
                ->pluck('id');
            $task->assignedStudents()->sync($studentIds);
        }

        return response()->json([
            'message' => 'Task created successfully.',
            'task' => $task->load('assignedStudents:id,name,email'),
        ], 201);
    }

    public function show(Request $request, Task $task)
    {
        $this->authorize('view', $task);

        $task->load(['teacher:id,name', 'assignedStudents:id,name,email']);

        $user = $request->user();
        if ($user->isStudent()) {
            $project = $task->projects()->where('student_id', $user->id)->first();
            $submission = $task->submissions()->where('student_id', $user->id)->latest()->first();
            $task->setAttribute('my_project', $project);
            $task->setAttribute('my_submission', $submission);
        }

        return response()->json(['task' => $task]);
    }

    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $validator = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'instructions' => ['sometimes', 'required', 'string'],
            'requirements' => ['nullable', 'string'],
            'difficulty' => ['sometimes', 'required', 'in:beginner,intermediate,advanced'],
            'deadline' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $task->update($validator->validated());

        return response()->json(['message' => 'Task updated successfully.', 'task' => $task]);
    }

    public function destroy(Request $request, Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully.']);
    }

    public function assign(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $validator = Validator::make($request->all(), [
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'exists:users,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $studentIds = User::whereIn('id', $request->student_ids)
            ->where('role', 'student')
            ->pluck('id');

        $task->assignedStudents()->syncWithoutDetaching($studentIds);

        return response()->json([
            'message' => 'Task assigned successfully.',
            'task' => $task->load('assignedStudents:id,name,email'),
        ]);
    }

    public function unassign(Request $request, Task $task, User $student)
    {
        $this->authorize('update', $task);

        $task->assignedStudents()->detach($student->id);

        return response()->json(['message' => 'Student unassigned from task.']);
    }
}
