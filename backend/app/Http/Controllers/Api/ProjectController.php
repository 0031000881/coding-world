<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    // Student: list of their own projects
    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user->isStudent()) {
            return response()->json(['message' => 'Only students have personal projects.'], 403);
        }

        $projects = Project::where('student_id', $user->id)
            ->with('task:id,title,difficulty,deadline')
            ->latest('updated_at')
            ->get();

        return response()->json(['projects' => $projects]);
    }

    // Get (or create) the workspace for a given task, for the logged-in student
    public function forTask(Request $request, Task $task)
    {
        $user = $request->user();

        if (! $user->isStudent()) {
            return response()->json(['message' => 'Only students have a coding workspace.'], 403);
        }

        $isAssigned = $task->assignedStudents()->where('users.id', $user->id)->exists();
        if (! $isAssigned) {
            return response()->json(['message' => 'This task is not assigned to you.'], 403);
        }

        $project = Project::firstOrCreate(
            ['task_id' => $task->id, 'student_id' => $user->id],
            [
                'html_code' => "<h1>Hello, Coding World!</h1>\n",
                'css_code' => "h1 {\n  color: #4f46e5;\n  font-family: sans-serif;\n}\n",
                'js_code' => "console.log('Hello from JavaScript!');\n",
            ]
        );

        return response()->json(['project' => $project]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $validator = Validator::make($request->all(), [
            'html_code' => ['nullable', 'string'],
            'css_code' => ['nullable', 'string'],
            'js_code' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $project->update([
            'html_code' => $request->input('html_code', $project->html_code),
            'css_code' => $request->input('css_code', $project->css_code),
            'js_code' => $request->input('js_code', $project->js_code),
            'last_saved_at' => now(),
        ]);

        return response()->json(['message' => 'Project saved successfully.', 'project' => $project]);
    }

    public function show(Request $request, Project $project)
    {
        $this->authorize('view', $project);

        return response()->json(['project' => $project->load('task')]);
    }
}
