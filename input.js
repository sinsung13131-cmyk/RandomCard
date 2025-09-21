class CardInputApp {
    constructor() {
        this.inputButton = document.getElementById('inputButton');
        this.swipeIndicator = document.getElementById('swipeIndicator');
        this.swipeSequenceDisplay = document.getElementById('swipeSequence'); // Renamed to avoid conflict
        this.backButton = document.getElementById('backButton');
        
        this.isInputMode = false;
        this.currentSequence = [];
        
        this.setupEventListeners();
        this.resetInput(); // Initialize button visibility
    }

    setupEventListeners() {
        this.inputButton.addEventListener('click', () => this.startInput());
        this.backButton.addEventListener('click', () => this.goToResult());
        
        // Touch events for swipe detection
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Mouse events for desktop testing
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    startInput() {
        this.isInputMode = true;
        this.currentSequence = [];
        this.swipeIndicator.classList.add('show');
        this.inputButton.style.display = 'none'; // Hide input button
        this.updateSwipeDisplay();
    }

    // Touch event handlers
    handleTouchStart(e) {
        if (!this.isInputMode) return;
        e.preventDefault();
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (!this.isInputMode) return;
        e.preventDefault();
    }

    handleTouchEnd(e) {
        if (!this.isInputMode) return;
        e.preventDefault();
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        this.detectSwipe(this.startX, this.startY, endX, endY);
    }

    // Mouse event handlers for desktop testing
    handleMouseDown(e) {
        if (!this.isInputMode) return;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.isMouseDown = true;
    }

    handleMouseMove(e) {
        if (!this.isInputMode || !this.isMouseDown) return;
    }

    handleMouseUp(e) {
        if (!this.isInputMode || !this.isMouseDown) return;
        this.isMouseDown = false;
        this.detectSwipe(this.startX, this.startY, e.clientX, e.clientY);
    }

    detectSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return;
        }
        
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        this.currentSequence.push(direction);
        console.log('Swipe detected:', direction, 'Sequence:', this.currentSequence);
        this.updateSwipeDisplay();
        
        // Check if we have enough swipes for a complete card input
        if (this.currentSequence.length >= 3) {
            this.processCardInput();
        }
    }

    updateSwipeDisplay() {
        const arrows = this.currentSequence.map(dir => {
            switch(dir) {
                case 'up': return '↑';
                case 'right': return '→';
                case 'down': return '↓';
                case 'left': return '←';
                default: return '?';
            }
        }).join(' ');
        
        if (this.swipeSequenceDisplay) {
            this.swipeSequenceDisplay.textContent = `입력: ${arrows}`;
        }
    }

    processCardInput() {
        const card = this.decodeSwipeSequence(this.currentSequence);
        if (card) {
            console.log('Valid card input:', card);
            // Store the result
            localStorage.setItem('selectedCard', JSON.stringify(card));
            this.resetInput(); // Reset input state after successful input
            // this.goToResult(); // Re-enabled automatic redirection
        } else {
            console.log('Invalid input, resetting');
            // Invalid input, reset
            this.resetInput();
        }
    }

    decodeSwipeSequence(sequence) {
        if (sequence.length < 3) return null;

        // Check for special 3-swipe Joker patterns
        const seqStr = sequence.join(' ');
        if (seqStr === 'left right left' || seqStr === 'right left right') {
            return { suit: 'joker', value: 'JOKER' };
        }

        const valueSwipes = sequence.slice(0, 2);
        const suitSwipe = sequence[2];
        
        // Decode card value
        const value = this.decodeValue(valueSwipes);
        if (!value) return null;
        
        // Decode suit
        const suit = this.decodeSuit(suitSwipe);
        if (!suit) return null;
        
        return { suit, value };
    }

    decodeValue(swipes) {
        const [first, second] = swipes;
        
        // Clock face positions: 3=right, 6=down, 9=left, 12=up
        if (first === 'up' && second === 'right') return 'A';      // 1 (Ace)
        if (first === 'right' && second === 'up') return '2';      // 2
        if (first === 'right' && second === 'right') return '3';   // 3
        if (first === 'right' && second === 'down') return '4';    // 4
        if (first === 'down' && second === 'right') return '5';    // 5
        if (first === 'down' && second === 'down') return '6';     // 6
        if (first === 'down' && second === 'left') return '7';     // 7
        if (first === 'left' && second === 'down') return '8';     // 8
        if (first === 'left' && second === 'left') return '9';     // 9
        if (first === 'left' && second === 'up') return '10';      // 10
        if (first === 'up' && second === 'left') return 'J';       // 11 (Jack)
        if (first === 'up' && second === 'up') return 'Q';         // 12 (Queen)
        if (
            (first === 'up' && second === 'down') ||
            (first === 'down' && second === 'up')
        ) return 'K';       // Kings
        if (first === 'right' && second === 'left' && swipes.length === 3) return 'JOKER'; // Joker
        
        return null;
    }

    decodeSuit(swipe) {
        switch (swipe) {
            case 'up': return 'spades';
            case 'right': return 'hearts';
            case 'down': return 'clubs';
            case 'left': return 'diamonds';
            default: return null;
        }
    }

    resetInput() {
        this.isInputMode = false;
        this.currentSequence = [];
        this.swipeIndicator.classList.remove('show');
        this.inputButton.style.display = 'block'; // Show input button
        this.updateSwipeDisplay();
    }

    goToResult() {
        window.location.href = 'result.html';
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CardInputApp();
});



