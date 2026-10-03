<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        \App\Models\Task::class => \App\Policies\TaskPolicy::class,
        \App\Models\Project::class => \App\Policies\ProjectPolicy::class,
        \App\Models\Submission::class => \App\Policies\SubmissionPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
