const UMSG = require(__dirname + '/../enums/UserMessages');

let Messages = {};
module.exports = Messages;

Messages[UMSG.VGUIMenu] = {
    messages: {
		subkey: {
			messages: {},
			fields: [
				[1, 'name', 'vString'],
				[2, 'str', 'vString']
			]
		}
	},
	fields: [
		[1, 'name', 'vString'],
		[2, 'show', 'varInt32Bool'],
		[3, 'subkeys', 'subkey', null, 'array']
	]
}

Messages[UMSG.Geiger] = {
	fields: [
		[1, 'range', 'varInt32']
	]
}

Messages[UMSG.Train] = {
	fields: [
		[1, 'train', 'varInt32']
	]
}

Messages[UMSG.HudText] = {
	fields: [
		[1, 'text', 'vString']
	]
}

Messages[UMSG.SayText] = {
	fields: [
        [1, 'ent_idx', 'varInt32'],
        [2, 'range', 'vString'],
		[3, 'chat', 'varInt32Bool'],
		[4, 'textallchat', 'varInt32Bool']
	]
}

Messages[UMSG.SayText2] = {
	fields: [
        [1, 'ent_idx', 'varInt32'],
        [2, 'chat', 'varInt32Bool'],
		[3, 'msg_name', 'vString'],
        [4, 'params', 'vString'],
		[5, 'textallchat', 'varInt32Bool']
	]
}

Messages[UMSG.TextMsg] = {
	fields: [
        [1, 'msg_dst', 'varInt32'],
        [2, 'params', 'vString']
	]
}

Messages[UMSG.TextMsg] = {
	fields: [
        [1, 'msg_dst', 'varInt32'],
        [2, 'params', 'vString']
	]
}

/*
message CCSUsrMsg_HudMsg {
	optional int32 channel = 1;
	optional .CMsgVector2D pos = 2;
	optional .CMsgRGBA clr1 = 3;
	optional .CMsgRGBA clr2 = 4;
	optional int32 effect = 5;
	optional float fade_in_time = 6;
	optional float fade_out_time = 7;
	optional float hold_time = 9;
	optional float fx_time = 10;
	optional string text = 11;
}
*/

Messages[UMSG.Shake] = {
	fields: [
        [1, 'command', 'varInt32'],
        [2, 'local_amplitude', 'float'],
        [3, 'frequency', 'float'],
        [4, 'duration', 'float']
	]
}

Messages[UMSG.Fade] = {
	fields: [
        [1, 'duration', 'varInt32'],
        [2, 'hold_time', 'varInt32'],
        [3, 'flags', 'varInt32'],
        [4, 'clr', 'Common/RGBA']
	]
}

/*

message CCSUsrMsg_Rumble {
	optional int32 index = 1;
	optional int32 data = 2;
	optional int32 flags = 3;
}

message CCSUsrMsg_CloseCaption {
	optional uint32 hash = 1;
	optional int32 duration = 2;
	optional bool from_player = 3;
}

message CCSUsrMsg_CloseCaptionDirect {
	optional uint32 hash = 1;
	optional int32 duration = 2;
	optional bool from_player = 3;
}

message CCSUsrMsg_SendAudio {
	optional string radio_sound = 1;
}

message CCSUsrMsg_RawAudio {
	optional int32 pitch = 1;
	optional int32 entidx = 2;
	optional float duration = 3;
	optional string voice_filename = 4;
}

message CCSUsrMsg_VoiceMask {
	message PlayerMask {
		optional int32 game_rules_mask = 1;
		optional int32 ban_masks = 2;
	}

	repeated .CCSUsrMsg_VoiceMask.PlayerMask player_masks = 1;
	optional bool player_mod_enable = 2;
}
*/

Messages[UMSG.Damage] = {
	fields: [
        [1, 'amount', 'varInt32'],
        [2, 'inflictor_world_pos', 'Common/Vector'],
        [3, 'inflictovictim_entindexr_world_pos', 'varInt32']
	]
}

/*
message CCSUsrMsg_RadioText {
	optional int32 msg_dst = 1;
	optional int32 client = 2;
	optional string msg_name = 3;
	repeated string params = 4;
}

message CCSUsrMsg_HintText {
	optional string text = 1;
}

message CCSUsrMsg_KeyHintText {
	repeated string hints = 1;
}

*/

Messages[UMSG.ProcessSpottedEntityUpdate] = {
    messages: {
        spotted_entity_update: {
            fields: [
                [1, 'entity_idx', 'varInt32'],
                [2, 'class_id', 'varInt32'],
                [3, 'origin_x', 'varInt32'],
                [4, 'origin_y', 'varInt32'],
                [5, 'origin_z', 'varInt32'],
                [6, 'angle_y', 'varInt32'],
                [7, 'defuser', 'varInt32Bool'],
                [8, 'player_has_defuser', 'varInt32Bool'],
                [9, 'player_has_c4', 'varInt32Bool']
            ]
        }
    },
	fields: [
        [1, 'new_update', 'varInt32Bool'],
        [2, 'entity_updates', 'spotted_entity_update']
	]
}

/*
Messages[UMSG.SendPlayerItemDrops] = {
	fields: [
        [1, 'entity_updates', '.CEconItemPreviewDataBlock']
	]
}
*/

/*



message CCSUsrMsg_SendPlayerItemFound {
	optional .CEconItemPreviewDataBlock iteminfo = 1;
	optional int32 entindex = 2;
}
*/

Messages[UMSG.ReloadEffect] = {
	fields: [
        [1, 'entidx', 'varInt32'],
        [2, 'actanim', 'varInt32'],
        [3, 'origin_x', 'float'],
        [4, 'origin_y', 'float'],
        [5, 'origin_z', 'float']
	]
}

/*
message CCSUsrMsg_AdjustMoney {
	optional int32 amount = 1;
}

message CCSUsrMsg_ReportHit {
	optional float pos_x = 1;
	optional float pos_y = 2;
	optional float timestamp = 4;
	optional float pos_z = 3;
}

message CCSUsrMsg_KillCam {
	optional int32 obs_mode = 1;
	optional int32 first_target = 2;
	optional int32 second_target = 3;
}

message CCSUsrMsg_DesiredTimescale {
	optional float desired_timescale = 1;
	optional float duration_realtime_sec = 2;
	optional int32 interpolator_type = 3;
	optional float start_blend_time = 4;
}

message CCSUsrMsg_CurrentTimescale {
	optional float cur_timescale = 1;
}

message CCSUsrMsg_AchievementEvent {
	optional int32 achievement = 1;
	optional int32 count = 2;
	optional int32 user_id = 3;
}

message CCSUsrMsg_MatchEndConditions {
	optional int32 fraglimit = 1;
	optional int32 mp_maxrounds = 2;
	optional int32 mp_winlimit = 3;
	optional int32 mp_timelimit = 4;
}
*/

Messages[UMSG.PlayerStatsUpdate] = {
    messages: {
        stat: {
            fields: [
                [1, 'idx', 'varInt32'],
                [2, 'delta', 'varInt32']
            ]
        }
    },
	fields: [
        [1, 'version', 'varInt32'],
        [4, 'stats', 'stat'],
        [5, 'user_id', 'varInt32'],
        [6, 'crc', 'varInt32']
	]
}

/*
message CCSUsrMsg_DisplayInventory {
	optional bool display = 1;
	optional int32 user_id = 2;
}

message CCSUsrMsg_QuestProgress {
	optional uint32 quest_id = 1;
	optional uint32 normal_points = 2;
	optional uint32 bonus_points = 3;
	optional bool is_event_quest = 4;
}

message CCSUsrMsg_ScoreLeaderboardData {
	optional .ScoreLeaderboardData data = 1;
}

message CCSUsrMsg_PlayerDecalDigitalSignature {
	optional .PlayerDecalDigitalSignature data = 1;
}

message CCSUsrMsg_XRankGet {
	optional int32 mode_idx = 1;
	optional int32 controller = 2;
}

message CCSUsrMsg_XRankUpd {
	optional int32 mode_idx = 1;
	optional int32 controller = 2;
	optional int32 ranking = 3;
}

message CCSUsrMsg_CallVoteFailed {
	optional int32 reason = 1;
	optional int32 time = 2;
}
*/

Messages[UMSG.VoteStart] = {
	fields: [
        [1, 'team', 'varInt32'],
        [2, 'ent_idx', 'varInt32'],
        [3, 'vote_type', 'varInt32'],
        [4, 'disp_str', 'vString'],
        [5, 'details_str', 'vString'],
        [6, 'other_team_str', 'vString'],
        [7, 'is_yes_no_vote', 'varInt32Bool']
	]
}

Messages[UMSG.VotePass] = {
	fields: [
        [1, 'team', 'varInt32'],
        [2, 'vote_type', 'varInt32'],
        [3, 'disp_str', 'vString'],
        [4, 'details_str', 'vString']
	]
}

Messages[UMSG.VoteFailed] = {
	fields: [
        [1, 'team', 'varInt32'],
        [4, 'reason', 'varInt32']
	]
}

Messages[UMSG.VoteSetup] = {
	fields: [
        [4, 'potential_issues', 'vString']
	]
}

/*

message CCSUsrMsg_SendLastKillerDamageToClient {
	optional int32 num_hits_given = 1;
	optional int32 damage_given = 2;
	optional int32 num_hits_taken = 3;
	optional int32 damage_taken = 4;
}

*/

Messages[UMSG.ServerRankUpdate] = {
    messages: {
        RankUpdate: {
            fields: [
                [1, 'account_id', 'varInt32'],
                [2, 'rank_old', 'varInt32'],
                [3, 'rank_new', 'varInt32'],
                [4, 'num_wins', 'varInt32'],
                [5, 'rank_change', 'float'],
				[6, 'rank_type_id', 'varInt32']
            ]
        }
    },
	fields: [
        [1, 'rank_update', 'RankUpdate']
	]
}

Messages[UMSG.XpUpdate] = {
	fields: [
        [1, 'data', 'GCMessages/GC2ServerNotifyXPRewarded']
	]
}

/*

message CCSUsrMsg_ItemPickup {
	optional string item = 1;
}

message CCSUsrMsg_ShowMenu {
	optional int32 bits_valid_slots = 1;
	optional int32 display_time = 2;
	optional string menu_string = 3;
}

message CCSUsrMsg_BarTime {
	optional string time = 1;
}

message CCSUsrMsg_AmmoDenied {
	optional int32 ammoIdx = 1;
}

message CCSUsrMsg_MarkAchievement {
	optional string achievement = 1;
}

message CCSUsrMsg_MatchStatsUpdate {
	optional string update = 1;
}

message CCSUsrMsg_ItemDrop {
	optional int64 itemid = 1;
	optional bool death = 2;
}

message CCSUsrMsg_GlowPropTurnOff {
	optional int32 entidx = 1;
}

message CCSUsrMsg_RoundBackupFilenames {
	optional int32 count = 1;
	optional int32 index = 2;
	optional string filename = 3;
	optional string nicename = 4;
}

*/

Messages[UMSG.ResetHud] = {
	fields: [
        [1, 'reset', 'varInt32Bool']
	]
}

/*

message CCSUsrMsg_GameTitle {
	optional int32 dummy = 1;
}

message CCSUsrMsg_RequestState {
	optional int32 dummy = 1;
}

message CCSUsrMsg_StopSpectatorMode {
	optional int32 dummy = 1;
}

message CCSUsrMsg_DisconnectToLobby {
	optional int32 dummy = 1;
}

*/

Messages[UMSG.WarmupHasEnded] = {
	fields: [
        [1, 'dummy', 'varInt32']
	]
}

/*

message CCSUsrMsg_ClientInfo {
	optional int32 dummy = 1;
}

message CCSUsrMsg_ServerRankRevealAll {
	optional int32 seconds_till_shutdown = 1;
}

*/