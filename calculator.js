class Calculator {
      constructor() {
        this.display = document.getElementById('display');
        this.history = document.getElementById('history');
        this.error = document.getElementById('error');
        this.loading = document.getElementById('loading');
        this.modeToggle = document.getElementById('modeToggle');
        this.calculator = document.getElementById('calculator');
        this.buttons = document.getElementById('buttons');

        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
        this.isScientific = false;
        this.historyStack = [];

        this.init();
      }

      init() {
        this.updateDisplay();
        this.bindEvents();
        this.animateButtons();
      }

      animateButtons() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach((button, index) => {
          button.style.opacity = '0';
          button.style.transform = 'translateY(20px)';
          setTimeout(() => {
            button.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
          }, 100 * index);
        });
      }

      bindEvents() {
        this.buttons.addEventListener('click', this.handleButtonClick.bind(this));
        this.modeToggle.addEventListener('click', this.toggleMode.bind(this));
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
      }

      handleButtonClick(e) {
        if (!e.target.matches('button')) return;

        this.addRippleEffect(e.target);
        const value = e.target.dataset.value;

        if (!value) return;

        this.processInput(value);
      }

      addRippleEffect(button) {
        button.classList.add('ripple');
        setTimeout(() => button.classList.remove('ripple'), 600);
      }

      processInput(value) {
        this.clearError();

        if (/\d/.test(value)) {
          this.inputNumber(value);
        } else if (value === '.') {
          this.inputDecimal();
        } else if (['+', '-', '*', '/'].includes(value)) {
          this.inputOperator(value);
        } else if (value === '=') {
          this.calculate();
        } else if (value === 'AC') {
          this.clear();
        } else if (value === '±') {
          this.toggleSign();
        } else if (value === '%') {
          this.percentage();
        } else {
          this.handleScientificFunction(value);
        }

        this.updateDisplay();
      }

      inputNumber(num) {
        if (this.waitingForOperand) {
          this.currentInput = num;
          this.waitingForOperand = false;
        } else {
          this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
      }

      inputDecimal() {
        if (this.waitingForOperand) {
          this.currentInput = '0.';
          this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
          this.currentInput += '.';
        }
      }

      inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === '') {
          this.previousInput = inputValue;
        } else if (this.operator) {
          const currentValue = this.previousInput || 0;
          const newValue = this.performCalculation(currentValue, inputValue, this.operator);

          this.currentInput = `${parseFloat(newValue.toFixed(7))}`;
          this.previousInput = newValue;
        }

        this.waitingForOperand = true;
        this.operator = nextOperator;

        this.updateHistory(`${this.previousInput} ${this.getOperatorSymbol(nextOperator)}`);
      }

      calculate() {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput !== '' && this.operator) {
          const newValue = this.performCalculation(this.previousInput, inputValue, this.operator);
          const expression = `${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${inputValue} = ${newValue}`;

          this.historyStack.push(expression);
          this.updateHistory(expression);

          this.currentInput = `${parseFloat(newValue.toFixed(7))}`;
          this.previousInput = '';
          this.operator = '';
          this.waitingForOperand = true;
        }
      }

      performCalculation(firstOperand, secondOperand, operator) {
        switch (operator) {
          case '+':
            return firstOperand + secondOperand;
          case '-':
            return firstOperand - secondOperand;
          case '*':
            return firstOperand * secondOperand;
          case '/':
            if (secondOperand === 0) {
              this.showError('Cannot divide by zero');
              return firstOperand;
            }
            return firstOperand / secondOperand;
          default:
            return secondOperand;
        }
      }

      clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
        this.clearError();
        this.history.textContent = '';
      }

      toggleSign() {
        if (this.currentInput !== '0') {
          this.currentInput = this.currentInput.charAt(0) === '-'
            ? this.currentInput.slice(1)
            : '-' + this.currentInput;
        }
      }

      percentage() {
        this.currentInput = (parseFloat(this.currentInput) / 100).toString();
      }

      handleScientificFunction(func) {
        const value = parseFloat(this.currentInput);
        let result;

        switch (func) {
          case 'sin':
            result = Math.sin(value * Math.PI / 180);
            break;
          case 'cos':
            result = Math.cos(value * Math.PI / 180);
            break;
          case 'tan':
            result = Math.tan(value * Math.PI / 180);
            break;
          case 'ln':
            result = Math.log(value);
            break;
          case 'log':
            result = Math.log10(value);
            break;
          case 'sqrt':
            result = Math.sqrt(value);
            break;
          case 'x²':
            result = value * value;
            break;
          case 'π':
            this.currentInput = Math.PI.toString();
            return;
          case 'e':
            this.currentInput = Math.E.toString();
            return;
          default:
            return;
        }

        this.currentInput = result.toString();
      }

      toggleMode() {
        this.isScientific = !this.isScientific;
        this.modeToggle.textContent = this.isScientific ? 'Basic' : 'Scientific';

        if (this.isScientific) {
          this.calculator.classList.add('scientific');
          this.addScientificButtons();
        } else {
          this.calculator.classList.remove('scientific');
          this.removeScientificButtons();
        }

        this.animateButtons();
      }

      addScientificButtons() {
        const scientificButtons = `
          <button class="function" data-value="sin">sin</button>
          <button class="function" data-value="cos">cos</button>
          <button class="function" data-value="tan">tan</button>
          <button class="function" data-value="ln">ln</button>
          <button class="function" data-value="log">log</button>
          <button class="function" data-value="sqrt">√</button>
          <button class="function" data-value="x²">x²</button>
          <button class="function" data-value="π">π</button>
          <button class="function" data-value="e">e</button>
        `;

        this.buttons.insertAdjacentHTML('afterbegin', scientificButtons);
      }

      removeScientificButtons() {
        const scientificBtns = this.buttons.querySelectorAll('[data-value="sin"], [data-value="cos"], [data-value="tan"], [data-value="ln"], [data-value="log"], [data-value="sqrt"], [data-value="x²"], [data-value="π"], [data-value="e"]');
        scientificBtns.forEach(btn => btn.remove());
      }

      handleKeyPress(e) {
        if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
          this.processInput(e.key);
        } else if (['+', '-', '*', '/'].includes(e.key)) {
          this.processInput(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
          this.processInput('=');
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
          this.processInput('AC');
        } else if (e.key === 'Backspace') {
          this.backspace();
        }

        e.preventDefault();
      }

      backspace() {
        if (this.currentInput.length > 1) {
          this.currentInput = this.currentInput.slice(0, -1);
        } else {
          this.currentInput = '0';
        }
        this.updateDisplay();
      }

      updateDisplay() {
        this.display.textContent = this.formatNumber(this.currentInput);
      }

      updateHistory(text) {
        this.history.textContent = text;
      }

      formatNumber(num) {
        if (num.length > 12) {
          return parseFloat(num).toExponential(6);
        }
        return num;
      }

      getOperatorSymbol(op) {
        const symbols = {
          '+': '+',
          '-': '−',
          '*': '×',
          '/': '÷'
        };
        return symbols[op] || op;
      }

      showError(message) {
        this.error.textContent = message;
        this.error.style.animation = 'none';
        setTimeout(() => this.error.style.animation = 'shake 0.5s ease-in-out', 10);
        setTimeout(() => this.clearError(), 3000);
      }

      clearError() {
        this.error.textContent = '';
      }
    }

    
    document.addEventListener('DOMContentLoaded', () => {
      new Calculator();
    });