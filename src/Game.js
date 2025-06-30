import { Chess } from 'chess.js';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { auth } from './firebase';
import { fromRef } from 'rxfire/firestore';
import { getDoc, updateDoc } from 'firebase/firestore';

let gameRef;
let member;

const chess = new Chess();

export let gameSubject;

export async function initGame(gameRefFb) {
  const { currentUser } = auth;

  if (gameRefFb) {
    gameRef = gameRefFb;

    const docSnap = await getDoc(gameRefFb);
    const initialGame = docSnap.data();

    if (!initialGame) {
      return 'notfound';
    }

    const creator = initialGame.members.find(m => m.creator === true);

    if (initialGame.status === 'waiting' && creator.uid !== currentUser.uid) {
      const currUser = {
        uid: currentUser.uid,
        name: localStorage.getItem('userName'),
        piece: creator.piece === 'w' ? 'b' : 'w'
      };
      const updatedMembers = [...initialGame.members, currUser];

      await updateDoc(gameRefFb, {
        members: updatedMembers,
        status: 'ready'
      });
    } else if (!initialGame.members.map(m => m.uid).includes(currentUser.uid)) {
      return 'intruder';
    }

    chess.reset();

    gameSubject = fromRef(gameRefFb).pipe(
      map(snapshot => {
        const game = snapshot.data();
        const { pendingPromotion, gameData, ...restOfGame } = game;

        member = game.members.find(m => m.uid === currentUser.uid);
        const oponent = game.members.find(m => m.uid !== currentUser.uid);

        if (gameData) {
          chess.load(gameData);
        }

        const isGameOver = chess.isGameOver();

        return {
          board: chess.board(),
          pendingPromotion,
          isGameOver,
          position: member.piece,
          member,
          oponent,
          result: isGameOver ? getGameResult() : null,
          ...restOfGame
        };
      })
    );
  } else {
    gameRef = null;
    gameSubject = new BehaviorSubject();
    const savedGame = localStorage.getItem('savedGame');
    if (savedGame) {
      chess.load(savedGame);
    }
    updateGame();
  }
}

export async function resetGame() {
  if (gameRef) {
    await updateGame(null, true);
    chess.reset();
  } else {
    chess.reset();
    updateGame();
  }
}

export function handleMove(from, to) {
  if (from === to) return;

  const promotions = chess.moves({ verbose: true }).filter(m => m.promotion);
  let pendingPromotion;
  if (promotions.some(p => `${p.from}:${p.to}` === `${from}:${to}`)) {
    pendingPromotion = { from, to, color: promotions[0].color };
    updateGame(pendingPromotion);
  }

  if (!pendingPromotion) {
    move(from, to);
  }
}

export function move(from, to, promotion) {
  if (from === to) return;

  let tempMove = { from, to };
  if (promotion) {
    tempMove.promotion = promotion;
  }

  try {
    if (gameRef) {
      if (member.piece === chess.turn()) {
        const legalMove = chess.move(tempMove);
        if (legalMove) {
          updateGame();
        } else {
          alert("Nước đi không hợp lệ!");
        }
      }
    } else {
      const legalMove = chess.move(tempMove);
      if (legalMove) {
        updateGame();
      } else {
        alert("Nước đi không hợp lệ!");
      }
    }
  } catch (error) {
    console.error("Lỗi khi di chuyển:", error);
    alert("Lỗi nước đi: " + error.message);
  }
}

async function updateGame(pendingPromotion, reset) {
  const isGameOver = chess.isGameOver();

  if (gameRef) {
    const updatedData = {
      gameData: chess.fen(),
      pendingPromotion: pendingPromotion || null
    };

    if (reset) {
      updatedData.status = 'over';
    }

    await updateDoc(gameRef, updatedData);
  } else {
    const newGame = {
      board: chess.board(),
      pendingPromotion,
      isGameOver,
      position: chess.turn(),
      result: isGameOver ? getGameResult() : null
    };

    localStorage.setItem('savedGame', chess.fen());
    gameSubject.next(newGame);
  }
}

function getGameResult() {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'BLACK' : 'WHITE';
    return `CHECKMATE - WINNER - ${winner}`;
  } else if (chess.isDraw()) {
    let reason = '50 - MOVES - RULE';
    if (chess.isStalemate()) {
      reason = 'STALEMATE';
    } else if (chess.isThreefoldRepetition()) {
      reason = 'REPETITION';
    } else if (chess.isInsufficientMaterial()) {
      reason = 'INSUFFICIENT MATERIAL';
    }
    return `DRAW - ${reason}`;
  } else {
    return 'UNKNOWN REASON';
  }
}