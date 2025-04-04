const pool = require('./sql'); // Supposons que vous ayez un fichier de configuration DB

exports.login = async (req, res) => {
    try {
        const { mail, mdp } = req.body;
        const [user] = await pool.query('SELECT id FROM Resident WHERE mail = ? AND mdp = ?', [mail, mdp]);
        
        if (user) {
            req.session.userId = user.id;
            res.json({ success: true });
        } else {
            res.status(401).json({ error: "Identifiants incorrects" });
        }
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.getProfile = (req, res) => {
    res.json({ userId: req.session.userId });
};