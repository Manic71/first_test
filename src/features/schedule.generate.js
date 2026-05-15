import { timeToMin, minToTime } from "../utils/time.js";

// MVP: Round Robin pro Altersklasse, dann Slots/Felder verteilen
export function generateSchedule(state) {
  const t = state.tournament;

  const startMin = timeToMin(t.startTime);
  const endMin = timeToMin(t.endTime);
  const slotMin = Number(t.gameDurationMin) + Number(t.breakMin);

  const fields = t.fields || ["A"];
  const ageGroups = t.ageGroups || [];

  // Teams je Altersklasse aufbauen (verein + suffix)
  const teamsPerAg = {};
  for (const ag of ageGroups) {
    teamsPerAg[ag] = [];
    for (const club of state.clubs) {
      const cnt = Number(club.teams?.[ag] ?? 0);
      for (let i = 0; i < cnt; i++) {
        const suffix = cnt > 1 ? ([" I"," II"," III"," IV"][i] ?? ` ${i+1}`) : "";
        teamsPerAg[ag].push({
          id: `${club.id}-${ag}-${i+1}`,
          clubId: club.id,
          name: `${club.name}${suffix}`,
        });
      }
    }
  }

  const activeAgs = ageGroups.filter(ag => (teamsPerAg[ag]?.length ?? 0) >= 2);
  const byAgeGroup = {};

  // Pairings
  for (const ag of activeAgs) {
    const games = buildRoundRobin(teamsPerAg[ag]).map((g, idx) => ({
      id: `${ag}-g${idx+1}`,
      ageGroup: ag,
      home: g.home,
      away: g.away,
      time: null,
      timeMin: null,
      field: null,
      status: "planned",
      result: null,
    }));
    byAgeGroup[ag] = games;
  }

  // Flatten und Zeiten/Felder verteilen
  const allGames = activeAgs.flatMap(ag => byAgeGroup[ag]);
  assignTimesAndFields(allGames, fields, startMin, endMin, slotMin);

  return { byAgeGroup };
}

function buildRoundRobin(teams) {
  const list = [...teams];
  if (list.length % 2 !== 0) list.push({ id: "bye", name: "Freilos", clubId: null });

  const n = list.length;
  const rounds = n - 1;
  const out = [];

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < n / 2; i++) {
      const home = list[i];
      const away = list[n - 1 - i];
      if (home.clubId && away.clubId) out.push({ round: r + 1, home: home.name, away: away.name });
    }
    // Rotation (circle method)
    list.splice(1, 0, list.pop());
  }

  return out;
}

function assignTimesAndFields(allGames, fields, startMin, endMin, slotMin) {
  const fieldFree = new Array(fields.length).fill(0); // min offset

  for (const g of allGames) {
    const minFree = Math.min(...fieldFree);
    const fieldIdx = fieldFree.indexOf(minFree);
    const absTime = startMin + minFree;

    g.field = fields[fieldIdx];
    g.timeMin = absTime;
    g.time = minToTime(absTime);

    fieldFree[fieldIdx] = minFree + slotMin;
  }

  // Optional warn if overflow
  const last = allGames[allGames.length - 1];
  if (last && last.timeMin + slotMin > endMin) {
    console.warn("Nicht alle Spiele passen in die Zeit.");
  }
}