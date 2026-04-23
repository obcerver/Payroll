<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use Illuminate\Database\Seeder;

class PayrollSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 5 Departments
        $departments = Department::factory()->count(5)->create();

        // Create 100 Employees and assign them to random departments
        Employee::factory()->count(100)->create([
            'department_id' => function () use ($departments) {
                return $departments->random()->id;
            }
        ]);
    }
}
