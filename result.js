class CardResultApp {
    constructor() {
        this.inputModeButton = document.getElementById('inputModeButton');
        this.cardContainer = document.getElementById('cardContainer');
        this.deckInfo = document.getElementById('deckInfo');
        
        this.currentCardIndex = 0;
        this.deck = [];
        this.currentCard = null;
        
        this.init();
    }

    init() {
        this.generateDeck();
        console.log("ResultApp Init: Deck generated", this.deck, "Initial card:", this.currentCard);
        this.setupEventListeners();
        this.checkForNewInput(); // Check for input from input.html first
        console.log("ResultApp Init: After checkForNewInput, currentCard:", this.currentCard);
        this.renderCards(); // Render cards after determining initial card
    }

    generateDeck() {
        const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.deck = [];
        for (let suit of suits) {
            for (let value of values) {
                this.deck.push({ suit, value });
            }
        }
        
        // Add Joker at the end
        this.deck.push({ suit: 'joker', value: 'JOKER' });
        
        // The deck is now in a specific order (not shuffled by default)
        this.currentCard = this.deck[0];
    }

    setupEventListeners() {
        this.inputModeButton.addEventListener('click', () => this.goToInput());
        
        // Listen for localStorage changes from other tabs/windows
        window.addEventListener('storage', (event) => {
            if (event.key === 'selectedCard' && event.newValue !== null) {
                console.log("Storage event detected: selectedCard changed");
                this.checkForNewInput();
                this.renderCards();
            }
        });
        
        // Card swiping in result screen
        this.cardContainer.addEventListener('touchstart', (e) => this.handleCardTouchStart(e), { passive: false });
        this.cardContainer.addEventListener('touchmove', (e) => this.handleCardTouchMove(e), { passive: false });
        this.cardContainer.addEventListener('touchend', (e) => this.handleCardTouchEnd(e), { passive: false });
    }

    checkForNewInput() {
        // Check if there's a new card input from the input screen
        const selectedCardData = localStorage.getItem('selectedCard');
        console.log("checkForNewInput: selectedCardData from localStorage", selectedCardData);
        if (selectedCardData) {
            const card = JSON.parse(selectedCardData);
            console.log("checkForNewInput: Parsed card from localStorage", card);
            this.showSelectedCard(card);
            localStorage.removeItem('selectedCard'); // Clear the stored card after use
            console.log("checkForNewInput: localStorage cleared");
        }
    }

    showSelectedCard(card) {
        console.log("showSelectedCard: Attempting to show card", card);
        // Find the card in the deck and set it as current
        const cardIndex = this.deck.findIndex(c => c.suit === card.suit && c.value === card.value);
        console.log("showSelectedCard: Found cardIndex", cardIndex, "for", card);
        if (cardIndex !== -1) {
            this.currentCardIndex = cardIndex;
            this.currentCard = this.deck[cardIndex];
            console.log("showSelectedCard: currentCard updated to", this.currentCard, "at index", this.currentCardIndex);
        } else {
            console.warn("Input card not found in deck:", card);
        }
    }

    goToInput() {
        window.location.href = 'input.html';
    }

    renderCards() {
        this.cardContainer.innerHTML = '';
        
        // Show current card
        const cardElement = this.createCardElement(this.currentCard);
        cardElement.classList.add('visible');
        this.cardContainer.appendChild(cardElement);
        
        this.updateDeckInfo();
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.suit}`;
        
        let displayValue = card.value;
        if (card.value === 'A') displayValue = 'A';
        else if (card.value === 'J') displayValue = 'J';
        else if (card.value === 'Q') displayValue = 'Q';
        else if (card.value === 'K') displayValue = 'K';
        else if (card.value === 'JOKER') displayValue = 'JOKER';
        
        const suitSymbol = this.getSuitSymbol(card.suit);
        
        if (card.suit === 'joker') {
            cardDiv.innerHTML = `
                <div class="card-corner top-left">
                    <div>JOKER</div>
                </div>
                <div class="card-corner bottom-right">
                    <div>JOKER</div>
                </div>
                <div class="card-center">🃏</div>
            `;
        } else if (card.value === 'A') {
            // Ace - single large symbol in center
            cardDiv.innerHTML = `
                <div class="card-corner top-left">
                    <div>${displayValue}</div>
                    <div class="card-corner-suit">${suitSymbol}</div>
                </div>
                <div class="card-corner bottom-right">
                    <div>${displayValue}</div>
                    <div class="card-corner-suit">${suitSymbol}</div>
                </div>
                <div class="ace-center">${suitSymbol}</div>
            `;
        } else if (['J', 'Q', 'K'].includes(card.value)) {
            // Face cards
            const faceSymbol = this.getFaceCardSymbol(card.value);
            cardDiv.innerHTML = `
                <div class="card-corner top-left">
                    <div>${displayValue}</div>
                    <div class="card-corner-suit">${suitSymbol}</div>
                </div>
                <div class="card-corner bottom-right">
                    <div>${displayValue}</div>
                    <div class="card-corner-suit">${suitSymbol}</div>
                </div>
                <div class="face-card">${faceSymbol}</div>
            `;
        } else {
            // Numbered cards (2-10) with pip patterns
            const pipPattern = this.generatePipPattern(parseInt(card.value), suitSymbol);
            cardDiv.innerHTML = `
                <div class="card-corner top-left">
                    <div>${displayValue}</div>
                    <div class="card-corner-suit">${suitSymbol}</div>
                </div>
                <div class="card-corner bottom-right">
                    <div>${displayValue}</div>
                    <div class="card-corner-suit">${suitSymbol}</div>
                </div>
                <div class="card-pips">${pipPattern}</div>
            `;
        }
        
        return cardDiv;
    }

    getSuitSymbol(suit) {
        switch (suit) {
            case 'spades': return '♠';
            case 'hearts': return '♥';
            case 'clubs': return '♣';
            case 'diamonds': return '♦';
            case 'joker': return '';
            default: return '';
        }
    }

    getFaceCardSymbol(value) {
        switch (value) {
            case 'J': return '♔'; // Jack symbol
            case 'Q': return '♕'; // Queen symbol  
            case 'K': return '♔'; // King symbol
            default: return '';
        }
    }

    generatePipPattern(count, suitSymbol) {
        const patterns = {
            2: [
                [suitSymbol],
                [suitSymbol]
            ],
            3: [
                [suitSymbol],
                [suitSymbol],
                [suitSymbol]
            ],
            4: [
                [suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol]
            ],
            5: [
                [suitSymbol, suitSymbol],
                [suitSymbol],
                [suitSymbol, suitSymbol]
            ],
            6: [
                [suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol]
            ],
            7: [
                [suitSymbol, suitSymbol],
                [suitSymbol],
                [suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol]
            ],
            8: [
                [suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol]
            ],
            9: [
                [suitSymbol, suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol, suitSymbol]
            ],
            10: [
                [suitSymbol, suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol, suitSymbol],
                [suitSymbol, suitSymbol]
            ]
        };

        const pattern = patterns[count] || [];
        return pattern.map(row => 
            `<div class="pip-row">${row.map(suit => `<span class="pip">${suit}</span>`).join('')}</div>`
        ).join('');
    }

    updateDeckInfo() {
        this.deckInfo.textContent = `카드 ${this.currentCardIndex + 1} / ${this.deck.length}`;
    }

    // Card swiping in result screen
    handleCardTouchStart(e) {
        this.cardStartX = e.touches[0].clientX;
        this.cardStartY = e.touches[0].clientY;
        console.log("handleCardTouchStart: StartX", this.cardStartX, "StartY", this.cardStartY);
    }

    handleCardTouchMove(e) {
        // Optional: Add visual feedback during swipe
    }

    handleCardTouchEnd(e) {
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - this.cardStartX;
        const minSwipeDistance = 50;
        console.log("handleCardTouchEnd: EndX", endX, "DeltaX", deltaX);
        
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                console.log("handleCardTouchEnd: Swipe right detected");
                this.previousCard();
            } else {
                console.log("handleCardTouchEnd: Swipe left detected");
                this.nextCard();
            }
        } else {
            console.log("handleCardTouchEnd: Swipe distance too small");
        }
    }

    nextCard() {
        console.log("nextCard: currentCardIndex before", this.currentCardIndex);
        if (this.currentCardIndex < this.deck.length - 1) {
            this.currentCardIndex++;
            this.currentCard = this.deck[this.currentCardIndex];
            console.log("nextCard: currentCard updated to", this.currentCard, "at index", this.currentCardIndex);
            this.renderCards();
        }
         else {
            console.log("nextCard: Already at last card");
        }
    }

    previousCard() {
        console.log("previousCard: currentCardIndex before", this.currentCardIndex);
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.currentCard = this.deck[this.currentCardIndex];
            console.log("previousCard: currentCard updated to", this.currentCard, "at index", this.currentCardIndex);
            this.renderCards();
        }
        else {
            console.log("previousCard: Already at first card");
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CardResultApp();
});

