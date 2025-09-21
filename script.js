<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Swipe Input</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            height: 100vh;
            overflow: hidden;
        }

        .screen {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: opacity 0.3s ease;
        }

        .input-screen {
            background-color: #000;
            color: white;
            opacity: 0;
            pointer-events: none;
        }

        .input-screen.visible {
            opacity: 1;
            pointer-events: all;
        }

        .result-screen {
            background-color: #1a1a1a;
            opacity: 1;
            pointer-events: all;
        }

        .result-screen.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .input-button {
            width: 200px;
            height: 200px;
            border: 3px solid white;
            border-radius: 50%;
            background: transparent;
            color: white;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .input-button:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.05);
        }

        .input-button:active {
            transform: scale(0.95);
        }

        .card-container {
            position: relative;
            width: 300px;
            height: 420px;
            margin: 20px;
        }

        .card {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 15px;
            background: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: bold;
            transition: transform 0.3s ease, opacity 0.3s ease;
            cursor: grab;
        }

        .card:active {
            cursor: grabbing;
        }

        .card.hidden {
            opacity: 0;
            transform: translateX(100%);
        }

        .card.visible {
            opacity: 1;
            transform: translateX(0);
        }

        .card.prev {
            transform: translateX(-100%);
        }

        .card.next {
            transform: translateX(100%);
        }

        .card-suit {
            font-size: 24px;
            margin-top: 10px;
        }

        .spades { color: #000; }
        .hearts { color: #ff0000; }
        .clubs { color: #000; }
        .diamonds { color: #ff0000; }

        .swipe-indicator {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 18px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .swipe-indicator.show {
            opacity: 1;
        }

        .deck-info {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 16px;
        }

        .input-mode-button {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .input-mode-button:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    </style>
</head>
<body>
    <div class="input-screen" id="inputScreen">
        <div class="swipe-indicator" id="swipeIndicator">스와이프 입력 중...</div>
        <button class="input-button" id="inputButton">입력</button>
    </div>

    <div class="result-screen" id="resultScreen">
        <button class="input-mode-button" id="inputModeButton">입력 모드</button>
        <div class="card-container" id="cardContainer">
            <!-- Cards will be dynamically generated -->
        </div>
        <div class="deck-info" id="deckInfo">카드 1 / 52</div>
    </div>

    <script src="script.js"></script>
</body>
</html>
