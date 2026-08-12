<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Code de vérification SGRH</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
        .container { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px 20px; text-align: center; }
        .header img { height: 50px; margin-bottom: 10px; }
        .header h1 { color: #ffffff; font-size: 22px; margin: 0; }
        .body { padding: 30px 20px; text-align: center; }
        .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e40af; background: #f1f5f9; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://sgrhromas.netlify.app/logo-sgrh.png" alt="SGRH Logo" />
            <h1>Vérification en deux étapes</h1>
        </div>
        <div class="body">
            <p>Bonjour,</p>
            <p>Utilisez le code suivant pour finaliser votre connexion à <strong>SGRH</strong> :</p>
            <div class="code">{{ $code }}</div>
            <p style="color: #475569; font-size: 14px;">Ce code expire dans <strong>2 minutes</strong>.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} SGRH. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>