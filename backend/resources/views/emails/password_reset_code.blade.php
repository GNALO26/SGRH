<!DOCTYPE html>
<html>
<head><title>Réinitialisation de mot de passe - SGRH</title></head>
<body>
    <div style="text-align:center; margin-bottom:20px;">
        <img src="https://sgrhromas.netlify.app/logo-sgrh.png" alt="SGRH" style="height:60px;" />
        <h1>SGRH - Réinitialisation de mot de passe</h1>
    </div>
    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
    <p>Utilisez le code à 6 chiffres suivant :</p>
    <h2 style="background:#f0f0f0;padding:10px;letter-spacing:5px;text-align:center;">{{ $code }}</h2>
    <p>Ce code expire dans 10 minutes.</p>
    <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    <hr />
    <p style="font-size:small;color:#888;">© {{ date('Y') }} SGRH. Tous droits réservés.</p>
</body>
</html>