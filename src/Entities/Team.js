const Entity = require(__dirname + '/Entity');

class Team extends Entity {

    getTeamNumber() {
        return this.getValue('m_iTeamNum');
    }

    getSide() {
        return (this.getValue('m_szTeamname') || '').toUpperCase();
    }

    getClanName() {
        return this.getValue('m_szClanTeamname');
    }

    getFlag() {
        return this.getValue('m_szTeamFlagImage');
    }

    getScore() {
        return this.getValue('m_scoreTotal') || 0;
    }

    getScoreFirstHalf() {
        return this.getValue('m_scoreFirstHalf') || 0;
    }

    getScoreSecondHalf() {
        return this.getValue('m_scoreSecondHalf') || 0;
    }

    getPlayers() {
        const d = this.getValue('"player_array"') || {};
        const players = [];
        for (const k in d) {
            players.push(this.demo.findEntityById(d[k]));
        }
        return players;
    }
}

module.exports = Team;