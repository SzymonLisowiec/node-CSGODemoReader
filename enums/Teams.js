let teams = {
    NONE: 0,
    SPECTATOR: 1,
    TERRORIST: 2,
    CT: 3
};

module.exports = Object.freeze(Object.assign(teams, Object.entries(teams).map(([a,b]) => (a))));