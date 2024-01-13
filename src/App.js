import React from 'react';
import Die from './Components/Die';
import { nanoid } from 'nanoid';
import Confetti from 'react-confetti';
import {Howl} from 'howler';
import winSound from './audio/win.mp3';
import rollSound from './audio/roll.mp3';
import holdSound from './audio/hold.mp3';

export default function App(){
  const [dice, setDice] = React.useState(generateNewDice());
  const [tenzies, setTenzies] = React.useState(false);
  const [audio, setAudio] = React.useState(true);
  const [rollCount, setRollCount] = React.useState(0);
  const [timer, setTimer] = React.useState(0);
  const [timerRunning, setTimerRunning] = React.useState(false);

  function holdDieObject(){
    return {
      value: Math.floor(Math.random()*6) + 1,
      isHeld: false,
      id: nanoid()
    }
  }

  function generateNewDice(){
    let newDice= [];
    for(let i=0; i<10; i++){
      newDice.push(holdDieObject());
    }
    return newDice;
  }

  React.useEffect(()=>{  //Count time per 10 milliseconds when timer is running
    let interval;
    if(timerRunning){
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 10)
      }, 10)
    }else{
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  },[timerRunning])

  React.useEffect(()=>{   //Check all the dice are matched or not
    const someDiceHeld = dice.some(die => die.isHeld);
    const allDiceHeld = dice.every(die => die.isHeld);
    const firstDiceValue = dice[0].value;
    const allSameValue = dice.every(die=> die.value === firstDiceValue);

    if(someDiceHeld){
      setTimerRunning(true);
    }

    if(allDiceHeld && allSameValue){
      setTenzies(true);
      // audio && victorySound.play();      // This brings up dependency warning. So move it to the bottom
      setTimerRunning(false)
    }
  },[dice])
  
  const victorySound = new Howl({
    src: [winSound]
  })

  if(tenzies){
    audio && victorySound.play();          // Here
  }

  const rollDieSound = new Howl({
    src: [rollSound]
  })

  const holdDieSound = new Howl({
    src: [holdSound]
  })

  function holdDice(id){
    audio && holdDieSound.play();
    setDice(oldDice => oldDice.map(die =>{
      return die.id===id ?
            {
              ...die,
              isHeld: !die.isHeld
            } :
            die;
    }))
  }

  function rollDice(){
    if(!tenzies){
      setDice(oldDice => oldDice.map(die=>{
        audio && rollDieSound.play();
        return die.isHeld ? die : holdDieObject();
      }))
      setRollCount(prevCount => prevCount + 1);
    }else{
      setTenzies(false);
      setDice(generateNewDice());
      setRollCount(0);
      setTimer(0);
    }
  }

  function toggleMute(){
    setAudio(prevState => !prevState);
  }

  function startNewGame(){
    setTenzies(false);
    setDice(generateNewDice());
  }

  const minutes = <span>{("0" + Math.floor((timer / 60000) % 60)).slice(-2)}</span>
  const seconds = <span>{("0" + Math.floor((timer / 1000) % 60)).slice(-2)}</span>
  const milliseconds = <span>{("0" + ((timer / 10) % 100)).slice(-2)}</span>


  const dieElements = dice.map((die) => {
    return <Die key={die.id}
                value={die.value} 
                isHeld={die.isHeld}
                holdDice={()=> holdDice(die.id)}
            />
  })

  return(
    <div>
      <main className="board">
        <button onClick={toggleMute} className="mute-btn">{audio ? "🔉" : "🔇"}</button>
          <h1>Tenzies</h1>
          <p>Roll untill the dice are the same. Click each die to freeze it at its current value between rolls.</p>
          <div className="die-container">
            {dieElements}
          </div>
          <button onClick={rollDice}>Roll</button>
          
          {tenzies && <div className="scoreboard">
            <h2>Congratulations!</h2>
            <p className='rollCount'>Rolled: {rollCount}</p>
            <p className="rolltime">Time Taken: {minutes}:{seconds}:{milliseconds}</p>
            <h3>Your Score: 4500</h3>
            <button className='close' onClick={startNewGame}>New Game</button>
          </div>}
      </main>
      {tenzies && <Confetti className="confetti" recycle={false} />}
    </div>
  )
}