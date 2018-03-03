let Messages = {};
module.exports = Messages;

Messages.XpProgressData = {
    fields: [
        [1, 'xp_points', 'int32'],
        [2, 'xp_category', 'varInt32']
    ]
}

Messages.GC2ServerNotifyXPRewarded = {
    fields: [
        [1, 'xp_progress_data', 'GCMessages/XpProgressData'],
        [2, 'account_id', 'int32'],
        [3, 'current_xp', 'int32'],
        [4, 'current_level', 'int32'],
        [5, 'upgraded_defidx', 'int32'],
        [6, 'operation_points_awarded', 'int32']
    ]
};