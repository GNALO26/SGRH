<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Bienvenue sur SGRH</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
        .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px 20px; text-align: center; }
        .header img { height: 50px; margin-bottom: 10px; }
        .header h1 { color: #ffffff; font-size: 22px; margin: 0; }
        .body { padding: 30px 20px; }
        .info { background: #f1f5f9; border-radius: 8px; padding: 15px; margin: 15px 0; }
        .info p { margin: 5px 0; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://sgrhromas.netlify.app/logo-sgrh.png" alt="SGRH Logo" />
            <h1>Bienvenue sur SGRH</h1>
        </div>
        <div class="body">
            <p>Bonjour <strong>{{ $employee->name }}</strong>,</p>
            <p>Votre compte employé a été créé avec succès. Voici vos identifiants de connexion :</p>
            <div class="info">
                <p><strong>Email :</strong> {{ $employee->email }}</p>
                <p><strong>Mot de passe temporaire :</strong> {{ $password }}</p>
            </div>
            <p>Nous vous invitons à vous connecter et à contacter votre administrateur pour changer votre mot de passe.</p>
            <a href="https://sgrhromas.netlify.app/login" style="display:inline-block; background:#2563eb; color:#fff; padding:12px 25px; border-radius:8px; text-decoration:none; font-weight:bold; margin-top:10px;">Accéder à SGRH</a>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} SGRH. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>