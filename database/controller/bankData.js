// database/controller/bankData.js
const fs = require('fs-extra');
const path = require('path');
const pathData = path.join(__dirname, '../../data/bank.json');

const bankData = {
    get: async (uid) => {
        if (!fs.existsSync(pathData)) fs.writeJsonSync(pathData, {});
        const data = fs.readJsonSync(pathData);
        return data[uid] || { balance: 0, savings: 0, lastInterest: Date.now(), history: [] };
    },
    set: async (uid, content) => {
        if (!fs.existsSync(pathData)) fs.writeJsonSync(pathData, {});
        const data = fs.readJsonSync(pathData);
        data[uid] = content;
        fs.writeJsonSync(pathData, data, { spaces: 2 });
        return true;
    }
};

module.exports = { bankData };
