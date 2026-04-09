import { getRank } from "../ranking.js";

function getDashboardStats() {
    const results = JSON.parse(localStorage.getItem("sudoku-results") || "[]");

    const totalGames = results.length;
    const wins = results.filter((game) => game.won).length;
    const losses = totalGames - wins;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    const winningGames = results.filter((game) => game.won);
    const bestTime =
        winningGames.length > 0
            ? Math.min(...winningGames.map((game) => game.elapsed))
            : null;

    const averageTime =
        winningGames.length > 0
            ? Math.round(
                winningGames.reduce((sum, game) => sum + game.elapsed, 0) /
                winningGames.length
            )
            : null;

    const gamesWithAccuracy = results.filter(
        (game) =>
            typeof game.moves === "number" &&
            typeof game.mistakes === "number" &&
            game.moves > 0
    );

    const averageAccuracy =
        gamesWithAccuracy.length > 0
            ? Math.round(
                gamesWithAccuracy.reduce((sum, game) => {
                    const accuracy = ((game.moves - game.mistakes) / game.moves) * 100;
                    return sum + accuracy;
                }, 0) / gamesWithAccuracy.length
            )
            : null;

    const lastGame =
        gamesWithAccuracy.length > 0
            ? gamesWithAccuracy[gamesWithAccuracy.length - 1]
            : null;

    const lastGameAccuracy =
        lastGame && lastGame.moves > 0
            ? Math.round(((lastGame.moves - lastGame.mistakes) / lastGame.moves) * 100)
            : null;

    return {
        totalGames,
        wins,
        losses,
        winRate,
        bestTime,
        averageTime,
        averageAccuracy,
        lastGameAccuracy,
    };
}

export default function ProgressDashboard({ onClose, streak, achievements, xp }) {
    const stats = getDashboardStats();
    const rank = getRank(xp);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px",
                    padding: "20px",
                    color: "var(--text-primary)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: "22px" }}>📊 Progress Dashboard</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            color: "var(--text-primary)",
                            width: "32px",
                            height: "32px",
                            cursor: "pointer",
                            fontSize: "16px",
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                    <p style={{ margin: 0 }}>Total games: <strong>{stats.totalGames}</strong></p>
                    <p style={{ margin: 0 }}>Wins: <strong>{stats.wins}</strong></p>
                    <p style={{ margin: 0 }}>Losses: <strong>{stats.losses}</strong></p>
                    <p style={{ margin: 0 }}>Win rate: <strong>{stats.winRate}%</strong></p>
                    <p style={{ margin: 0 }}>Current streak: <strong>{streak}</strong></p>
                    <p style={{ margin: 0 }}>Achievements: <strong>{achievements.length}</strong></p>
                    <p style={{ margin: 0 }}>Rank: <strong>{rank.name}</strong></p>
                    <p style={{ margin: 0 }}>XP: <strong>{xp}</strong></p>

                    {stats.bestTime !== null && (
                        <p style={{ margin: 0 }}>
                            Best time: <strong>{Math.floor(stats.bestTime / 60)}m {stats.bestTime % 60}s</strong>
                        </p>
                    )}

                    {stats.averageTime !== null && (
                        <p style={{ margin: 0 }}>
                            Average win time: <strong>{Math.floor(stats.averageTime / 60)}m {stats.averageTime % 60}s</strong>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}