<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::create([
            'name' => 'Grace Hopper',
            'email' => 'teacher@codingworld.test',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);

        $students = collect(['Ada Lovelace', 'Alan Turing', 'Margaret Hamilton'])->map(function ($name) {
            return User::create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)).'@codingworld.test',
                'password' => Hash::make('password'),
                'role' => 'student',
            ]);
        });

        $task = Task::create([
            'teacher_id' => $teacher->id,
            'title' => 'Build a Profile Card',
            'instructions' => "Create a simple profile card using HTML and CSS.\nAdd a button that changes the greeting text when clicked using JavaScript.",
            'requirements' => "- Must include a heading and an image placeholder\n- Must use at least one CSS class\n- Button must update the DOM via JavaScript",
            'difficulty' => 'beginner',
            'deadline' => now()->addWeek(),
        ]);

        $task->assignedStudents()->sync($students->pluck('id'));
    }
}
