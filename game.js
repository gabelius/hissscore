



























// ...existing code...}	autoModeStart();	// e.g., if you have a function to restart the game automatically:	// ...existing code to start auto mode...function startAutoMode() {// New function to start auto mode}	}, 5000);		startAutoMode();		overlay.style.display = "none";	setTimeout(() => {	// Hide overlay after 5 seconds and continue in auto mode:		overlay.style.display = "flex"; // using flex to center content	overlay.innerText = "Game Over";	if (!overlay) return;	const overlay = document.getElementById("gameOverOverlay");function showGameOverOverlay() {}	// ...existing code...	showGameOverOverlay();	// alert("Game Over"); 	// Remove alert box:function onGameOver() {// ...existing code...