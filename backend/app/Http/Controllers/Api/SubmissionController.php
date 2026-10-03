<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubmissionController extends Controller
{
    // Student: submit a project for grading
    public function store(Request $request, Project $project)
    {
        $user = $request->user();

        if (! $user->isStudent() || $project->student_id !== $user->id) {
            return response()->json(['message' => 'You can only submit your own projects.'], 403);
        }

        $submission = Submission::create([
            'task_id' => $project->task_id,
            'project_id' => $project->id,
            'student_id' => $user->id,
            'html_code' => $project->html_code,
            'css_code' => $project->css_code,
            'js_code' => $project->js_code,
            'status' => Submission::STATUS_SUBMITTED,
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Task submitted successfully.',
            'submission' => $submission,
        ], 201);
    }

    // List submissions: student sees their own, teacher sees submissions for their tasks
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isStudent()) {
            $submissions = Submission::where('student_id', $user->id)
                ->with('task:id,title,difficulty')
                ->latest('submitted_at')
                ->get();
        } else {
            $taskIds = $user->tasksCreated()->pluck('id');
            $submissions = Submission::whereIn('task_id', $taskIds)
                ->with(['task:id,title,difficulty', 'student:id,name,email'])
                ->latest('submitted_at')
                ->get();
        }

        return response()->json(['submissions' => $submissions]);
    }

    public function show(Request $request, Submission $submission)
    {
        $this->authorize('view', $submission);

        $submission->load(['task', 'student:id,name,email']);

        return response()->json(['submission' => $submission]);
    }

    // Teacher: grade + give feedback
    public function grade(Request $request, Submission $submission)
    {
        $this->authorize('grade', $submission);

        $validator = Validator::make($request->all(), [
            'grade' => ['required', 'integer', 'min:0', 'max:100'],
            'feedback' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $submission->update([
            'grade' => $request->grade,
            'feedback' => $request->feedback,
            'status' => Submission::STATUS_GRADED,
            'graded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Submission graded successfully.',
            'submission' => $submission,
        ]);
    }
}
