<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('instructions');
            $table->text('requirements')->nullable();
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->timestamp('deadline')->nullable();
            $table->timestamps();

            $table->index(['teacher_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
