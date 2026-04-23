<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payslip - {{ $record->employee->name }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #eee;
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            color: #3498db;
            text-transform: uppercase;
            font-size: 24px;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-row {
            display: block;
            margin-bottom: 5px;
        }
        .info-label {
            font-weight: bold;
            width: 150px;
            display: inline-block;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .amount {
            text-align: right;
        }
        .total-row {
            font-weight: bold;
            font-size: 1.1em;
            background-color: #f8f9fa;
        }
        .net-pay-box {
            margin-top: 30px;
            background-color: #3498db;
            color: white;
            padding: 20px;
            text-align: right;
            border-radius: 5px;
        }
        .net-pay-box h2 {
            margin: 0;
            font-size: 1.5em;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PAYSLIP</h1>
            <p>{{ date('F Y', mktime(0, 0, 0, $record->month, 10, $record->year)) }}</p>
        </div>

        <div class="info-section">
            <div class="info-row"><span class="info-label">Employee:</span> {{ $record->employee->name }}</div>
            <div class="info-row"><span class="info-label">Position:</span> {{ $record->employee->position }}</div>
            <div class="info-row"><span class="info-label">Department:</span> {{ $record->employee->department->name }}</div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="amount">Amount (RM)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Basic Salary</td>
                    <td class="amount">{{ number_format($record->employee->basic_salary, 2) }}</td>
                </tr>
                <tr>
                    <td>Allowance</td>
                    <td class="amount">{{ number_format($record->employee->allowance, 2) }}</td>
                </tr>
                <tr>
                    <td>Overtime Pay ({{ $record->employee->overtime_hours }} hrs @ RM{{ number_format($record->employee->hour_rate, 2) }}/hr)</td>
                    <td class="amount">{{ number_format($record->overtime_pay, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td>Gross Pay</td>
                    <td class="amount">{{ number_format($record->gross_pay, 2) }}</td>
                </tr>
                <tr>
                    <td>Tax (8%)</td>
                    <td class="amount">- {{ number_format($record->tax, 2) }}</td>
                </tr>
                <tr>
                    <td>EPF Employee (11%)</td>
                    <td class="amount">- {{ number_format($record->epf_employee, 2) }}</td>
                </tr>
                <tr>
                    <td style="color: #777; font-style: italic;">EPF Employer (13%) - Info Only</td>
                    <td class="amount" style="color: #777; font-style: italic;">{{ number_format($record->epf_employer, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div class="net-pay-box">
            <span>NET PAY</span>
            <h2>RM {{ number_format($record->net_pay, 2) }}</h2>
        </div>

        <div class="footer">
            <p>This is a computer-generated payslip and no signature is required.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}</p>
        </div>
    </div>
</body>
</html>
