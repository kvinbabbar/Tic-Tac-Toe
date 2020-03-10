import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  modalRef: BsModalRef;
  config = {
    ignoreBackdropClick: true,
    keyboard: false
  }
  lastWinner: string = '';
  lockBoard: boolean = false;
  isDraw: boolean = false;
  gameOver: boolean = false;
  whoseTurn: string = "user";
  players = {
    user: {
      name: 'user',
      symbol: 'x',
    },
    computer: {
      name: 'computer',
      symbol: 'o',
    }
  }
  scoreboard = {
    user: null,
    computer: null,
    draw: null
  }
  constructor(private modalService: BsModalService) { }
  squares: any[];
  ngOnInit() {
    this.newGame(this.whoseTurn);
    this.scoreboard.user = Number(localStorage.getItem('users-score')) || 0;
    this.scoreboard.computer = Number(localStorage.getItem('computers-score')) || 0;
    this.scoreboard.draw = Number(localStorage.getItem('draw-score')) || 0;
  }

  newGame(turn): void {
    this.squares = [
      { value: '', locked: false, checkedBy: "", winner: false }, { value: '', locked: false, checkedBy: "", winner: false }, { value: '', locked: false, checkedBy: "", winner: false },
      { value: '', locked: false, checkedBy: "", winner: false }, { value: '', locked: false, checkedBy: "", winner: false }, { value: '', locked: false, checkedBy: "", winner: false },
      { value: '', locked: false, checkedBy: "", winner: false }, { value: '', locked: false, checkedBy: "", winner: false }, { value: '', locked: false, checkedBy: "", winner: false }
    ];
    this.isDraw = false;
    this.lockBoard = false;
    this.gameOver = false;
    if (turn == "computer") {
      this.computersTurn();
    }
  }

  clickSquare(square) {
    if (this.players.user.symbol == 'x') {
      square.value = 'fa fa-times';
    } else {
      square.value = 'fa fa-circle';
    }
    square.checkedBy = 'user';
    square.locked = true;
    const winner = this.checkWin(this.players.user);
    if (winner) {
      this.lockBoard = true;
      this.lastWinner = this.players.user.name;
      let currentScore = ++this.scoreboard.user;
      console.log(currentScore);
      localStorage.setItem('users-score', `${currentScore}`);
      this.gameOver = true;
    } else {
      this.whoseTurn = "computer"
      this.computersTurn();
    }
  }

  computersTurn() {
    this.lockBoard = true;
    const emptySquares = this.checkEmptySquares();
    // console.log(emptySquares);
    if (emptySquares.length !== 0) {
      const randomSquare = Math.floor(this.randomNumber(0, emptySquares.length));
      // console.log(randomSquare);
      setTimeout(() => {
        if (this.players.computer.symbol == 'x') {
          emptySquares[randomSquare].value = "fa fa-times";
        } else {
          emptySquares[randomSquare].value = "fa fa-circle";
        }
        emptySquares[randomSquare].checkedBy = "computer";
        emptySquares[randomSquare].locked = true;
        const winner = this.checkWin(this.players.computer);
        if (this.isDraw) {
          this.lockBoard = true;
          this.gameOver = true;
          return;
        }
        if (winner) {
          this.lockBoard = true;
          this.lastWinner = this.players.computer.name;
          this.gameOver = true;
          let currentScore = ++this.scoreboard.computer;
          console.log(currentScore);
          localStorage.setItem('computers-score', `${currentScore}`);
        } else {
          this.whoseTurn = "user";
          this.lockBoard = false;
        }
      }, 300);
    }
  }
  checkEmptySquares() {
    return this.squares.filter(square => {
      return square.value == '';
    });
  }
  randomNumber(min, max) {
    return (Math.random() * (max - min)) + min;
  }
  resetGame() {
    this.newGame(this.whoseTurn);
    localStorage.setItem('users-score', '0');
    localStorage.setItem('computers-score', '0');
    localStorage.setItem('draw-score', '0');
    this.scoreboard.user = Number(localStorage.getItem('users-score'));
    this.scoreboard.computer = Number(localStorage.getItem('computers-score'));
    this.scoreboard.draw = Number(localStorage.getItem('draw-score'));
  }
  checkWin(player) {
    const possibleWinnings = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 4, 8],
      [2, 4, 6],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8]
    ]
    const currentPlayer = player.name;
    const winningIndexs = possibleWinnings.filter(pattern => {
      // console.log(pattern, pattern[0]);
      // console.log(this.squares[pattern[0]])
      return this.squares[pattern[0]].checkedBy == currentPlayer &&
        this.squares[pattern[1]].checkedBy == currentPlayer &&
        this.squares[pattern[2]].checkedBy == currentPlayer;
    });
    // console.log(winningIndexs);
    if (winningIndexs.length > 0) {
      winningIndexs.forEach((pattern) => {
        // console.log(squareIndex, 2);
        pattern.forEach(squareIndex => {
          this.squares[squareIndex].winner = true;
        })
      });
      return true;
    }
    const emptySquares = this.checkEmptySquares();
    if (emptySquares.length == 0) {
      this.isDraw = true;
      let currentScore = ++this.scoreboard.draw;
      console.log(currentScore);
      localStorage.setItem('draw-score', `${currentScore}`);
    }
    return false;
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }
}
