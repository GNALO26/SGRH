<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Historique des présences</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; }
        .header { position: relative; margin-bottom: 30px; }
        .header img.left { position: absolute; top: 0; left: 0; height: 50px; }
        .header img.right { position: absolute; top: 0; right: 0; height: 50px; }
        .header h2 { text-align: center; margin: 0; padding-top: 15px; }
        .header .employee { text-align: center; font-size: 12px; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 70px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    @php
        function traduireStatut($status) {
            return match($status) {
                'on_time' => "À l'heure",
                'late' => 'Retard',
                'major_late' => 'Grand retard',
                'authorized' => 'Autorisé',
                default => $status,
            };
        }
        $logoPath = realpath(public_path('logo-sgrh.png'));
    @endphp

    <div class="header">
        @if($logoPath)
            <img src="{{ $logoPath }}" class="left" alt="Logo">
            <img src="{{ $logoPath }}" class="right" alt="Logo">
        @else
            <p style="color:red;">Logo introuvable</p>
        @endif
        <h2>SGRH Historique des présences</h2>
        @if(!empty($employeeName))
            <div class="employee">Employé : <strong>{{ $employeeName }}</strong></div>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Heure d'arrivée</th>
                <th>Statut</th>
                <th>Retard (min)</th>
                <th>Justifié</th>
            </tr>
        </thead>
        <tbody>
            @foreach($attendances as $a)
            <tr>
                <td>{{ is_string($a->date) ? $a->date : $a->date->format('d/m/Y') }}</td>
                <td>{{ $a->check_in_time }}</td>
                <td>{{ traduireStatut($a->status) }}</td>
                <td>{{ $a->late_minutes ?? 0 }}</td>
                <td>{{ $a->is_justified ? 'Oui' : 'Non' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>