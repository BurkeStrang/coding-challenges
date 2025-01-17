import { Queue } from '../utils/queue';
import { Stack } from '../utils/stack';
import { OperatorTokens } from './tokens';

export class Postfix {
  /**
   * Input infix string
   *
   * @private
   * @type {string}
   */
  private text: string;

  /**
   * Position of the current token
   *
   * @private
   * @type {number}
   */
  private pos: number = 0;

  /**
   * Final output queue
   *
   * @private
   * @type {Queue<string>}
   */
  private outputQueue: Queue<string>;

  /**
   * Data structure to store the operators
   *
   * @private
   * @type {Stack<string>}
   */
  private operatorStack: Stack<string>;
  private textLength: number;

  /**
   * Number of operators encountered till `this.pos`
   *
   * @private
   * @type {number}
   */
  private operatorCount: number = 0;

  /**
   * Number of operands encountered till `this.pos`
   * @date 9/1/2023 - 1:44:00 PM
   *
   * @private
   * @type {number}
   */
  private numberCount: number = 0;

  constructor(text: string) {
    this.text = text;
    this.textLength = text.length;
    this.outputQueue = new Queue<string>(text.length);
    this.operatorStack = new Stack(text.length);
  }

  public parse(): Queue<string> {
    while (this.pos < this.textLength) {
      const token = this.getCurrentToken();
      switch (token) {
        case ' ':
          this.consumeToken(' ');
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          const numStr = this.parseNumber();
          this.outputQueue.enqueue(numStr);
          break;
        }
        case '^':
        case '*':
        case '+':
        case '-':
        case '/': {
          this.operatorCount++;
          this.parseOperator();
          break;
        }
        case '(': {
          this.operatorStack.push('(');
          this.consumeToken();
          break;
        }
        case ')':
          this.parseRightParenthesis();
          break;
        default:
          throw new Error('Invalid token');
      }
    }

    if (this.operatorCount >= this.numberCount) {
      throw new Error(
        `Invalid operator count:${this.operatorCount}, number count:${this.numberCount}`
      );
    }

    while (this.operatorStack.size() > 0) {
      const operator = this.operatorStack.pop()!;
      if (operator === '(') {
        throw new Error('Invalid open parenthesis');
      }
      this.outputQueue.enqueue(operator);
    }

    return this.outputQueue;
  }

  private parseRightParenthesis() {
    this.consumeToken();

    // Pop all operators from the stack until we encounter a left parenthesis.
    while (this.operatorStack.peek() !== '(') {
      if (this.operatorStack.size() === 0) {
        throw new Error('Mismatched Parenthesis');
      }
      const operator = this.operatorStack.pop()!;
      this.outputQueue.enqueue(operator);
    }

    if (this.operatorStack.peek() !== '(') {
      throw new Error('No left parenthesis found');
    }

    this.operatorStack.pop();
  }

  private parseOperator() {
    const o1 = this.getCurrentToken();
    this.consumeToken();
    const token1 = OperatorTokens.get(o1)!;

    // While there is an operator token, o2, at the top of the stack
    while (this.operatorStack.size() > 0) {
      const o2 = this.operatorStack.peek()!;

      if (o2 === '(') {
        break;
      }

      // If o1 is left-associative and its precedence is less than or equal to that of o2,
      const token2 = OperatorTokens.get(o2)!;
      if (
        token2.precedence > token1.precedence ||
        (token1.precedence === token2.precedence && token1.isLeftAssociative)
      ) {
        const o2 = this.operatorStack.pop()!;
        this.outputQueue.enqueue(o2);
      } else {
        break;
      }
    }

    this.operatorStack.push(o1);
  }

  private parseNumber(): string {
    this.numberCount++;
    let str = '';

    while (this.pos < this.textLength) {
      const token = this.getCurrentToken();
      if (token === ' ' || token === ')') {
        break;
      }
      str += token;
      this.consumeToken();
    }

    return str;
  }

  private consumeToken(token?: string): void {
    if (token) {
      if (this.getCurrentToken() !== token) {
        throw new Error('Invalid token');
      }
    }
    this.pos++;
  }

  private getCurrentToken(): string {
    return this.text[this.pos];
  }
}
