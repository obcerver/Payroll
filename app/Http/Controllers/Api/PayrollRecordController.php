<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\PayrollRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

class PayrollRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PayrollRecord::with(['employee.department']);

        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('department_id')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        $records = $query->latest()->get();

        return response()->json($records);
    }

    /**
     * Run payroll for an employee.
     */
    public function runPayroll(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $employees = Employee::all();
        $processedCount = 0;
        $skippedCount = 0;
        $results = [];

        foreach ($employees as $employee) {
            // Check if payroll already exists for this employee/month/year
            $exists = PayrollRecord::where('employee_id', $employee->id)
                ->where('month', $request->month)
                ->where('year', $request->year)
                ->exists();

            if ($exists) {
                $skippedCount++;
                continue;
            }

            // Calculation Logic
            $overtime_pay = $employee->overtime_hours * $employee->hour_rate;
            $gross_pay = $employee->basic_salary + $employee->allowance + $overtime_pay;
            $tax = $gross_pay * 0.08;
            $epf_employee = $gross_pay * 0.11;
            $epf_employer = $gross_pay * 0.13;
            $net_pay = $gross_pay - $tax - $epf_employee;

            $payroll = PayrollRecord::create([
                'employee_id' => $employee->id,
                'month' => $request->month,
                'year' => $request->year,
                'gross_pay' => $gross_pay,
                'overtime_pay' => $overtime_pay,
                'tax' => $tax,
                'epf_employee' => $epf_employee,
                'epf_employer' => $epf_employer,
                'net_pay' => $net_pay,
            ]);

            $results[] = $payroll->load('employee.department');
            $processedCount++;
        }

        return response()->json([
            'message' => "Payroll run completed. Processed: $processedCount, Skipped: $skippedCount",
            'processed_count' => $processedCount,
            'skipped_count' => $skippedCount,
            'data' => $results
        ], 201);
    }

    /**
     * View Payslip details.
     */
    public function show($id)
    {
        $record = PayrollRecord::with(['employee.department'])->find($id);

        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        return response()->json($record);
    }

    /**
     * Export PDF Payslip.
     */
    public function exportPdf($id)
    {
        $record = PayrollRecord::with(['employee.department'])->find($id);

        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $pdf = Pdf::loadView('pdf.payslip', compact('record'));
        
        return $pdf->download('payslip-' . $record->employee->name . '-' . $record->month . '-' . $record->year . '.pdf');
    }

    /**
     * Export CSV Payroll Data.
     */
    public function exportCsv(Request $request)
    {
        $query = PayrollRecord::with(['employee.department']);

        if ($request->has('month')) $query->where('month', $request->month);
        if ($request->has('year')) $query->where('year', $request->year);

        $records = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="payroll-export.csv"',
        ];

        $callback = function() use ($records) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Employee', 'Department', 'Month', 'Year', 'Gross Pay', 'Overtime Pay', 'Tax', 'EPF Employee', 'EPF Employer', 'Net Pay']);

            foreach ($records as $record) {
                fputcsv($file, [
                    $record->id,
                    $record->employee->name,
                    $record->employee->department->name,
                    $record->month,
                    $record->year,
                    $record->gross_pay,
                    $record->overtime_pay,
                    $record->tax,
                    $record->epf_employee,
                    $record->epf_employer,
                    $record->net_pay
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
