const Entity = require(__dirname + '/Entity');

class Player extends Entity {

	getName() {
		return this.info.name || 'Unknown';
	}

	isHLTV() {
		return this.info.isHLTV || false;
	}

	isFakePlayer() {
		return this.info.fakePlayer || false;
	}

	getGuid() {
		return this.info.guid || '';
	}

	getUserId() {
		return this.info.userId || null;
	}

	getHealth() {
		return this.getValue('m_iHealth') || 100;
	}

	getTeamNumber () {
		return this.getValue('m_iTeamNum');
	}

	getTeam() {
		
		let teams = this.demo.getTeams();

		for (let team of teams) {
			if (team.getTeamNumber() == this.getValue('m_iTeamNum')) {
				return team;
			}
		}
	}

	getEyeAngle() {
		let angle0 = this.getValue('m_angEyeAngles[0]');
		let angle1 = this.getValue('m_angEyeAngles[1]');
		return {
			pitch: makeAnglePositive(-(angle0 || 0)),
			yaw: makeAnglePositive(angle1 || 0)
		};
	}

	getEyeAngleVector() {
		let angles = this.getEyeAngle();
		return directionToVector(angles.pitch, angles.yaw);
	}

	getAimLine() {
		let position = this.getPosition();
		let angle = this.getEyeAngleVector();
		return new Line3d(position.x, position.y, position.z, angle);
	}

	getAimDistanceTo(player) {
		return this.getAimLine().distanceToPoint(player.getPosition());
	}

	getAimPunchAngle() {
		return this.getValue('localdata.m_Local.m_aimPunchAngle') || {
			x: 0,
			y: 0,
			z: 0
		};
	}

	getPosition() {
		let xy = this.getValue(`${this.latestPositionPath}.m_vecOrigin`);
		let z = this.getValue(`${this.latestPositionPath}.m_vecOrigin[2]`);
		if (xy != null && z !== null) {
			return new Vector3d(xy.x, xy.y, z);
		}
		return new Vector3d();
	}

	getArmorValue() {
		return this.getValue('m_ArmorValue') || 0;
	}

	hasHelmet() {
		return this.getValue('m_bHasHelmet') == 1;
	}

	getCurrentEquipmentValue() {
		return this.getValue('m_unCurrentEquipmentValue') || 0;
	}

	isSpotted() {
		return this.getValue('m_bSpotted') == 1;
	}

	getRoundStartCash() {
		return this.getValue('m_iStartAccount') || 0;
	}

	getCurrentCash() {
		return this.getValue('m_iAccount') || 0;
	}

	getLastPlaceName() {
		return this.getValue('m_szLastPlaceName') || '';
	}

	getRoundKills() {
		return this.getValue('m_iNumRoundKills') || 0;
	}

	getRoundHeadshotKills() {
		return this.getValue('m_iNumRoundKillsHeadshots') || 0;
	}

	isScoped() {
		return this.getValue('m_bIsScoped') == 1;
	}

	isInBuyzone() {
		return this.getValue('m_bInBuyZone') == 1;
	}

	isWalking() {
		return this.getValue('m_bIsWalking') == 1;
	}

	hasDefuser() {
		return this.getValue('m_bHasDefuser') == 1;
	}

	getActiveWeapon() {
		let active = this.getValue('m_hActiveWeapon') & 0x7FF;
		return this.demo.findEntityById(active);
	}

	getWeapons() {
		let weapons = [];
		for (let i = 0; i < 10; i++) {
			let weapon = this.getWeapon(i);
			if (weapon != null) {
			weapons.push(weapon);
			}
		}
		return weapons;
	}

	getWeapon(index) {
		let weaponId = this.getValue(`m_hMyWeapons.00${index}`); // bleh, whatever!
		if (weaponId == null) {
			return null;
		}
		return demo.findEntityById(weaponId & 0x7FF);
	}
}

module.exports = Player;