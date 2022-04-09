const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(7000, () => {
      console.log("Server is Running on http://localhost:7000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
  }
};

initializeDBAndServer();

//API 1
app.get("/players/", async (request, response) => {
  const playersDetailsQuery = `
     SELECT 
     player_id AS playerId,
     player_name  AS playerName
     FROM player_details
     ORDER BY playerId`;
  const playerDetails = await db.all(playersDetailsQuery);
  response.send(playerDetails);
});

// API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSpecificPlayer = `
    SELECT 
    player_id AS playerId,
     player_name  AS playerName
    FROM player_details
    WHERE player_id = ${playerId};`;
  const playerDetails = await db.get(getSpecificPlayer);
  response.send(playerDetails);
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updateDetails = request.body;
  const { playerName } = updateDetails;
  const updatePlayerDetails = `
    UPDATE player_details
    SET player_name = '${playerName}'
    WHERE player_id = ${playerId};`;
  await db.run(updateDetails);
  response.send("Player Details Updated");
});

// API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsQuery = `
     SELECT match_id AS matchId,
     match,year
     FROM match_details
     WHERE match_id = ${matchId}`;
  const matchDetails = await db.get(matchDetailsQuery);
  response.send(matchDetails);
});

//API 5

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchOnPlayerId = `
    SELECT 
    match_details.match_id AS matchId,
    match_details.match AS  match,
    match_details.year AS year
    FROM match_details INNER JOIN player_match_score ON
    match_details.match_id = player_match_score.match_id
    WHERE player_match_score.player_id = ${playerId};`;
  const dbResponse = await db.get(getMatchOnPlayerId);
  response.send(dbResponse);
});

// API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerDetailsOnMatchId = `
    SELECT 
    player_details.player_id AS playerId,
    player_details.player_name  AS playerName
    FROM player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_match_score.match_id =${matchId};`;
  const player = await db.get(getPlayerDetailsOnMatchId);
  response.send(player);
});

// API 7
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScore = `
    SELECT 
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    player_match_score.score AS totalScore,
    player_match_score.fours AS totalFours,
    player_match_score.sixes AS totalSixes
    FROM player_details INNER JOIN player_match_score ON 
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`;
  const playerScore = await db.get(getPlayerScore);
  response.send(playerScore);
});

module.exports = app;
