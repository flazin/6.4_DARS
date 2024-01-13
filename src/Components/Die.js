export default function Die(props){
    let background = {
        backgroundColor: props.isHeld ? "#59E391": "white"
    }

    return(
    <div className="die"
        style={background} 
        onClick={props.holdDice}
    >
        <span>{props.value}</span>
    </div>
    )
}