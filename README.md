# CS:GO Demo Reader for Node.js
A library for reading CS:GO demo files.

## Examples
```javascript
const DemoReader = require('csgodemoreader').Reader;
const UserMessages = require('csgodemoreader').UserMessages;
const Teams = require('csgodemoreader').Teams;
const fs = require('fs');

let buffer = fs.readFileSync(__dirname + '/../file.dem');
let demo = new DemoReader(buffer);

//Round counter
demo.on('csgo.round_start', _ => {
	console.log('Round ' + demo.getRound());
});

//Listening User Messages
demo.on('umsg.' + UserMessages.WarmupHasEnded, _ => {
	console.log('Warmup has ended');
});

//End of reading demo
demo.on('end', _ => {
	
	let scores = demo.getScores();

	for(let team_number in scores){
		console.log(Teams[team_number] + ': ' + scores[team_number]);
	}

});

//Run reader
demo.run();
```
Output
```
Round 0
Warmup has ended
Round 1
Round 2
Round 3
Round 4
Round 5
Round 6
Round 7
Round 8
Round 9
Round 10
Round 11
Round 12
Round 13
Round 14
Round 15
Round 16
Round 17
Round 18
SPECTATOR: 0
TERRORIST: 16
CT: 2
```

## All possible events
```
//Demo Reader events:
tick
tick_end
server_info
possible_events
user_message
end
event
entity_added
entity_updated
entity_removed

//Game events:
csgo.server_spawn
csgo.server_pre_shutdown
csgo.server_shutdown
csgo.server_cvar
csgo.server_message
csgo.server_addban
csgo.server_removeban
csgo.player_connect
csgo.player_info
csgo.player_disconnect
csgo.player_activate
csgo.player_connect_full
csgo.player_say
csgo.cs_round_start_beep
csgo.cs_round_final_beep
csgo.round_time_warning
csgo.team_info
csgo.team_score
csgo.teamplay_broadcast_audio
csgo.gameui_hidden
csgo.items_gifted
csgo.player_team
csgo.player_class
csgo.player_death
csgo.player_hurt
csgo.player_chat
csgo.player_score
csgo.player_spawn
csgo.player_shoot
csgo.player_use
csgo.player_changename
csgo.player_hintmessage
csgo.game_init
csgo.game_newmap
csgo.game_start
csgo.game_end
csgo.round_start
csgo.round_announce_match_point
csgo.round_announce_final
csgo.round_announce_last_round_half
csgo.round_announce_match_start
csgo.round_announce_warmup
csgo.round_end
csgo.round_end_upload_stats
csgo.round_officially_ended
csgo.ugc_map_info_received
csgo.ugc_map_unsubscribed
csgo.ugc_map_download_error
csgo.ugc_file_download_finished
csgo.ugc_file_download_start
csgo.begin_new_match
csgo.round_start_pre_entity
csgo.teamplay_round_start
csgo.hostname_changed
csgo.difficulty_changed
csgo.finale_start
csgo.game_message
csgo.dm_bonus_weapon_start
csgo.survival_announce_phase
csgo.break_breakable
csgo.break_prop
csgo.player_decal
csgo.entity_killed
csgo.bonus_updated
csgo.player_stats_updated
csgo.achievement_event
csgo.achievement_increment
csgo.achievement_earned
csgo.achievement_write_failed
csgo.physgun_pickup
csgo.flare_ignite_npc
csgo.helicopter_grenade_punt_miss
csgo.user_data_downloaded
csgo.ragdoll_dissolved
csgo.gameinstructor_draw
csgo.gameinstructor_nodraw
csgo.map_transition
csgo.entity_visible
csgo.set_instructor_group_enabled
csgo.instructor_server_hint_create
csgo.instructor_server_hint_stop
csgo.read_game_titledata
csgo.write_game_titledata
csgo.reset_game_titledata
csgo.vote_ended
csgo.vote_started
csgo.vote_changed
csgo.vote_passed
csgo.vote_failed
csgo.vote_cast
csgo.vote_options
csgo.endmatch_mapvote_selecting_map
csgo.endmatch_cmm_start_reveal_items
csgo.inventory_updated
csgo.cart_updated
csgo.store_pricesheet_updated
csgo.gc_connected
csgo.item_schema_initialized
csgo.client_loadout_changed
csgo.add_player_sonar_icon
csgo.add_bullet_hit_marker
csgo.verify_client_hit
csgo.other_death
csgo.item_purchase
csgo.bomb_beginplant
csgo.bomb_abortplant
csgo.bomb_planted
csgo.bomb_defused
csgo.bomb_exploded
csgo.bomb_dropped
csgo.bomb_pickup
csgo.defuser_dropped
csgo.defuser_pickup
csgo.announce_phase_end
csgo.cs_intermission
csgo.bomb_begindefuse
csgo.bomb_abortdefuse
csgo.hostage_follows
csgo.hostage_hurt
csgo.hostage_killed
csgo.hostage_rescued
csgo.hostage_stops_following
csgo.hostage_rescued_all
csgo.hostage_call_for_help
csgo.vip_escaped
csgo.vip_killed
csgo.player_radio
csgo.bomb_beep
csgo.weapon_fire
csgo.weapon_fire_on_empty
csgo.grenade_thrown
csgo.weapon_outofammo
csgo.weapon_reload
csgo.weapon_zoom
csgo.silencer_detach
csgo.inspect_weapon
csgo.weapon_zoom_rifle
csgo.player_spawned
csgo.item_pickup
csgo.item_remove
csgo.ammo_pickup
csgo.item_equip
csgo.enter_buyzone
csgo.exit_buyzone
csgo.buytime_ended
csgo.enter_bombzone
csgo.exit_bombzone
csgo.enter_rescue_zone
csgo.exit_rescue_zone
csgo.silencer_off
csgo.silencer_on
csgo.buymenu_open
csgo.buymenu_close
csgo.round_prestart
csgo.round_poststart
csgo.grenade_bounce
csgo.hegrenade_detonate
csgo.flashbang_detonate
csgo.smokegrenade_detonate
csgo.smokegrenade_expired
csgo.molotov_detonate
csgo.decoy_detonate
csgo.decoy_started
csgo.tagrenade_detonate
csgo.inferno_startburn
csgo.inferno_expire
csgo.inferno_extinguish
csgo.decoy_firing
csgo.bullet_impact
csgo.player_footstep
csgo.player_jump
csgo.player_blind
csgo.player_falldamage
csgo.door_moving
csgo.round_freeze_end
csgo.mb_input_lock_success
csgo.mb_input_lock_cancel
csgo.nav_blocked
csgo.nav_generate
csgo.achievement_info_loaded
csgo.spec_target_updated
csgo.spec_mode_updated
csgo.hltv_changed_mode
csgo.cs_game_disconnected
csgo.cs_win_panel_round
csgo.cs_win_panel_match
csgo.cs_match_end_restart
csgo.cs_pre_restart
csgo.show_freezepanel
csgo.hide_freezepanel
csgo.freezecam_started
csgo.player_avenged_teammate
csgo.achievement_earned_local
csgo.item_found
csgo.repost_xbox_achievements
csgo.match_end_conditions
csgo.round_mvp
csgo.client_disconnect
csgo.gg_player_levelup
csgo.ggtr_player_levelup
csgo.assassination_target_killed
csgo.ggprogressive_player_levelup
csgo.gg_killed_enemy
csgo.gg_final_weapon_achieved
csgo.gg_bonus_grenade_achieved
csgo.switch_team
csgo.gg_leader
csgo.gg_team_leader
csgo.gg_player_impending_upgrade
csgo.write_profile_data
csgo.trial_time_expired
csgo.update_matchmaking_stats
csgo.player_reset_vote
csgo.enable_restart_voting
csgo.sfuievent
csgo.start_vote
csgo.player_given_c4
csgo.gg_reset_round_start_sounds
csgo.tr_player_flashbanged
csgo.tr_mark_complete
csgo.tr_mark_best_time
csgo.tr_exit_hint_trigger
csgo.bot_takeover
csgo.tr_show_finish_msgbox
csgo.tr_show_exit_msgbox
csgo.reset_player_controls
csgo.jointeam_failed
csgo.teamchange_pending
csgo.material_default_complete
csgo.cs_prev_next_spectator
csgo.nextlevel_changed
csgo.seasoncoin_levelup
csgo.tournament_reward
csgo.start_halftime
csgo.hltv_status
csgo.hltv_cameraman
csgo.hltv_rank_camera
csgo.hltv_rank_entity
csgo.hltv_fixed
csgo.hltv_chase
csgo.hltv_message
csgo.hltv_title
csgo.hltv_chat
csgo.hltv_changed_target

//User Messages
umsg.USERMESSAGE_CODE
```

## Enums
You have access to useful enums.
```javascript
const DemoReader = require('csgodemoreader');
const UserMessages = DemoReader.UserMessages;
const WeaponTypes = DemoReader.WeaponTypes;
const Teams = DemoReader.Teams;
```

## DemoReader
### Initialization
```javascript
const DemoReader = require('csgodemoreader').Reader;

let buffer = fs.readFileSync(__dirname + '/demos/file.dem');
let demo = new DemoReader(buffer);
```
### Methods
#### run()
#### getTick()
Returns current tick.
#### getTeams()
Returns array of teams.
#### getPlayers()
Returns array of players.
#### getRound()
Returns current round.
#### getScores()
Returns current scores.
#### getEntities([entityClass])
* entityClass - class being instance of entity which we searching

Returns array of entities.
#### findEntityById(entityId)
Returns array of found entities.

## Player
The Player can be returned while event, which applies to him.
### Methods
#### getName()
#### isHLTV()
#### isFakePlayer()
#### getGuid()
#### getUserId()
#### getHealth()
#### getTeamNumber()
#### getTeam()
#### getEyeAngle()
#### getEyeAngleVector()
#### getAimLine()
#### getAimDistanceTo(player)
#### getAimPunchAngle()
#### getPosition()
#### getArmorValue()
#### hasHelmet()
#### getCurrentEquipmentValue()
#### isSpotted()
#### getRoundStartCash()
#### getCurrentCash()
#### getLastPlaceName()
#### getRoundKills()
#### getRoundHeadshotKills()
#### isScoped()
#### isInBuyzone()
#### isWalking()
#### hasDefuser()
#### getActiveWeapon()
#### getWeapons()
#### getWeapon(index)

## Team
The Team is returned by `Player.getTeam()` and `DemoReader.getTeams()`
### Methods
#### getTeamNumber()
#### getSide()
#### getClanName()
#### getFlag()
#### getScore()
#### getScoreFirstHalf()
#### getScoreSecondHalf()
#### getPlayers()
#### getWeapons()