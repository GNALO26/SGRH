<!DOCTYPE html>
<html>
<head><title>Bienvenue</title></head>
<body>
    <h1>Bienvenue {{ $employee->name }}</h1>
    <p>Votre compte employé a été créé sur la plateforme SGRH.</p>
    <p>Email : {{ $employee->email }}</p>
    <p>Mot de passe temporaire : <strong>{{ $password }}</strong></p>
    <p>Veuillez vous connecter et contacter l'administrateur pour changer votre mot de passe.</p>
</body>
</html>