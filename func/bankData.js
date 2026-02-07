const fs = require('fs-extra');
const path = require('path');

// Chemin vers le fichier où seront stockées les banques
const pathData = path.join(__dirname, '../data/bank.json');

// Structure par défaut d'un nouveau compte bancaire
const defaultData = {
    balance: 0,
    savings: 0,
    lastInterest: Date.now(),
    stocks: {},
    crypto: {},
    loans: [],
    history: [],
    realEstate: [],
    businesses: [],
    insurance: { life: false, property: false, health: false },
    level: 1,
    experience: 0,
    creditScore: 600,
    lastDaily: 0
};

module.exports = {
    /**
     * Récupère les données bancaires d'un utilisateur
     */
    get: async function (uid) {
        try {
            if (!fs.existsSync(pathData)) {
                fs.writeJsonSync(pathData, {});
            }
            const data = fs.readJsonSync(pathData);
            
            // Si l'utilisateur n'existe pas, on lui crée un compte par défaut
            if (!data[uid]) {
                data[uid] = { ...defaultData };
                fs.writeJsonSync(pathData, data);
            }
            return data[uid];
        } catch (error) {
            console.error("Erreur bankData get:", error);
            return { ...defaultData };
        }
    },

    /**
     * Enregistre les données bancaires d'un utilisateur
     */
    set: async function (uid, updatedData) {
        try {
            if (!fs.existsSync(pathData)) {
                fs.writeJsonSync(pathData, {});
            }
            const data = fs.readJsonSync(pathData);
            
            // On fusionne les anciennes données avec les nouvelles
            data[uid] = updatedData;
            
            fs.writeJsonSync(pathData, data, { spaces: 2 });
            return true;
        } catch (error) {
            console.error("Erreur bankData set:", error);
            return false;
        }
    }
};
